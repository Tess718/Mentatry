import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { GuestLiveQuizTaker } from "./guest-live-quiz-taker";
import { cookies } from "next/headers";
import { calculateAnswerPoints, computeGuestScoreFromAnswers } from "@/lib/scoring";

export default async function GuestLiveTakeQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const room = await prisma.room.findUnique({
    where: { id },
    include: {
      quiz: {
        include: {
          questions: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!room || room.quiz.questions.length === 0) {
    notFound();
  }

  if (!room.isGuestMode) {
    redirect(`/rooms/join?code=${room.joinCode}`);
  }

  const cookieStore = await cookies();
  const guestToken = cookieStore.get(`guest_session_${room.id}`)?.value;
  if (!guestToken) redirect(`/rooms/join?code=${room.joinCode}`);
  
  const guest = await prisma.guestParticipant.findUnique({ where: { sessionToken: guestToken } });
  if (!guest || guest.roomId !== room.id) redirect(`/rooms/join?code=${room.joinCode}`);

  if (room.status !== "ACTIVE" || !room.startedAt) {
    // If they got here early or late, redirect them to wait or quizzes
    if (room.status === "WAITING") {
      redirect(`/play/${room.id}/wait`);
    } else {
      redirect(`/rooms/join?code=${room.joinCode}`);
    }
  }

  const sanitizedQuestions = room.quiz.questions.map((q) => ({
    id: q.id,
    text: q.text,
    options: q.options,
    order: q.order,
  }));

  // Compute initial points and streak if they are refreshing mid-game
  const pastAnswers = await prisma.guestAnswer.findMany({
    where: { guestId: guest.id },
    include: { question: { select: { correctIndex: true, order: true } } },
    orderBy: { question: { order: "asc" } }
  });

  let initialPoints = 0;
  let initialStreak = 0;
  
  if (pastAnswers.length > 0) {
    const expectedDurationMs = room.quiz.timeLimitMinutes 
      ? (room.quiz.timeLimitMinutes * 60 * 1000) / (room.quiz.questions.length || 1)
      : 15000;
    
    const { points, streak } = computeGuestScoreFromAnswers(room.quiz.questions, pastAnswers, expectedDurationMs);
    initialPoints = points;
    initialStreak = streak;
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <GuestLiveQuizTaker
        roomId={room.id}
        quizTitle={room.quiz.title}
        questions={sanitizedQuestions}
        initialPoints={initialPoints}
        initialStreak={initialStreak}
      />
    </div>
  );
}
