"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { quizRatelimit } from "@/lib/ratelimit";
import { generateQuizWithAI } from "@/lib/ai";
import { generateJoinCode } from "@/lib/utils";
import { redis } from "@/lib/redis";
import { checkAndAwardAchievements } from "@/lib/achievements";
import {
  topicQuizInputSchema,
  textQuizInputSchema,
  manualQuizInputSchema,
  joinCodeSchema,
  ManualQuizInput,
} from "@/lib/validations/quiz";

export async function generateQuizAction(payload: {
  sourceType: "TOPIC" | "TEXT";
  topic?: string;
  text?: string;
  questionCount: number;
  difficulty: "easy" | "medium" | "hard";
  timeLimitMinutes?: number | null;
  skipReview?: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized. Please log in first." };
  }

  const userId = session.user.id;

  // Validate form input
  let sourceContent = "";
  let validatedTimeLimit: number | null = null;

  if (payload.sourceType === "TOPIC") {
    const validated = topicQuizInputSchema.safeParse({
      topic: payload.topic,
      questionCount: payload.questionCount,
      difficulty: payload.difficulty,
      timeLimitMinutes: payload.timeLimitMinutes ?? 0,
    });
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }
    sourceContent = validated.data.topic;
    validatedTimeLimit = validated.data.timeLimitMinutes ?? null;
  } else {
    const validated = textQuizInputSchema.safeParse({
      text: payload.text,
      questionCount: payload.questionCount,
      difficulty: payload.difficulty,
      timeLimitMinutes: payload.timeLimitMinutes ?? 0,
    });
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }
    sourceContent = validated.data.text;
    validatedTimeLimit = validated.data.timeLimitMinutes ?? null;
  }

  // Rate Limiting Check
  const rateLimitResult = await quizRatelimit.limit(userId);
  if (!rateLimitResult.success) {
    return {
      error: "Rate limit exceeded. Please wait a few minutes before generating more quizzes.",
    };
  }

  // Call Smart AI Generator (with double retry & Zod LLM validation)
  const aiResult = await generateQuizWithAI({
    sourceType: payload.sourceType,
    sourceContent,
    questionCount: payload.questionCount,
    difficulty: payload.difficulty,
  });

  if (!aiResult.success || !aiResult.data) {
    // Graceful fallback to manual creation prefilled with title/difficulty
    const prefillTitle =
      payload.sourceType === "TOPIC"
        ? payload.topic || "My Custom Quiz"
        : "Quiz from Pasted Text";

    return {
      success: false,
      fallbackToManual: true,
      error: "Couldn't generate a valid quiz with AI. You can build this quiz manually instead!",
      prefill: {
        title: prefillTitle,
        difficulty: payload.difficulty,
      },
    };
  }

  const generatedQuiz = aiResult.data;
  const joinCode = generateJoinCode(6);

  // Database transaction: Create Quiz, Owner QuizAccess, and Question records
  const quiz = await prisma.$transaction(
    async (tx) => {
      const newQuiz = await tx.quiz.create({
        data: {
          ownerId: userId,
          title: generatedQuiz.title,
          sourceType: payload.sourceType,
          sourceContent,
          difficulty: payload.difficulty,
          status: payload.skipReview ? "PUBLISHED" : "DRAFT",
          timeLimitMinutes: validatedTimeLimit,
          joinCode,
        },
      });

      await tx.quizAccess.create({
        data: {
          quizId: newQuiz.id,
          userId: userId,
          role: "OWNER",
        },
      });

      await tx.question.createMany({
        data: generatedQuiz.questions.map((q, idx) => ({
          quizId: newQuiz.id,
          text: q.text,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation || null,
          order: idx + 1,
        })),
      });

      return newQuiz;
    },
    {
      maxWait: 10000,
      timeout: 20000,
    }
  );

  revalidatePath("/quizzes");

  return { 
    success: true, 
    quizId: quiz.id, 
    nextUrl: payload.skipReview ? `/quizzes/${quiz.id}/take` : `/quizzes/${quiz.id}/edit` 
  };
}

export async function publishQuizAction(quizId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized." };
  }
  
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz) return { error: "Quiz not found." };
  if (quiz.ownerId !== session.user.id) return { error: "Only the owner can publish this quiz." };
  
  await prisma.quiz.update({
    where: { id: quizId },
    data: { status: "PUBLISHED" },
  });
  
  revalidatePath("/quizzes");
  revalidatePath(`/quizzes/${quizId}/edit`);

  return { success: true };
}

