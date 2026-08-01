import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { cookies } from "next/headers";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: roomId } = await params;
    const body = await req.json();
    const { questionId, selectedOption, timeTakenMs } = body;

    if (!questionId || selectedOption === undefined || selectedOption === null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const guestToken = cookieStore.get(`guest_session_${roomId}`)?.value;

    if (!guestToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const guest = await prisma.guestParticipant.findUnique({
      where: { sessionToken: guestToken },
    });

    if (!guest || guest.roomId !== roomId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { quiz: true }
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.status !== "ACTIVE" || !room.startedAt) {
      return NextResponse.json({ error: "Room is not active" }, { status: 403 });
    }

    if (room.currentPhase !== "QUESTION_ACTIVE") {
      return NextResponse.json({ error: "Question is no longer active" }, { status: 403 });
    }

    if (room.quiz.timeLimitMinutes) {
      const deadline = new Date(room.startedAt.getTime() + room.quiz.timeLimitMinutes * 60 * 1000 + 30 * 1000); // 30s grace
      if (new Date() > deadline) {
        return NextResponse.json({ error: "Time limit exceeded. Answer rejected." }, { status: 403 });
      }
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { correctIndex: true }
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const isCorrect = selectedOption === question.correctIndex;

    try {
      // Save the answer to Postgres
      await prisma.guestAnswer.create({
        data: {
          guestId: guest.id,
          questionId,
          selectedOption,
          timeTakenMs,
        },
      });
    } catch (error: any) {
      if (error.code === "P2002") {
        return NextResponse.json({ error: "You have already submitted an answer for this question." }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, isCorrect });
  } catch (error) {
    console.error("Error submitting guest answer:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
