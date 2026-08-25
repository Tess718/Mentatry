import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: quizId } = await params;

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: { id: true, isDailyQuiz: true, ownerId: true, status: true, dailyDate: true, isPublic: true },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const isOwner = quiz.ownerId === userId;
    if (quiz.status !== "PUBLISHED" && !isOwner) {
      return NextResponse.json({ error: "Quiz is not published" }, { status: 403 });
    }

    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    if (quiz.isDailyQuiz && quiz.dailyDate && quiz.dailyDate.getTime() > todayUTC.getTime() && !isOwner) {
      return NextResponse.json({ error: "Daily quiz is not available yet" }, { status: 403 });
    }

    if (!isOwner && !quiz.isDailyQuiz && !quiz.isPublic) {
      const access = await prisma.quizAccess.findUnique({
        where: {
          quizId_userId: {
            quizId,
            userId,
          },
        },
      });
      if (!access) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    // Only create an early attempt record for daily quizzes to track server-side time and lock the first attempt
    if (quiz.isDailyQuiz) {
      // Use a transaction to securely assign `isFirstDailyAttempt`
      const attempt = await prisma.$transaction(async (tx) => {
        const hasFirst = await tx.attempt.findFirst({
          where: { quizId, userId },
          select: { id: true },
        });

        const isFirst = !hasFirst;

        return tx.attempt.create({
          data: {
            quizId,
            userId,
            score: 0,
            totalQuestions: 0, // Will be updated on submit
            isFirstDailyAttempt: isFirst,
            // startedAt defaults to now()
          },
        });
      });

      return NextResponse.json({ success: true, attemptId: attempt.id });
    }

    // Not a daily quiz, no-op start. The regular attempt will be created on submit as usual.
    return NextResponse.json({ success: true, message: "Not a daily quiz. Attempt will be created on submit." });

  } catch (error) {
    console.error("Error starting quiz:", error);
    return NextResponse.json({ error: "Failed to start quiz" }, { status: 500 });
  }
}