export async function createManualQuizAction(payload: ManualQuizInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized. Please log in first." };
  }

  const userId = session.user.id;
  const validated = manualQuizInputSchema.safeParse(payload);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const joinCode = generateJoinCode(6);
  const validatedTimeLimit = validated.data.timeLimitMinutes ?? null;

  const quiz = await prisma.$transaction(async (tx) => {
    const newQuiz = await tx.quiz.create({
      data: {
        ownerId: userId,
        title: validated.data.title,
        sourceType: "MANUAL",
        sourceContent: null,
        difficulty: validated.data.difficulty,
        status: "DRAFT",
        timeLimitMinutes: validatedTimeLimit,
        joinCode,
      },
    });

    await tx.quizAccess.create({
      data: {
        quizId: newQuiz.id,
        userId: userId,
        role: "OWNER",
      },
    });

    await tx.question.createMany({
      data: validated.data.questions.map((q, idx) => ({
        quizId: newQuiz.id,
        text: q.text,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation || null,
        order: idx + 1,
      })),
    });

    return newQuiz;
  });

  revalidatePath("/quizzes");

  return { success: true, quizId: quiz.id };
}

export type JoinQuizActionState = {
  success?: boolean;
  error?: string;
  errors?: {
    joinCode?: string[];
  };
  quizId?: string;
  fields?: {
    joinCode?: string;
  };
};

export async function joinQuizByCodeAction(
  prevStateOrCode: JoinQuizActionState | string | null,
  formDataOrEmpty?: FormData
): Promise<JoinQuizActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized. Please log in first." };
  }

  const userId = session.user.id;

  let rawJoinCode = "";
  if (formDataOrEmpty instanceof FormData) {
    rawJoinCode = ((formDataOrEmpty.get("joinCode") as string) || "").trim();
  } else if (typeof prevStateOrCode === "string") {
    rawJoinCode = prevStateOrCode.trim();
  } else if (prevStateOrCode instanceof FormData) {
    rawJoinCode = ((prevStateOrCode.get("joinCode") as string) || "").trim();
  }

  const validated = joinCodeSchema.safeParse({ joinCode: rawJoinCode });
  if (!validated.success) {
    return {
      error: validated.error.issues[0].message,
      errors: validated.error.flatten().fieldErrors,
      fields: { joinCode: rawJoinCode },
    };
  }

  const code = validated.data.joinCode;

  const quiz = await prisma.quiz.findUnique({
    where: { joinCode: code },
  });

  if (!quiz) {
    return {
      error: "No quiz found with that join code. Please check and try again.",
      errors: {
        joinCode: ["No quiz found with that join code. Please check and try again."],
      },
      fields: { joinCode: rawJoinCode },
    };
  }

  if (quiz.status !== "PUBLISHED") {
    return {
      error: "This quiz is still in draft mode and cannot be joined yet.",
      errors: {
        joinCode: ["This quiz is still in draft mode and cannot be joined yet."],
      },
      fields: { joinCode: rawJoinCode },
    };
  }

  // Check existing access
  const existingAccess = await prisma.quizAccess.findUnique({
    where: {
      quizId_userId: {
        quizId: quiz.id,
        userId: userId,
      },
    },
  });

  if (!existingAccess) {
    await prisma.quizAccess.create({
      data: {
        quizId: quiz.id,
        userId: userId,
        role: "TAKER",
      },
    });
  }

  return { success: true, quizId: quiz.id };
}

