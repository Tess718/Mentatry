import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { finalizeRoom } from "@/app/actions/rooms";
import { auth } from "@/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: roomId } = await params;

    // Always fetch participants fresh from Postgres (cheap query, prevents lost-update races).
    // Only use Redis for status/timing fields.
    let cachedState: any = null;
    if (redis) {
      cachedState = await redis.get(`room:${roomId}`);
    }

    // Always get participants from Postgres (authoritative)
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        quiz: { select: { timeLimitMinutes: true } },
        participants: {
          include: { user: { select: { id: true, firstName: true } } }
        }
      }
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Security: Only host or participants can view room status
    const isHost = room.hostId === session.user.id;
    const isParticipant = room.participants.some(p => p.user.id === session.user.id);
    if (!isHost && !isParticipant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const participants = room.participants.map(p => ({
      id: p.user.id,
      firstName: p.user.firstName || "Player",
    }));

    // Build state from Redis cache if available, otherwise from Postgres
    const state = {
      status: cachedState?.status || room.status,
      startedAt: cachedState?.startedAt || room.startedAt?.toISOString() || null,
      createdAt: cachedState?.createdAt || room.createdAt.toISOString(),
      timeLimitMinutes: cachedState?.timeLimitMinutes || room.quiz.timeLimitMinutes,
      participants, // Always from Postgres
    };

    // Rehydrate Redis if it was missing (status/timing only)
    if (!cachedState && redis) {
      try {
        await redis.set(`room:${roomId}`, {
          status: state.status,
          startedAt: state.startedAt,
          createdAt: state.createdAt,
          timeLimitMinutes: state.timeLimitMinutes,
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

    // Update Redis on a best-effort basis (fail-open) if we forcibly transitioned
    if (stateChanged && redis) {
      try {
        await redis.set(`room:${roomId}`, {
          status: state.status,
          startedAt: state.startedAt,
          createdAt: state.createdAt,
          timeLimitMinutes: state.timeLimitMinutes,
        });
        await redis.expire(`room:${roomId}`, 60 * 60 * 24);
      } catch (e) {
        console.warn("Failed to update Redis during lazy evaluation", e);
      }
    }
    
    let userAttemptId = null;
    let quizId = room.quizId;
    
    if (state.status === "COMPLETED") {
       // Query the participant's newest Attempt for this quiz
       const attempt = await prisma.attempt.findFirst({
         where: { userId: session.user.id, quizId: room.quizId },
         orderBy: { completedAt: "desc" }
       });
         if (attempt) {
           userAttemptId = attempt.id;
         }
    }

    return NextResponse.json({ ...state, userAttemptId, quizId });
  } catch (error) {
    console.error("Error fetching room status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
