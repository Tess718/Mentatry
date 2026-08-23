import { prisma } from "./prisma";

export async function checkAndAwardAchievements(userId: string) {
  // 1. Fetch unearned achievements for this user
  const unearned = await prisma.achievement.findMany({
    where: {
      earnedBy: {
        none: { userId },
      },
    },
  });

  if (unearned.length === 0) return [];

  const newlyEarned = [];

  // We need some aggregate stats to evaluate the criteria.
  // We'll fetch them lazily as needed, or all at once.
  // Since we don't know which criteria will match, fetching common stats up front is usually fine.
  
  // Aggregate: Quizzes Owned
  const quizzesOwnedCount = await prisma.quiz.count({
    where: { ownerId: userId, status: "PUBLISHED" },
  });

  // Aggregate: Quizzes Joined (as Taker) - ignoring owned quizzes and daily quizzes
  const quizzesJoinedCount = await prisma.quizAccess.count({
    where: {
      userId,
      role: "TAKER",
      quiz: { 
        ownerId: { not: userId },
        isDailyQuiz: false 
      },
    },
  });

  // Aggregate: Total Attempts
  const totalAttempts = await prisma.attempt.count({
    where: { userId },
  });

  // Aggregate: Perfect Scores (fetch scores and total questions to compute in-memory)
  const allAttempts = await prisma.attempt.findMany({
    where: { userId, totalQuestions: { gt: 0 } },
    select: { score: true, totalQuestions: true },
  });

  const perfectScoresCount = allAttempts.filter(a => a.score === a.totalQuestions).length;
  const perfectScoreAttempts = perfectScoresCount > 0;

  // Aggregate: Total Questions Answered
  const totalQuestionsAnswered = await prisma.attemptAnswer.count({
    where: { attempt: { userId } }
  });

  // Aggregate: Daily Streak (count unique calendar days of attempts in UTC)
  const attemptsDates = await prisma.attempt.findMany({
    where: { userId, completedAt: { not: null } },
    select: { completedAt: true },
    orderBy: { completedAt: "desc" },
  });
  
  // Calculate distinct calendar days (UTC to align with daily quiz dates)
  const distinctDays = new Set(
    attemptsDates.map((a) => {
      const d = new Date(a.completedAt!);
      return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
    })
  );
  
  // Calculate longest continuous streak from today/yesterday backwards in UTC
  let currentStreak = 0;
  const now = new Date();
  const todayDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const yesterdayDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));

  const todayStr = `${todayDate.getUTCFullYear()}-${todayDate.getUTCMonth() + 1}-${todayDate.getUTCDate()}`;
  const yesterdayStr = `${yesterdayDate.getUTCFullYear()}-${yesterdayDate.getUTCMonth() + 1}-${yesterdayDate.getUTCDate()}`;

  let checkDate: Date | null = null;
  // If no attempt today, check if streak is intact from yesterday
  if (distinctDays.has(todayStr)) {
    checkDate = new Date(todayDate);
  } else if (distinctDays.has(yesterdayStr)) {
    checkDate = new Date(yesterdayDate);
  }

  if (checkDate) {
    while (true) {
      const checkStr = `${checkDate.getUTCFullYear()}-${checkDate.getUTCMonth() + 1}-${checkDate.getUTCDate()}`;
      if (distinctDays.has(checkStr)) {
        currentStreak++;
        checkDate.setUTCDate(checkDate.getUTCDate() - 1);
      } else {
        break;
      }
    }
  }

interface AchievementCriteria {
  type: string;
  threshold?: number;
  maxSeconds?: number;
}

  // 2. Evaluate criteria
  for (const achievement of unearned) {
    const criteria = achievement.criteria as unknown as AchievementCriteria;
    let earned = false;

    switch (criteria.type) {
      case "attempt_count":
        if (totalAttempts >= (criteria.threshold || 1)) earned = true;
        break;
      case "streak_days":
        if (currentStreak >= (criteria.threshold || 7)) earned = true;
        break;
      case "perfect_score":
        if (perfectScoreAttempts) earned = true;
        break;
      case "perfect_scores_count":
        if (perfectScoresCount >= (criteria.threshold || 50)) earned = true;
        break;
      case "questions_answered":
        if (totalQuestionsAnswered >= (criteria.threshold || 1000)) earned = true;
        break;
      case "quizzes_owned":
        if (quizzesOwnedCount >= (criteria.threshold || 5)) earned = true;
        break;
      case "quizzes_joined_as_taker":
        if (quizzesJoinedCount >= (criteria.threshold || 3)) earned = true;
        break;
      case "speed_correct":
        const fastAnswer = await prisma.attemptAnswer.findFirst({
          where: { 
            attempt: { userId }, 
            isCorrect: true, 
            timeTakenMs: { lte: (criteria.maxSeconds || 5) * 1000 } 
          }
        });
        
        if (fastAnswer) {
           earned = true;
        }
        break;
    }

    if (earned) {
      try {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
          },
        });
        newlyEarned.push(achievement);
      } catch (e) {
        // Ignore P2002 (Unique constraint failed) in case of concurrent awards
        const err = e as { code?: string };
        if (err?.code !== "P2002") {
          console.error("Error awarding achievement", e);
        }
      }
    }
  }

  return newlyEarned;
}