export async function submitAttemptAction(payload: {
  quizId: string;
  userAnswers: Record<string, number>; // questionId -> selectedIndex
  startedAt?: string; // ISO timestamp of when the quiz was started client-side
  attemptId?: string; // Optional ID for pre-started attempts (Daily Quiz)
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized. Please log in first." };
  }

  const userId = session.user.id;
  const { quizId, userAnswers } = payload;

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!quiz) {
    return { error: "Quiz not found." };
  }

  // Security: only allow taking published quizzes or quizzes owned by the user
  if (quiz.status !== "PUBLISHED" && quiz.ownerId !== userId) {
    return { error: "This quiz cannot be attempted." };
  }

  // Server-side time limit enforcement
  if (quiz.timeLimitMinutes) {
    let serverStartedAtMs: number | null = null;
    if (redis) {
      const cached = await redis.get(`solo:${userId}:${quizId}`);
      if (cached) serverStartedAtMs = Number(cached);
    }
    
    // Fallback to client timestamp if Redis is unavailable or expired
    const startedAtMs = serverStartedAtMs || (payload.startedAt ? new Date(payload.startedAt).getTime() : Date.now());

    const deadlineMs = startedAtMs + quiz.timeLimitMinutes * 60 * 1000;
    const graceMs = 30 * 1000; // 30-second grace period for network latency
    const now = Date.now();

    if (now > deadlineMs + graceMs) {
      return {
        error: `Time's up! The ${quiz.timeLimitMinutes}-minute time limit has expired. Your answers were not recorded.`,
      };
    }

    if (redis) {
      await redis.del(`solo:${userId}:${quizId}`);
    }
  }

  const isOwner = quiz.ownerId === userId;

  // Authorization Check: Non-owners cannot submit attempts for draft quizzes
  if (quiz.status !== "PUBLISHED" && !isOwner) {
    return { error: "This quiz is not published." };
  }

  // Authorization Check: Future daily quizzes cannot be attempted in advance
  const nowUtc = new Date();
  const todayUTC = new Date(Date.UTC(nowUtc.getUTCFullYear(), nowUtc.getUTCMonth(), nowUtc.getUTCDate()));
  if (quiz.isDailyQuiz && quiz.dailyDate && quiz.dailyDate.getTime() > todayUTC.getTime() && !isOwner) {
    return { error: "This daily quiz is not available yet." };
  }

  // Check access row
  const access = await prisma.quizAccess.findUnique({
    where: {
      quizId_userId: {
        quizId,
        userId,
      },
    },
  });

  // Authorization Check: Non-owners must have QuizAccess (joined via code), or be taking a Daily / Public Explore Quiz
  if (!isOwner && !quiz.isDailyQuiz && !quiz.isPublic && !access) {
    return { error: "Unauthorized. You must enter a join code to access this private quiz." };
  }

  // Ensure access row exists for authorized players
  if (!access) {
    await prisma.quizAccess.create({
      data: {
        quizId,
        userId,
        role: isOwner ? "OWNER" : "TAKER",
      },
    });
  }

  // Server-side scoring computation: NEVER trust client-reported score!
  let correctCount = 0;
  const answerRecords: { questionId: string; selectedIndex: number; isCorrect: boolean }[] = [];

  for (const question of quiz.questions) {
    const selectedIndex = userAnswers[question.id] ?? -1;
    const isCorrect = selectedIndex === question.correctIndex;
    if (isCorrect) {
      correctCount++;
    }
    answerRecords.push({
      questionId: question.id,
      selectedIndex,
      isCorrect,
    });
  }

  // Save Attempt and AttemptAnswer records
  const attempt = await prisma.$transaction(async (tx) => {
    let targetAttemptId: string;
    
    if (payload.attemptId) {
      const existing = await tx.attempt.findUnique({
        where: { id: payload.attemptId }
      });
      if (!existing || existing.userId !== userId || existing.quizId !== quizId || existing.completedAt) {
        throw new Error("Invalid or already completed attempt.");
      }
      targetAttemptId = existing.id;
      const totalTimeMs = Math.max(0, Date.now() - existing.startedAt.getTime());
      
      await tx.attempt.update({
        where: { id: targetAttemptId },
        data: {
          score: correctCount,
          totalQuestions: quiz.questions.length,
          completedAt: new Date(),
          totalTimeMs
        }
      });
    } else {
      const newAttempt = await tx.attempt.create({
        data: {
          quizId,
          userId,
          score: correctCount,
          totalQuestions: quiz.questions.length,
          completedAt: new Date(),
        },
      });
      targetAttemptId = newAttempt.id;
    }

    await tx.attemptAnswer.createMany({
      data: answerRecords.map((a) => ({
        attemptId: targetAttemptId,
        questionId: a.questionId,
        selectedIndex: a.selectedIndex,
        isCorrect: a.isCorrect,
      })),
    });

    return { id: targetAttemptId };
  });

  // Check and award achievements asynchronously
  try {
    await checkAndAwardAchievements(userId);
  } catch (err) {
    console.error("Failed to award achievements for user", userId, err);
  }

  return { success: true, attemptId: attempt.id };
}

export async function regenerateJoinCodeAction(quizId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized." };
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
  });

  if (!quiz || quiz.ownerId !== session.user.id) {
    return { error: "Only the quiz owner can regenerate join codes." };
  }

  const newJoinCode = generateJoinCode(6);
  await prisma.quiz.update({
    where: { id: quizId },
    data: { joinCode: newJoinCode },
  });

  revalidatePath("/quizzes");
  revalidatePath(`/quizzes/${quizId}/insights`);

  return { success: true, joinCode: newJoinCode };
}

export async function deleteQuizAction(quizId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized. Please log in first." };
  }

  const userId = session.user.id;

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
  });

  if (!quiz) {
    return { error: "Quiz not found." };
  }

  if (quiz.ownerId !== userId) {
    return { error: "Only the quiz owner can delete this quiz." };
  }

  // Delete quiz (Prisma cascade relations will clean up questions, attempts, answers, and access records)
  await prisma.quiz.delete({
    where: { id: quizId },
  });

  revalidatePath("/quizzes");

  return { success: true };
}

export async function toggleQuizVisibilityAction(quizId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized. Please log in first." };
  }

  const userId = session.user.id;

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
  });

  if (!quiz) {
    return { error: "Quiz not found." };
  }

  if (quiz.ownerId !== userId) {
    return { error: "Only the quiz owner can change visibility." };
  }

  const updated = await prisma.quiz.update({
    where: { id: quizId },
    data: { isPublic: !quiz.isPublic },
  });

  revalidatePath("/quizzes");
  revalidatePath("/explore");
  revalidatePath(`/quizzes/${quizId}/edit`);

  return { success: true, isPublic: updated.isPublic };
}
