"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateJoinCode } from "@/lib/utils";
import { redis } from "@/lib/redis";
import { checkAndAwardAchievements } from "@/lib/achievements";

const MAX_JOIN_CODE_RETRIES = 5;

/** Creates a live room for a given PUBLISHED quiz */
export async function createRoomAction(quizId: string, maxParticipants?: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized." };
  
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz) return { error: "Quiz not found." };
  if (quiz.ownerId !== session.user.id) return { error: "Only the owner can host a live room." };
  if (quiz.status !== "PUBLISHED") return { error: "Cannot host a room for a draft quiz. Please publish it first." };

  // Live rooms require a time limit so auto-finalization can work
  if (!quiz.timeLimitMinutes) {
    return { error: "Live rooms require a time limit. Please edit the quiz and set one before hosting." };
  }

  let cap = maxParticipants !== undefined ? maxParticipants : 50;
  if (Number.isNaN(cap)) cap = 50;
  if (cap < 2) cap = 2;
  if (cap > 200) cap = 200;

  // Retry joinCode generation in case of (unlikely) collision
  for (let attempt = 0; attempt < MAX_JOIN_CODE_RETRIES; attempt++) {
    const joinCode = generateJoinCode(6);
    try {
      const room = await prisma.room.create({
        data: {
          quizId,
          hostId: session.user.id,
          joinCode,
          maxParticipants: cap,
          status: "WAITING",
        },
      });

      // Initialize Redis Cache for polling (status/timing only, not participants)
      if (redis) {
        try {
          await redis.set(`room:${room.id}`, {
            status: "WAITING",
            startedAt: null,
            createdAt: room.createdAt.toISOString(),
            timeLimitMinutes: quiz.timeLimitMinutes,
          });
          await redis.expire(`room:${room.id}`, 60 * 60 * 24);
        } catch (e) {
          console.warn("Failed to initialize Redis cache for room", e);
        }
      }

      return { roomId: room.id };
    } catch (error: any) {
      // If unique constraint violation on joinCode, retry
      if (error?.code === "P2002" && attempt < MAX_JOIN_CODE_RETRIES - 1) {
        continue;
      }
      throw error;
    }
  }

  return { error: "Failed to generate a unique join code. Please try again." };
}

/** Taker joins a room using a join code */
export async function joinRoomAction(joinCode: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized." };
  const userId = session.user.id;

  const room = await prisma.room.findUnique({ where: { joinCode }, include: { quiz: true } });
  if (!room) return { error: "Invalid join code." };
  if (room.status === "COMPLETED") return { error: "This room has already finished." };
  if (room.status === "EXPIRED") return { error: "This room has expired." };
  if (room.status === "ACTIVE") return { error: "This room is already in progress. Late joining is not allowed." };
  if (room.quiz.status !== "PUBLISHED") return { error: "This quiz is not published." };

  const existingParticipant = await prisma.roomParticipant.findUnique({
    where: { roomId_userId: { roomId: room.id, userId } },
  });

  if (!existingParticipant) {
    const currentCount = await prisma.roomParticipant.count({ where: { roomId: room.id } });
    if (currentCount >= room.maxParticipants) {
      return { error: "This room is full." };
    }
  }

  // Upsert participant in Postgres (authoritative)
  await prisma.roomParticipant.upsert({
    where: { roomId_userId: { roomId: room.id, userId } },
    update: {},
    create: { roomId: room.id, userId },
  });

  return { roomId: room.id };
}

/** Host explicitly joins as a player too */
export async function joinAsPlayerAction(roomId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized." };
  
  const userId = session.user.id;
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) return { error: "Room not found." };
  if (room.hostId !== userId) return { error: "Only the host can use this action." };

  const existingParticipant = await prisma.roomParticipant.findUnique({
    where: { roomId_userId: { roomId, userId } },
  });

  if (!existingParticipant) {
    const currentCount = await prisma.roomParticipant.count({ where: { roomId: room.id } });
    if (currentCount >= room.maxParticipants) {
      return { error: "This room is full." };
    }
  }

  await prisma.roomParticipant.upsert({
    where: { roomId_userId: { roomId, userId } },
    update: {},
    create: { roomId, userId },
  });

  return { success: true };
}

