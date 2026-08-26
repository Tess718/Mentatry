import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  // Validate cron secret (fail-closed: require CRON_SECRET to be configured and valid)
  const authHeader = req.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const fourteenDaysAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 14));

    // Self-healing: Find all past daily quizzes from the last 14 days up to yesterday
    const pastQuizzes = await prisma.quiz.findMany({
      where: {
        isDailyQuiz: true,
        dailyDate: {
          lt: todayUTC,
          gte: fourteenDaysAgo,
        },
      },
      include: {
        attempts: {
          where: {
            isFirstDailyAttempt: true,
            completedAt: { not: null },
          },
          select: {
            id: true,
            userId: true,
            score: true,
            totalTimeMs: true,
          },
        },
      },
      orderBy: { dailyDate: "desc" },
    });

    if (pastQuizzes.length === 0) {
      return NextResponse.json({ message: "No past daily quizzes found to evaluate." });
    }

    let totalRanksComputed = 0;
    const evaluatedDates: string[] = [];

    for (const quiz of pastQuizzes) {
      if (!quiz.dailyDate) continue;
      const validAttempts = quiz.attempts;

      if (validAttempts.length === 0) {
        continue;
      }

      // Sort by score DESC, then totalTimeMs ASC, then userId ASC (deterministic)
      validAttempts.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const timeA = a.totalTimeMs ?? Infinity;
        const timeB = b.totalTimeMs ?? Infinity;
        if (timeA !== timeB) return timeA - timeB;
        return a.userId.localeCompare(b.userId);
      });

      const totalParticipants = validAttempts.length;
      let currentRank = 1;
      const rankedResults: any[] = [];

      for (let i = 0; i < validAttempts.length; i++) {
        const attempt = validAttempts[i];

        if (i > 0) {
          const prev = validAttempts[i - 1];
          const timeA = attempt.totalTimeMs ?? Infinity;
          const timePrev = prev.totalTimeMs ?? Infinity;
          if (attempt.score < prev.score || timeA > timePrev) {
            currentRank = i + 1;
          }
        }

        const percentile = totalParticipants > 0 
          ? 1 - ((currentRank - 1) / totalParticipants) 
          : 0;

        rankedResults.push({
          id: `ldr_${quiz.id}_${attempt.userId}`,
          userId: attempt.userId,
          quizId: quiz.id,
          attemptId: attempt.id,
          date: quiz.dailyDate,
          rank: currentRank,
          percentile,
          score: attempt.score,
          totalTimeMs: attempt.totalTimeMs ?? 0,
          totalParticipants,
        });
      }

      // Idempotent replace
      await prisma.$transaction(async (tx) => {
        await tx.dailyLeaderboardResult.deleteMany({
          where: { quizId: quiz.id },
        });

        await tx.dailyLeaderboardResult.createMany({
          data: rankedResults,
        });
      });

      totalRanksComputed += rankedResults.length;
      evaluatedDates.push(quiz.dailyDate.toISOString().split("T")[0]);
    }

    return NextResponse.json({
      success: true,
      totalRanksComputed,
      evaluatedDates,
    });
  } catch (error) {
    console.error("Daily quiz evaluation cron failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
