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

  // Aggregate: Quizzes Joined (as Taker) - ignoring owned quizzes
  const quizzesJoinedCount = await prisma.quizAccess.count({
    where: {
      userId,
      role: "TAKER",
      quiz: { ownerId: { not: userId } },
    },
  });

  // Aggregate: Total Attempts
  const totalAttempts = await prisma.attempt.count({
    where: { userId },
  });

  // Aggregate: Perfect Scores (at least one)
  const perfectScoreAttempts = await prisma.attempt.findFirst({
    where: { 
      userId, 
      totalQuestions: { gt: 0 },
      score: { equals: prisma.attempt.fields.totalQuestions } 
    },
  });

  // Aggregate: Perfect Scores (count)
  const perfectScoresCount = await prisma.attempt.count({
    where: { 
      userId, 
      totalQuestions: { gt: 0 },
      score: { equals: prisma.attempt.fields.totalQuestions } 
    },
  });

  // Aggregate: Total Questions Answered
  const totalQuestionsAnswered = await prisma.attemptAnswer.count({
    where: { attempt: { userId } }
  });

  // Aggregate: Daily Streak (count unique calendar days of attempts)
  const attemptsDates = await prisma.attempt.findMany({
    where: { userId },
    select: { completedAt: true },
    orderBy: { completedAt: "desc" },
  });
  
  // Calculate distinct calendar days (local time approximation via JS Date string manipulation)
  const distinctDays = new Set(
    attemptsDates.map((a) => {
      const d = new Date(a.completedAt);
      return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    })
  );
  
  // Calculate longest continuous streak from today/yesterday backwards
  let currentStreak = 0;
  const todayDate = new Date();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(todayDate.getDate() - 1);

  const todayStr = `${todayDate.getFullYear()}-${todayDate.getMonth() + 1}-${todayDate.getDate()}`;
  const yesterdayStr = `${yesterdayDate.getFullYear()}-${yesterdayDate.getMonth() + 1}-${yesterdayDate.getDate()}`;

  let checkDate = new Date();
  // If no attempt today, maybe the streak is just resting on yesterday
  if (distinctDays.has(todayStr)) {
    checkDate = todayDate;
  } else if (distinctDays.has(yesterdayStr)) {
    checkDate = yesterdayDate;
  } else {
    // Break in streak, current is 0 (or just the latest day if we were computing max, but this is current streak)
    checkDate = null as any; 
  }

  if (checkDate) {
    while (true) {
      const checkStr = `${checkDate.getFullYear()}-${checkDate.getMonth() + 1}-${checkDate.getDate()}`;
      if (distinctDays.has(checkStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // 2. Evaluate criteria
  for (const achievement of unearned) {
    const criteria = achievement.criteria as any;
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
        // Fallback evaluation for "Speed Demon":
        // Since our database schema doesn't currently track the exact timestamp each individual question 
        // is displayed to the users by the host, we can't reliably measure the time between "question shown" 
        // and "answer submitted" for every question.
        // As a temporary workaround, we measure speed on the FIRST question by comparing the answer's 
        // submittedAt timestamp to the room's startedAt timestamp.
        const fastFirstQuestion = await prisma.roomAnswer.findFirst({
          where: { userId },
          include: { room: true }
        });
        
        if (fastFirstQuestion && fastFirstQuestion.room.startedAt) {
           const diff = fastFirstQuestion.submittedAt.getTime() - fastFirstQuestion.room.startedAt.getTime();
           if (diff <= criteria.maxSeconds * 1000) {
             // We still need to know if it's correct!
             // We'd have to join Question.
             const q = await prisma.question.findUnique({ where: { id: fastFirstQuestion.questionId }});
             if (q && q.correctIndex === fastFirstQuestion.selectedOption) {
                earned = true;
             }
           }
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
      } catch (e: any) {
        // Ignore P2002 (Unique constraint failed) in case of concurrent awards
        if (e.code !== "P2002") {
          console.error("Error awarding achievement", e);
        }
      }
    }
  }

  return newlyEarned;
}