/** Host starts the room — atomic guard prevents double-start / timer reset */
export async function startRoomAction(roomId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized." };

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) return { error: "Room not found." };
  if (room.hostId !== session.user.id) return { error: "Only the host can start." };

  const startedAt = new Date();

  // Atomic guard: only transition WAITING -> ACTIVE
  const updateResult = await prisma.room.updateMany({
    where: { id: roomId, status: "WAITING" },
    data: { status: "ACTIVE", startedAt },
  });

  if (updateResult.count === 0) {
    return { error: "Room has already been started or is no longer in the waiting state." };
  }

  if (redis) {
    try {
      const state: any = await redis.get(`room:${roomId}`);
      if (state) {
        state.status = "ACTIVE";
        state.startedAt = startedAt.toISOString();
        await redis.set(`room:${roomId}`, state);
      }
    } catch (e) {
      console.warn("Failed to update Redis on startRoom", e);
    }
  }

  return { success: true };
}

/** Submit an incremental answer during a live room */
export async function submitLiveAnswerAction(roomId: string, questionId: string, selectedOption: number, timeTakenMs?: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized." };

  const userId = session.user.id;

  const room = await prisma.room.findUnique({ where: { id: roomId }, include: { quiz: { include: { questions: true } } } });
  if (!room) return { error: "Room not found." };
  if (room.status !== "ACTIVE" || !room.startedAt) return { error: "Room is not active." };

  // Verify user is actually a participant of this room
  const membership = await prisma.roomParticipant.findUnique({
    where: { roomId_userId: { roomId, userId } },
  });
  if (!membership) return { error: "You are not a participant of this room." };

  // Hard Server-Side Deadline Check
  if (room.quiz.timeLimitMinutes) {
    const deadline = new Date(room.startedAt.getTime() + room.quiz.timeLimitMinutes * 60 * 1000 + 30 * 1000); // 30s grace
    if (new Date() > deadline) {
      return { error: "Time limit exceeded. Answer rejected." };
    }
  }

  try {
    await prisma.roomAnswer.create({
      data: { roomId, userId, questionId, selectedOption, timeTakenMs, submittedAt: new Date() },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "You have already submitted an answer for this question." };
    }
    throw error;
  }

  const question = room.quiz.questions.find((q) => q.id === questionId);
  const isCorrect = question ? question.correctIndex === selectedOption : false;

  return { success: true, isCorrect };
}

/** Finalizes a room by aggregating Attempts. Uses an atomic update to prevent race conditions. */
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
      const state: any = await redis.get(`room:${roomId}`);
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

  // Aggregate Attempts for EVERY participant
  // Even if they dropped off and answered 0 questions, we create an attempt
  const { quiz, participants, answers } = room;
  const totalQuestions = quiz.questions.length;

  for (const participant of participants) {
    // Find all answers submitted by this specific user in this room
    const userAnswers = answers.filter(a => a.userId === participant.userId);

    let score = 0;
    const attemptAnswersToCreate = [];

    for (const q of quiz.questions) {
      const uAns = userAnswers.find(a => a.questionId === q.id);
      const isCorrect = uAns ? uAns.selectedOption === q.correctIndex : false;
      if (isCorrect) score++;

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

  return { success: true };
}

/** Host ends the room, locking it and aggregating Attempts */
export async function endRoomAction(roomId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized." };

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { hostId: true, status: true },
  });

  if (!room) return { error: "Room not found." };
  if (room.hostId !== session.user.id) return { error: "Only the host can end." };
  if (room.status === "COMPLETED") return { error: "Room already completed." };

  return finalizeRoom(roomId);
}
