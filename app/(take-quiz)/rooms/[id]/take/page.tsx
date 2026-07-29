import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { LiveQuizTaker } from "@/components/live-quiz-taker";
import { Navbar } from "@/components/navbar";

export default async function LiveTakeQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

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

  if (room.status !== "ACTIVE" || !room.startedAt) {
    // If they got here early or late, redirect them to wait or quizzes
    if (room.status === "WAITING") {
      redirect(`/rooms/${room.id}/wait`);
    } else {
      redirect("/quizzes");
    }
  }

  // Ensure they are actually a participant or the host
  const participant = await prisma.roomParticipant.findUnique({
    where: { roomId_userId: { roomId: id, userId: session.user.id } },
  });

  if (!participant && room.hostId !== session.user.id) {
    redirect("/quizzes");
  }

  const sanitizedQuestions = room.quiz.questions.map((q) => ({
    id: q.id,
    text: q.text,
    options: q.options,
    order: q.order,
  }));

  return (
    <div className="min-h-screen bg-neutral-50/50">
      <Navbar />
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-8">
        <LiveQuizTaker
          roomId={room.id}
          quizTitle={room.quiz.title}
          difficulty={room.quiz.difficulty}
          timeLimitMinutes={room.quiz.timeLimitMinutes}
          startedAt={room.startedAt.toISOString()}
          questions={sanitizedQuestions}
        />
      </main>
    </div>
  );
}
