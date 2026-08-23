import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    // Yesterday at exactly 00:00:00.000Z
    const yesterday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));

    const targetQuiz = await prisma.quiz.findUnique({
      where: { dailyDate: yesterday },
    });

    if (!targetQuiz) {
      return NextResponse.json({ message: "No daily quiz found for yesterday." });
    }

    // Fetch official, completed attempts
    const validAttempts = await prisma.attempt.findMany({
      where: {
        quizId: targetQuiz.id,
        isFirstDailyAttempt: true,
        completedAt: { not: null },
      },
      select: {
        id: true,
        userId: true,
        score: true,
        totalTimeMs: true,
      }
    });

    if (validAttempts.length === 0) {
      return NextResponse.json({ message: "No completed attempts found to evaluate." });
    }

    // Sort by score DESC, then totalTimeMs ASC, then userId ASC (for complete determinism)
    validAttempts.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      
      const timeA = a.totalTimeMs ?? Infinity;
      const timeB = b.totalTimeMs ?? Infinity;
      if (timeA !== timeB) return timeA - timeB;
      
      return a.userId.localeCompare(b.userId);
    });

    const totalParticipants = validAttempts.length;
    
    // Assign ranks (handling ties properly)
    let currentRank = 1;
    const rankedResults: any[] = [];
    
    for (let i = 0; i < validAttempts.length; i++) {
      const attempt = validAttempts[i];
      
      // If not the first one, check if we tied with the previous person
      if (i > 0) {
        const prev = validAttempts[i - 1];
        const timeA = attempt.totalTimeMs ?? Infinity;
        const timePrev = prev.totalTimeMs ?? Infinity;
        if (attempt.score < prev.score || timeA > timePrev) {
          currentRank = i + 1;
        }
      }

      // 1 - (rank - 1) / totalUsers
      const percentile = totalParticipants > 0 
        ? 1 - ((currentRank - 1) / totalParticipants) 
        : 0;

      rankedResults.push({
        id: `ldr_${targetQuiz.id}_${attempt.userId}`,
        userId: attempt.userId,
        quizId: targetQuiz.id,
        attemptId: attempt.id,
        date: yesterday,
        rank: currentRank,
        percentile,
        score: attempt.score,
        totalTimeMs: attempt.totalTimeMs ?? 0,
        totalParticipants,
      });
    }

    // Idempotent insertion via transaction
    await prisma.$transaction(async (tx) => {
      await tx.dailyLeaderboardResult.deleteMany({
        where: { quizId: targetQuiz.id },
      });

      await tx.dailyLeaderboardResult.createMany({
        data: rankedResults,
      });
    });

    return NextResponse.json({
      success: true,
      evaluatedUsers: totalParticipants,
      quizId: targetQuiz.id,
    });

  } catch (error) {
    console.error("Daily quiz evaluation cron failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
