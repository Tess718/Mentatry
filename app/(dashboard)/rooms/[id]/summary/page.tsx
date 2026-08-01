import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Users, Trophy } from "lucide-react";
import { StudentAttemptsList } from "@/components/student-attempts-list";
import { calculateAnswerPoints, computeGuestScoreFromAnswers } from "@/lib/scoring";
import Avatar from "@/components/ui/avatar";

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



  let totalParticipants = 0;
  let topScorerScore: number | string = 0;
  let maxPossibleScore: number | string = room.quiz.questions.length;
  let content = null;

  if (room.isGuestMode) {
    const guests = await prisma.guestParticipant.findMany({
      where: { roomId },
      include: { 
        answers: { 
          include: { 
            question: { select: { correctIndex: true, order: true } } 
          },
          orderBy: { question: { order: "asc" } }
        } 
      },
    });

    totalParticipants = guests.length;
    maxPossibleScore = "pts";

    const expectedDurationMs = room.quiz.timeLimitMinutes
      ? (room.quiz.timeLimitMinutes * 60 * 1000) / (room.quiz.questions.length || 1)
      : 15000;

    const guestScores = guests.map((guest) => {
      const { points, correctCount } = computeGuestScoreFromAnswers(room.quiz.questions, guest.answers, expectedDurationMs);
      return { ...guest, points, correctCount };
    }).sort((a, b) => b.points - a.points);

    if (guestScores.length > 0) {
      topScorerScore = guestScores[0].points;
    }

    content = (
      <div className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight text-white">Guest Leaderboard</h2>
        {guestScores.length === 0 ? (
          <div className="neo-box p-8 bg-white text-center text-slate-600 font-semibold italic">
            No guests joined this room.
          </div>
        ) : (
          <div className="space-y-4">
            {guestScores.map((guest, idx) => (
              <div key={guest.id} className="neo-box bg-white p-4 sm:p-6 flex items-center justify-between gap-4 transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-4">
                  <div className="font-black text-2xl text-slate-400 w-8 text-center">{idx + 1}</div>
                  <Avatar seed={guest.displayName} size={40} />
                  <div className="font-extrabold text-black text-xl">{guest.displayName}</div>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div className="text-sm font-bold text-slate-500 hidden sm:block">
                    {guest.correctCount} / {room.quiz.questions.length} correct
                  </div>
                  <div className="neo-badge bg-yellow-300 text-black text-xl px-4 py-2">
                    {guest.points} pts
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } else {
    // Standard authenticated room behavior
    const attempts = await prisma.attempt.findMany({
      where: { roomId },
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        answers: true,
      },
      orderBy: { score: "desc" },
    });

    totalParticipants = attempts.length;
    topScorerScore = attempts.length > 0 ? attempts[0].score : 0;
    maxPossibleScore = `/ ${room.quiz.questions.length}`;

    content = (
      <div className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight text-white">Participant Results</h2>
        <StudentAttemptsList attempts={attempts} questions={room.quiz.questions} />
      </div>
    );
  }

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
          <div className="text-3xl font-black text-black flex items-baseline gap-2">
            {topScorerScore} <span className="text-base text-slate-500">{maxPossibleScore}</span>
          </div>
        </div>
      </div>

      {/* Dynamic Content Area */}
      {content}
    </div>
  );
}
