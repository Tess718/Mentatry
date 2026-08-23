"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const questionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, "Question text is required"),
  options: z.array(z.string()).length(4, "Must have exactly 4 options"),
  correctIndex: z.number().min(0).max(3),
  explanation: z.string().nullable().optional(),
});

const updateQuizSchema = z.object({
  quizId: z.string(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  timeLimitMinutes: z.number().nullable(),
  questions: z.array(questionSchema).min(1, "Must have at least one question"),
  publish: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

export async function updateQuizAction(payload: z.infer<typeof updateQuizSchema>) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized." };
  }

  const validated = updateQuizSchema.safeParse(payload);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { quizId, title, difficulty, timeLimitMinutes, questions, publish, isPublic } = validated.data;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Fetch quiz + existing question IDs in parallel
      const [quiz, existing] = await Promise.all([
        tx.quiz.findUnique({ where: { id: quizId }, select: { ownerId: true } }),
        tx.question.findMany({ where: { quizId }, select: { id: true } }),
      ]);

      if (!quiz) throw new Error("Quiz not found.");
      if (quiz.ownerId !== session.user!.id) throw new Error("Only the owner can edit this quiz.");

      const existingIds = new Set(existing.map((q) => q.id));
      const incomingIds = new Set(
        questions.filter((q) => q.id).map((q) => q.id as string)
      );

      // 2. Build all mutations, then fire them in one parallel batch
      const mutations: Promise<unknown>[] = [];

      // Quiz-level update
      mutations.push(
        tx.quiz.update({
          where: { id: quizId },
          data: {
            title,
            difficulty,
            timeLimitMinutes,
            ...(publish ? { status: "PUBLISHED" } : {}),
            ...(isPublic !== undefined ? { isPublic } : {}),
          },
        })
      );

      // Delete removed questions
      const idsToDelete = [...existingIds].filter((id) => !incomingIds.has(id));
      if (idsToDelete.length > 0) {
        mutations.push(
          tx.question.deleteMany({ where: { id: { in: idsToDelete } } })
        );
      }

      // Update existing / create new questions
      for (let idx = 0; idx < questions.length; idx++) {
        const q = questions[idx];
        const order = idx + 1;
        const data = {
          text: q.text,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation || null,
          order,
        };

        if (q.id && existingIds.has(q.id)) {
          mutations.push(tx.question.update({ where: { id: q.id }, data }));
        } else {
          mutations.push(tx.question.create({ data: { quizId, ...data } }));
        }
      }

      await Promise.all(mutations);
    });

    revalidatePath("/quizzes");
    revalidatePath("/explore");
    revalidatePath(`/quizzes/${quizId}/edit`);

    return { success: true };
  } catch (error: any) {
    if (error.message === "Quiz not found." || error.message?.includes("owner")) {
      return { error: error.message };
    }
    console.error("Failed to update quiz:", error);
    return { error: "Failed to save quiz changes." };
  }
}
