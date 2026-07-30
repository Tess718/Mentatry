import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Trophy, ChevronRight, Clock, Star, Medal } from "lucide-react";
import { Navbar } from "@/components/navbar";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LeaderboardPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id: roomId } = await params;
  const userId = session.user.id;

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      quiz: true,
      participants: true,
    },
  });

  if (!room) {
    notFound();
  }

  const isHost = room.hostId === userId;
  const isParticipant = room.participants.some((p) => p.userId === userId);

  if (!isHost && !isParticipant) {
    redirect("/quizzes");
  }

  // Fetch attempts explicitly tied to this room
  const attempts = await prisma.attempt.findMany({
    where: { roomId },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
      answers: { select: { timeTakenMs: true } },
    },
  });

  // Calculate total time for tie-breakers and map for sorting
  const scoredAttempts = attempts.map(attempt => {
    const totalTimeMs = attempt.answers.reduce((acc, ans) => acc + (ans.timeTakenMs || 0), 0);
    return {
      ...attempt,
      totalTimeMs,
    };
  });

  // Sort by score DESC, then totalTime ASC
  scoredAttempts.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.totalTimeMs - b.totalTimeMs;
  });

  const top3 = scoredAttempts.slice(0, 3);
  const remaining = scoredAttempts.slice(3);

  const currentUserAttempt = scoredAttempts.find(a => a.userId === userId);
  const currentUserRank = scoredAttempts.findIndex(a => a.userId === userId) + 1;

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-8 space-y-12 overflow-hidden">
        
        {/* Header */}
        <div className="text-center space-y-4 pt-4 animate-in fade-in duration-700">
          <div className="inline-flex items-center gap-2 neo-badge bg-black text-white px-4 py-1.5 text-sm uppercase tracking-widest font-black">
            <Trophy className="w-5 h-5 text-amber-300" /> Final Results
          </div>
          <h1 className="text-4xl sm:text-5xl font-black uppercase text-black tracking-tight">
            {room.quiz.title}
          </h1>
          <p className="text-lg font-bold text-slate-500">
            {scoredAttempts.length} participants completed the quiz.
          </p>
        </div>

        {/* Podium Area */}
        <div className="relative pt-12 pb-8 px-4 flex flex-col sm:flex-row items-end justify-center gap-4 sm:gap-6 min-h-[350px]">
          {/* 2nd Place */}
          {top3[1] && (
            <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both w-full sm:w-48 order-2 sm:order-1">
              <div className="mb-4 text-center">
                <div className="font-black text-xl truncate w-32 sm:w-full">{top3[1].user.firstName || "Player"}</div>
                <div className="text-sm font-bold text-slate-500">{top3[1].score} pts</div>
                <div className="text-xs font-semibold text-slate-400">{(top3[1].totalTimeMs / 1000).toFixed(1)}s</div>
              </div>
              <div className="w-full h-32 sm:h-40 bg-slate-300 border-4 border-black rounded-t-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative flex items-start justify-center pt-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 border-4 border-black flex items-center justify-center font-black text-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-slate-700">
                  2
                </div>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {top3[0] && (
            <div className="flex flex-col items-center animate-in slide-in-from-bottom-12 duration-1000 delay-700 fill-mode-both w-full sm:w-56 order-1 sm:order-2 mb-6 sm:mb-0 z-10">
              <div className="mb-4 text-center">
                <div className="text-yellow-500 mb-1 flex justify-center"><Star className="w-8 h-8 fill-yellow-500 animate-pulse" /></div>
                <div className="font-black text-2xl truncate w-40 sm:w-full">{top3[0].user.firstName || "Player"}</div>
                <div className="text-base font-black text-slate-700">{top3[0].score} pts</div>
                <div className="text-xs font-semibold text-slate-500">{(top3[0].totalTimeMs / 1000).toFixed(1)}s</div>
              </div>
              <div className="w-full h-48 sm:h-56 bg-amber-400 border-4 border-black rounded-t-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative flex items-start justify-center pt-6">
                <div className="w-16 h-16 rounded-full bg-white border-4 border-black flex items-center justify-center font-black text-4xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-amber-500">
                  1
                </div>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <div className="flex flex-col items-center animate-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both w-full sm:w-48 order-3 sm:order-3">
              <div className="mb-4 text-center">
                <div className="font-black text-xl truncate w-32 sm:w-full">{top3[2].user.firstName || "Player"}</div>
                <div className="text-sm font-bold text-slate-500">{top3[2].score} pts</div>
                <div className="text-xs font-semibold text-slate-400">{(top3[2].totalTimeMs / 1000).toFixed(1)}s</div>
              </div>
              <div className="w-full h-24 sm:h-28 bg-orange-300 border-4 border-black rounded-t-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative flex items-start justify-center pt-4">
                <div className="w-10 h-10 rounded-full bg-orange-100 border-4 border-black flex items-center justify-center font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-orange-700">
                  3
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Current User Call to Action */}
        {currentUserAttempt && (
          <div className="flex justify-center pt-8 pb-4 animate-in fade-in duration-1000 delay-1000 fill-mode-both">
            <Link 
              href={`/quizzes/${room.quizId}/results/${currentUserAttempt.id}?from=leaderboard&roomId=${room.id}`}
              className="neo-btn neo-btn-cyan text-lg py-4 px-8 inline-flex items-center gap-3 w-full sm:w-auto justify-center"
            >
              <span>View My Detailed Results</span>
              <span className="bg-black/10 px-2 py-1 rounded text-sm font-black">Rank #{currentUserRank}</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        )}

        {/* Remaining Leaderboard */}
        {remaining.length > 0 && (
          <div className="max-w-3xl mx-auto space-y-4 pt-8 animate-in fade-in duration-1000 delay-1000 fill-mode-both">
            <h3 className="text-xl font-black uppercase tracking-tight mb-4">Other Participants</h3>
            <div className="space-y-3">
              {remaining.map((attempt, idx) => {
                const rank = idx + 4; // Because top 3 are separated
                const isMe = attempt.userId === userId;

                return (
                  <div 
                    key={attempt.id} 
                    className={`p-4 border-2 border-black rounded-xl flex items-center justify-between ${
                      isMe ? 'bg-cyan-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] scale-[1.02] transition-transform z-10 relative' : 'bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 font-black text-slate-500 text-lg">#{rank}</div>
                      <div className="font-bold text-lg text-slate-900">
                        {attempt.user.firstName || "Player"} {isMe && <span className="text-cyan-700 text-xs uppercase bg-cyan-200 px-2 py-0.5 rounded-full ml-2">You</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="font-black text-black">{attempt.score} <span className="text-xs text-slate-500 font-bold">pts</span></div>
                      </div>
                      <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-slate-400 w-16 justify-end">
                        <Clock className="w-3.5 h-3.5" />
                        {(attempt.totalTimeMs / 1000).toFixed(1)}s
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
