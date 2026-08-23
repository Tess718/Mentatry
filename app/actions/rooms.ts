"use server";

import { auth } from "@/auth";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { generateJoinCode } from "@/lib/utils";
import { redis } from "@/lib/redis";
import { checkAndAwardAchievements } from "@/lib/achievements";
import { calculateAnswerPoints } from "@/lib/scoring";
import { pushToRelay } from "@/lib/relay";
import { joinRatelimit, roomJoinRatelimit, answerRatelimit } from "@/lib/ratelimit";
import { finalizeRoom } from "@/lib/rooms";

function getClientIp(headersList: Headers): string {
  const xForwardedFor = headersList.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }
  return headersList.get("x-real-ip") ?? "127.0.0.1";
}

const MAX_JOIN_CODE_RETRIES = 5;

/** Creates a live room for a given PUBLISHED quiz */
export async function createRoomAction(quizId: string, maxParticipants?: number, isGuestMode: boolean = false, autoAdvance: boolean = false) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized." };
  
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz) return { error: "Quiz not found." };
  if (quiz.ownerId !== session.user.id && !quiz.isPublic) {
    return { error: "Only the quiz owner can host a live room for private quizzes." };
  }
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
          isGuestMode,
          autoAdvance,
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
            autoAdvance,
            currentPhase: null,
            currentQuestionIndex: 0,
            phaseStartedAt: null,
            answerCount: 0,
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

  const headersList = await headers();
  const ip = getClientIp(headersList);
  const { success: ipOk } = await joinRatelimit.limit(ip);
  if (!ipOk) return { error: "Too many join attempts. Please wait a moment." };

  const { success: roomOk } = await roomJoinRatelimit.limit(room.id);
  if (!roomOk) return { error: "This room is receiving too many join requests right now. Please try again in a moment." };

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

  // Push event to relay
  await pushToRelay(room.id, { type: 'join' });

  return { roomId: room.id };
}

/** Checks a room join code and returns its mode */
export async function checkRoomJoinCodeAction(joinCode: string) {
  const room = await prisma.room.findUnique({
    where: { joinCode },
    include: { quiz: true }
  });

  if (!room) return { error: "Invalid join code." };
  if (room.status === "COMPLETED") return { error: "This room has already finished." };
  if (room.status === "EXPIRED") return { error: "This room has expired." };
  if (room.quiz.status !== "PUBLISHED") return { error: "This quiz is not published." };

  return { roomId: room.id, isGuestMode: room.isGuestMode };
}

