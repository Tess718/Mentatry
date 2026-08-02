import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { finalizeRoom } from "@/app/actions/rooms";
import { auth } from "@/auth";
import { cookies } from "next/headers";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: roomId } = await params;
    const session = await auth();
    const cookieStore = await cookies();
    const guestSessionToken = cookieStore.get(`guest_session_${roomId}`)?.value;

    if (!session?.user?.id && !guestSessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Always fetch participants fresh from Postgres (cheap query, prevents lost-update races).
    // Only use Redis for status/timing fields.
    let cachedState: any = null;
    let staticData: any = null;
    if (redis) {
      cachedState = await redis.get(`room:${roomId}`);
      staticData = await redis.get(`room:${roomId}:static`);
    }

    if (!staticData) {
      const roomStatic = await prisma.room.findUnique({
        where: { id: roomId },
        select: {
          maxParticipants: true,
          quiz: {
            select: {
              timeLimitMinutes: true,
              questions: { select: { id: true }, orderBy: { order: "asc" } }
            }
          }
        }
      });
      if (roomStatic) {
        staticData = {
          maxParticipants: roomStatic.maxParticipants,
          timeLimitMinutes: roomStatic.quiz.timeLimitMinutes,
          questionIds: roomStatic.quiz.questions.map(q => q.id)
        };
        if (redis) {
          try {
            await redis.set(`room:${roomId}:static`, staticData);
            await redis.expire(`room:${roomId}:static`, 60 * 60 * 24);
          } catch (e) {
            console.warn("Failed to set static cache", e);
          }
        }
      }
    }

    // Always get dynamic state + participants from Postgres (authoritative)
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: {
        id: true,
        status: true,
        startedAt: true,
        createdAt: true,
        currentPhase: true,
        currentQuestionIndex: true,
        phaseStartedAt: true,
        autoAdvance: true,
        isGuestMode: true,
        hostId: true,
        quizId: true,
        participants: {
          select: { user: { select: { id: true, firstName: true } } }
        },
        guestParticipants: {
          select: { id: true, displayName: true, sessionToken: true }
        }
      }
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Security: Only host or participants can view room status
    let isAuthorized = false;
    
    if (session?.user?.id) {
       const isHost = room.hostId === session.user.id;
       const isParticipant = room.participants.some(p => p.user.id === session.user.id);
       isAuthorized = isHost || isParticipant;
    }
    
    if (guestSessionToken && room.isGuestMode) {
       const isGuestParticipant = room.guestParticipants.some(p => p.sessionToken === guestSessionToken);
       isAuthorized = isAuthorized || isGuestParticipant;
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const participants = room.isGuestMode 
      ? room.guestParticipants.map(p => ({
          id: p.id,
          firstName: p.displayName,
        }))
      : room.participants.map(p => ({
          id: p.user.id,
          firstName: p.user.firstName || "Player",
        }));

    // Get Answer Count - Always use Postgres for exact accuracy to prevent getting stuck
    let answerCount = 0;
    if (room.currentPhase === "QUESTION_ACTIVE") {
      const currentQuestionId = staticData?.questionIds?.[room.currentQuestionIndex];
      if (currentQuestionId) {
        if (room.isGuestMode) {
          answerCount = await prisma.guestAnswer.count({
            where: { 
              guest: { roomId },
              questionId: currentQuestionId 
            }
          });
        } else {
          answerCount = await prisma.roomAnswer.count({
            where: {
              roomId: roomId,
              questionId: currentQuestionId
            }
          });
        }
      }
    }

    // Build state from Redis cache if available, otherwise from Postgres
    const state = {
      status: cachedState?.status || room.status,
      startedAt: cachedState?.startedAt || room.startedAt?.toISOString() || null,
      createdAt: cachedState?.createdAt || room.createdAt.toISOString(),
      timeLimitMinutes: cachedState?.timeLimitMinutes || staticData?.timeLimitMinutes,
      maxParticipants: cachedState?.maxParticipants || staticData?.maxParticipants,
      participants, // Always from Postgres
      // Game State fields
      currentPhase: cachedState?.currentPhase !== undefined ? cachedState?.currentPhase : room.currentPhase,
      currentQuestionIndex: cachedState?.currentQuestionIndex !== undefined ? cachedState?.currentQuestionIndex : room.currentQuestionIndex,
      phaseStartedAt: cachedState?.phaseStartedAt || room.phaseStartedAt?.toISOString() || null,
      autoAdvance: room.autoAdvance, // From Postgres always
      answerCount,
    };

    // Rehydrate Redis if it was missing (status/timing only)
    if (!cachedState && redis) {
      try {
        await redis.set(`room:${roomId}`, {
          status: state.status,
          startedAt: state.startedAt,
          createdAt: state.createdAt,
          timeLimitMinutes: state.timeLimitMinutes,
          maxParticipants: state.maxParticipants,
          currentPhase: state.currentPhase,
          currentQuestionIndex: state.currentQuestionIndex,
          phaseStartedAt: state.phaseStartedAt,
        });
        await redis.expire(`room:${roomId}`, 60 * 60 * 24);
      } catch (e) {
        console.warn("Failed to rehydrate Redis cache", e);
      }
    }

    // --- LAZY EVALUATION ---
    let stateChanged = false;

    // 1. WAITING expiration (30 mins from createdAt)
    if (state.status === "WAITING" && state.createdAt) {
      const ageMs = Date.now() - new Date(state.createdAt).getTime();
      if (ageMs > 30 * 60 * 1000) {
        // Authoritative update in Postgres (atomic guard)
        await prisma.room.updateMany({
          where: { id: roomId, status: "WAITING" },
          data: { status: "EXPIRED" }
        });
        
        state.status = "EXPIRED";
        stateChanged = true;
      }
    }

    // 2. ACTIVE completion (timeLimit + 30s grace)
    if (state.status === "ACTIVE" && state.startedAt && state.timeLimitMinutes) {
      const startMs = new Date(state.startedAt).getTime();
      const limitMs = state.timeLimitMinutes * 60 * 1000;
      const graceMs = 30 * 1000;
      if (Date.now() > startMs + limitMs + graceMs) {
        // Authoritative update and aggregation via shared logic
        await finalizeRoom(roomId);
        state.status = "COMPLETED";
        stateChanged = true;
      }
    }

    // 3. Per-Question Fallback (2 mins past expected duration)
    if (state.status === "ACTIVE" && state.currentPhase === "QUESTION_ACTIVE" && state.phaseStartedAt && state.timeLimitMinutes) {
      const qStartMs = new Date(state.phaseStartedAt).getTime();
      const expectedDurationMs = (state.timeLimitMinutes * 60 * 1000) / (staticData?.questionIds?.length || 1);
      const fallbackGraceMs = 2 * 60 * 1000; // 2 minutes past expected time
      
      if (Date.now() > qStartMs + expectedDurationMs + fallbackGraceMs) {
        // Host abandoned. Auto-advance to results.
        const newPhaseStartedAt = new Date();
        await prisma.room.update({
          where: { id: roomId },
          data: { 
            currentPhase: "QUESTION_RESULTS",
            phaseStartedAt: newPhaseStartedAt
          }
        });
        state.currentPhase = "QUESTION_RESULTS";
        state.phaseStartedAt = newPhaseStartedAt.toISOString();
        stateChanged = true;
      }
    }

    // Update Redis on a best-effort basis (fail-open) if we forcibly transitioned
    if (stateChanged && redis) {
      try {
        await redis.set(`room:${roomId}`, {
          status: state.status,
          startedAt: state.startedAt,
          createdAt: state.createdAt,
          timeLimitMinutes: state.timeLimitMinutes,
          maxParticipants: state.maxParticipants,
          currentPhase: state.currentPhase,
          currentQuestionIndex: state.currentQuestionIndex,
          phaseStartedAt: state.phaseStartedAt,
        });
        await redis.expire(`room:${roomId}`, 60 * 60 * 24);
      } catch (e) {
        console.warn("Failed to update Redis during lazy evaluation", e);
      }
    }
    
    let userAttemptId = null;
    let quizId = room.quizId;
    
    if (state.status === "COMPLETED") {
       if (session?.user?.id) {
         // Query the participant's newest Attempt for this quiz
         const attempt = await prisma.attempt.findFirst({
           where: { userId: session.user.id, quizId: room.quizId },
           orderBy: { completedAt: "desc" }
         });
         if (attempt) {
           userAttemptId = attempt.id;
         }
       } else if (guestSessionToken) {
         // For guests, we just set a truthy value so the UI doesn't think it was aborted
         userAttemptId = "guest";
       }
    }

    return NextResponse.json({ ...state, userAttemptId, quizId });
  } catch (error) {
    console.error("Error fetching room status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
