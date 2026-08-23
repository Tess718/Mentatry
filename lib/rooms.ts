import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { checkAndAwardAchievements } from "@/lib/achievements";
import { calculateAnswerPoints } from "@/lib/scoring";
import { pushToRelay } from "@/lib/relay";

/**
 * Finalizes a room by aggregating Attempts.
 * Uses an atomic update to prevent race conditions.
 * This is an internal server-only helper (not a Server Action).
 */
export async function finalizeRoom(roomId: string) {
  // 1. Atomic Guard: only transition from ACTIVE to COMPLETED.
  // If count === 0, another poll/request already finalized it.
  const updateResult = await prisma.room.updateMany({
    where: { id: roomId, status: "ACTIVE" },
    data: { status: "COMPLETED", endedAt: new Date() },
  });

  if (updateResult.count === 0) {
    // Already finalized or not ACTIVE. Return early.
    return { success: true, alreadyFinalized: true };
  }

  // 2. Clear/Update Redis (fail-open)
  if (redis) {
    try {
      const state = (await redis.get(`room:${roomId}`)) as Record<string, unknown> | null;
      if (state) {
        state.status = "COMPLETED";
        await redis.set(`room:${roomId}`, state);
      }
    } catch (e) {
      console.warn("Failed to update Redis on finalizeRoom", e);
    }
  }

  // 3. Fetch data for aggregation
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      quiz: { include: { questions: true } },
      participants: true,
      answers: true,
    },
  });

  if (!room) return { error: "Room not found." };
  if (room.isGuestMode) return { success: true };

  // Aggregate Attempts for EVERY participant
  // Even if they dropped off and answered 0 questions, we create an attempt
  const { quiz, participants, answers } = room;
  const totalQuestions = quiz.questions.length;
  const timeAllowanceMs = quiz.timeLimitMinutes
    ? (quiz.timeLimitMinutes * 60 * 1000) / totalQuestions
    : 15000;

  for (const participant of participants) {
    // Find all answers submitted by this specific user in this room
    const userAnswers = answers.filter((a) => a.userId === participant.userId);

    let score = 0;
    let currentStreak = 0;
    const attemptAnswersToCreate = [];

    for (const q of quiz.questions) {
      const uAns = userAnswers.find((a) => a.questionId === q.id);
      const isCorrect = uAns ? uAns.selectedOption === q.correctIndex : false;

      if (isCorrect) {
        currentStreak++;
      } else {
        currentStreak = 0;
      }

      const points = calculateAnswerPoints(
        isCorrect,
        uAns?.timeTakenMs ?? null,
        timeAllowanceMs,
        currentStreak
      );
      score += points;

      if (uAns) {
        attemptAnswersToCreate.push({
          questionId: q.id,
          selectedIndex: uAns.selectedOption,
          isCorrect,
          timeTakenMs: uAns.timeTakenMs,
        });
      }
    }

    // Create the final Attempt record
    await prisma.attempt.create({
      data: {
        userId: participant.userId,
        quizId: quiz.id,
        roomId: room.id,
        score,
        totalQuestions,
        completedAt: new Date(),
        answers: {
          create: attemptAnswersToCreate,
        },
      },
    });

    // Check and award achievements asynchronously for each participant
    try {
      await checkAndAwardAchievements(participant.userId);
    } catch (err) {
      console.error("Failed to award achievements for user", participant.userId, err);
    }
  }

  // Push event to relay
  await pushToRelay(roomId, {
    type: "phase_change",
    phase: "COMPLETED",
    status: "COMPLETED",
  });

  return { success: true };
}
