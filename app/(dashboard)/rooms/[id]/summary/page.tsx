import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Users, Trophy } from "lucide-react";
import { StudentAttemptsList } from "@/components/student-attempts-list";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RoomSummaryPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id: roomId } = await params;
  const userId = session.user.id;

  const roomAuth = await prisma.room.findUnique({
    where: { id: roomId },
    select: { hostId: true },
  });

  if (!roomAuth) {
    notFound();
  }

  // Authorization Check: Must be the Host
  if (roomAuth.hostId !== userId) {
    return (
      <div className="max-w-md mx-auto py-12">
        <div className="neo-box p-8 bg-pink-100 border-red-600 text-center space-y-4">
          <h1 className="text-2xl font-black uppercase text-red-700">Access Denied</h1>
          <p className="text-sm font-semibold text-slate-800">
            Room summaries are restricted to the host of the room.
          </p>
          <Link href="/quizzes" className="neo-btn neo-btn-black text-xs py-2 px-4 inline-block">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const room = await prisma.room.findUnique({
    where: { id: roomId },
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

  if (!room) {
    notFound();
  }



  // Fetch attempts explicitly tied to this room
  const attempts = await prisma.attempt.findMany({
    where: { roomId },
    include: {
      user: { select: { email: true, firstName: true, lastName: true } },
      answers: true,
    },
    orderBy: { score: "desc" }, // Order by score for the leaderboard effect
  });

  const totalParticipants = attempts.length;
  const topScorer = attempts.length > 0 ? attempts[0] : null;

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link href="/quizzes" className="neo-btn neo-btn-white text-xs py-2 px-3 self-start">
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="neo-box p-8 bg-amber-300 text-black space-y-2">
        <div className="inline-flex items-center gap-2 neo-badge bg-black text-white px-3 py-1 text-xs">
          <Users className="w-4 h-4 text-amber-300" /> Live Room Completed
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight">Room Summary</h1>
        <p className="text-sm font-semibold text-slate-900">
          Quiz: {room.quiz.title} • Code: <span className="font-mono font-bold tracking-widest">{room.joinCode}</span>
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="neo-box p-6 bg-white space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-500">Total Participants</span>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-black">{totalParticipants}</div>
        </div>

        <div className="neo-box p-6 bg-white space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-500">Top Score</span>
            <Trophy className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-3xl font-black text-black">
            {topScorer ? topScorer.score : 0} <span className="text-base text-slate-500">/ {room.quiz.questions.length}</span>
          </div>
        </div>
      </div>

      {/* Participant Results Breakdown */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight text-white">Participant Results</h2>
        <StudentAttemptsList attempts={attempts} questions={room.quiz.questions} />
      </div>
    </div>
  );
}