/** Guest joins a guest-mode room */
export async function joinGuestRoomAction(joinCode: string, displayName: string) {
  if (!displayName.trim()) return { error: "Display name is required." };

  const room = await prisma.room.findUnique({
    where: { joinCode },
    include: { quiz: true }
  });

  if (!room) return { error: "Invalid join code." };
  if (!room.isGuestMode) return { error: "This room does not support guest mode." };
  if (room.status === "COMPLETED") return { error: "This room has already finished." };
  if (room.status === "EXPIRED") return { error: "This room has expired." };
  if (room.status === "ACTIVE") return { error: "This room is already in progress. Late joining is not allowed." };

  const headersList = await headers();
  const ip = getClientIp(headersList);
  const { success: ipOk } = await joinRatelimit.limit(ip);
  if (!ipOk) return { error: "Too many join attempts. Please wait a moment." };

  const { success: roomOk } = await roomJoinRatelimit.limit(room.id);
  if (!roomOk) return { error: "This room is receiving too many join requests right now. Please try again in a moment." };

  const currentCount = await prisma.guestParticipant.count({ where: { roomId: room.id } });
  
  if (currentCount >= room.maxParticipants) {
    return { error: "This room is full." };
  }

  // Create GuestParticipant with a new session token
  const crypto = globalThis.crypto || await import('crypto');
  const sessionToken = crypto.randomUUID();

  await prisma.guestParticipant.create({
    data: {
      roomId: room.id,
      displayName: displayName.trim(),
      sessionToken,
    }
  });

  // Set the cookie scoped to this room
  const cookieStore = await cookies();
  cookieStore.set(`guest_session_${room.id}`, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/`,
    maxAge: 60 * 60 * 24 // 24 hours
  });

  // Push event to relay
  await pushToRelay(room.id, { type: 'join' });

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
  
  let currentPhase = null;
  let phaseStartedAt = null;
  if (room.isGuestMode) {
    currentPhase = "QUESTION_ACTIVE";
    phaseStartedAt = startedAt;
  }

  // Atomic guard: only transition WAITING -> ACTIVE
  const updateResult = await prisma.room.updateMany({
    where: { id: roomId, status: "WAITING" },
    data: { 
      status: "ACTIVE", 
      startedAt,
      currentPhase,
      phaseStartedAt,
      currentQuestionIndex: 0
    },
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
        if (room.isGuestMode) {
          state.currentPhase = "QUESTION_ACTIVE";
          state.phaseStartedAt = startedAt.toISOString();
          state.currentQuestionIndex = 0;
          state.answerCount = 0;
        }
        await redis.set(`room:${roomId}`, state);
      }
    } catch (e) {
      console.warn("Failed to update Redis on startRoom", e);
    }
  }

  // Push event to relay
  await pushToRelay(roomId, { type: 'phase_change', phase: currentPhase || "STARTING", status: "ACTIVE" });

  return { success: true };
}

/** Submit an incremental answer during a live room */
export async function submitLiveAnswerAction(roomId: string, questionId: string, selectedOption: number, timeTakenMs?: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized." };

  const userId = session.user.id;

  const { success: rateLimitOk } = await answerRatelimit.limit(userId);
  if (!rateLimitOk) return { error: "Rate limit exceeded. Please wait a moment before answering." };

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

  // Optimize answer counting via Redis
  if (redis) {
    try {
      const key = `room:${roomId}:q:${questionId}:answers`;
      await redis.incr(key);
      await redis.expire(key, 60 * 60 * 24); // 24 hours
    } catch (e) {
      console.warn("Failed to update redis answer count", e);
    }
  }

  const question = room.quiz.questions.find((q) => q.id === questionId);
  const isCorrect = question ? question.correctIndex === selectedOption : false;

  // Push event to relay
  await pushToRelay(roomId, { type: 'answer_submitted' });

  return { success: true, isCorrect };
}

/** Submit an incremental answer for a guest during a live room */
export async function submitGuestLiveAnswerAction(roomId: string, questionId: string, selectedOption: number, timeTakenMs?: number) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(`guest_session_${roomId}`)?.value;
  if (!sessionToken) return { error: "Unauthorized. No guest session found." };

  const { success: rateLimitOk } = await answerRatelimit.limit(sessionToken);
  if (!rateLimitOk) return { error: "Rate limit exceeded. Please wait a moment before answering." };

  const room = await prisma.room.findUnique({ where: { id: roomId }, include: { quiz: { include: { questions: true } } } });
  if (!room) return { error: "Room not found." };
  if (!room.isGuestMode) return { error: "This room is not in guest mode." };
  if (room.status !== "ACTIVE" || !room.startedAt) return { error: "Room is not active." };

  const guest = await prisma.guestParticipant.findUnique({
    where: { sessionToken }
  });
  if (!guest || guest.roomId !== roomId) return { error: "Invalid guest session for this room." };

  if (room.quiz.timeLimitMinutes) {
    const deadline = new Date(room.startedAt.getTime() + room.quiz.timeLimitMinutes * 60 * 1000 + 30 * 1000);
    if (new Date() > deadline) {
      return { error: "Time limit exceeded. Answer rejected." };
    }
  }

  try {
    await prisma.guestAnswer.create({
      data: { guestId: guest.id, questionId, selectedOption, timeTakenMs, submittedAt: new Date() },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "You have already submitted an answer for this question." };
    }
    throw error;
  }

  // Optimize answer counting via Redis
  if (redis) {
    try {
      const key = `room:${roomId}:q:${questionId}:answers`;
      await redis.incr(key);
      await redis.expire(key, 60 * 60 * 24); // 24 hours
    } catch (e) {
      console.warn("Failed to update redis answer count", e);
    }
  }

  const question = room.quiz.questions.find((q) => q.id === questionId);
  const isCorrect = question ? question.correctIndex === selectedOption : false;

  // Push event to relay
  await pushToRelay(roomId, { type: 'answer_submitted' });

  return { success: true, isCorrect };
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

// ----------------------------------------------------------------------
// Host Control Actions
// ----------------------------------------------------------------------

export async function advanceToQuestionAction(roomId: string, index: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized." };

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) return { error: "Room not found." };
  if (room.hostId !== session.user.id) return { error: "Only the host can advance the question." };

  const phaseStartedAt = new Date();

  await prisma.room.update({
    where: { id: roomId },
    data: { 
      currentPhase: "QUESTION_ACTIVE",
      currentQuestionIndex: index,
      phaseStartedAt
    }
  });

  if (redis) {
    try {
      const state: any = await redis.get(`room:${roomId}`);
      if (state) {
        state.currentPhase = "QUESTION_ACTIVE";
        state.currentQuestionIndex = index;
        state.phaseStartedAt = phaseStartedAt.toISOString();
        state.answerCount = 0;
        await redis.set(`room:${roomId}`, state);
      }
    } catch (e) {
      console.warn("Redis update failed", e);
    }
  }

  // Push event to relay
  await pushToRelay(roomId, { type: 'phase_change', phase: "QUESTION_ACTIVE", questionIndex: index });

  return { success: true };
}

export async function showResultsAction(roomId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized." };

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) return { error: "Room not found." };
  if (room.hostId !== session.user.id) return { error: "Only the host can show results." };

  const phaseStartedAt = new Date();

  await prisma.room.update({
    where: { id: roomId },
    data: { 
      currentPhase: "QUESTION_RESULTS",
      phaseStartedAt
    }
  });

  if (redis) {
    try {
      const state: any = await redis.get(`room:${roomId}`);
      if (state) {
        state.currentPhase = "QUESTION_RESULTS";
        state.phaseStartedAt = phaseStartedAt.toISOString();
        await redis.set(`room:${roomId}`, state);
      }
    } catch (e) {
      console.warn("Redis update failed", e);
    }
  }

  // Push event to relay
  await pushToRelay(roomId, { type: 'phase_change', phase: "QUESTION_RESULTS" });

  return { success: true };
}

export async function showLeaderboardAction(roomId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized." };

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) return { error: "Room not found." };
  if (room.hostId !== session.user.id) return { error: "Only the host can show leaderboard." };

  const phaseStartedAt = new Date();

  await prisma.room.update({
    where: { id: roomId },
    data: { 
      currentPhase: "LEADERBOARD",
      phaseStartedAt
    }
  });

  if (redis) {
    try {
      const state: any = await redis.get(`room:${roomId}`);
      if (state) {
        state.currentPhase = "LEADERBOARD";
        state.phaseStartedAt = phaseStartedAt.toISOString();
        await redis.set(`room:${roomId}`, state);
      }
    } catch (e) {
      console.warn("Redis update failed", e);
    }
  }

  // Push event to relay
  await pushToRelay(roomId, { type: 'phase_change', phase: "LEADERBOARD" });

  return { success: true };
}
