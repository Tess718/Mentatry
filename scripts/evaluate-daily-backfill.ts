import { prisma } from "../lib/prisma";

async function main() {
  console.log("Running self-healing daily leaderboard evaluation for past quizzes...\n");

  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  // Find all past daily quizzes up to yesterday
  const pastQuizzes = await prisma.quiz.findMany({
    where: {
      isDailyQuiz: true,
      dailyDate: {
        lt: todayUTC,
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

  console.log(`Found ${pastQuizzes.length} past daily quizzes.`);

  let totalEvaluated = 0;

  for (const quiz of pastQuizzes) {
    if (!quiz.dailyDate) continue;
    const validAttempts = quiz.attempts;

    if (validAttempts.length === 0) {
      continue;
    }

    console.log(`Evaluating "${quiz.title}" (${quiz.dailyDate.toISOString().split("T")[0]}) with ${validAttempts.length} attempt(s)...`);

    // Sort attempts by score DESC, timeMs ASC, userId ASC
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

    await prisma.$transaction(async (tx) => {
      await tx.dailyLeaderboardResult.deleteMany({
        where: { quizId: quiz.id },
      });

      await tx.dailyLeaderboardResult.createMany({
        data: rankedResults,
      });
    });

    totalEvaluated += rankedResults.length;
    console.log(` -> Successfully saved ${rankedResults.length} leaderboard rank(s) for ${quiz.dailyDate.toISOString().split("T")[0]}!`);
  }

  console.log(`\nEvaluation complete! Total ranks computed: ${totalEvaluated}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
