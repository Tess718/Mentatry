import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Trophy, Clock, Star } from "lucide-react";
import { cookies } from "next/headers";
import { calculateAnswerPoints, computeGuestScoreFromAnswers } from "@/lib/scoring";
import Link from "next/link";
import Avatar from "@/components/ui/avatar";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GuestLeaderboardPage({ params }: PageProps) {
  const { id: roomId } = await params;

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      quiz: { include: { questions: true } },
    },
  });

  if (!room) {
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
  
  const userId = guest.id;

  const guests = await prisma.guestParticipant.findMany({
    where: { roomId },
    include: { answers: true },
  });

  const timeAllowanceMs = room.quiz.timeLimitMinutes ? (room.quiz.timeLimitMinutes * 60 * 1000) / room.quiz.questions.length : 15000;

  const scoredAttempts = guests.map(g => {
    const { points: score, totalTimeMs } = computeGuestScoreFromAnswers(room.quiz.questions, g.answers, timeAllowanceMs);

    return {
      id: g.id,
      userId: g.id,
      user: { firstName: g.displayName },
      score,
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
    <div className="w-full max-w-5xl mx-auto space-y-12 overflow-hidden">
      
      {/* Header */}
      <div className="text-center space-y-4 pt-4 animate-in fade-in duration-700">
        <div className="inline-flex items-center gap-2 neo-badge bg-black text-white px-4 py-1.5 text-sm uppercase tracking-widest font-black">
          <Trophy className="w-5 h-5 text-amber-300" /> Final Results
        </div>
        <h1 className="text-4xl sm:text-5xl font-black uppercase text-white tracking-tight">
          {room.quiz.title}
        </h1>
        <p className="text-lg font-bold text-slate-300">
          {scoredAttempts.length} participants completed the quiz.
        </p>
      </div>

      {/* Podium Area */}
      <div className="relative pt-12 pb-8 px-2 sm:px-4 flex flex-row items-end justify-center gap-2 sm:gap-6 min-h-[350px]">
        {/* 2nd Place */}
        {top3[1] && (
          <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both w-[30%] sm:w-48 order-1">
            <div className="mb-4 text-center flex flex-col items-center">
              <Avatar seed={top3[1].id} size={48} className="mb-2" />
              <div className="font-black text-sm sm:text-xl truncate w-20 sm:w-full text-white">{top3[1].user.firstName || "Player"}</div>
              <div className="text-sm font-bold text-slate-300">{top3[1].score} pts</div>
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
          <div className="flex flex-col items-center animate-in slide-in-from-bottom-12 duration-1000 delay-700 fill-mode-both w-[40%] sm:w-56 order-2 z-10">
            <div className="mb-4 text-center flex flex-col items-center">
              <div className="text-yellow-500 mb-1 flex justify-center"><Star className="w-6 sm:w-8 h-6 sm:h-8 fill-yellow-500 animate-pulse" /></div>
              <Avatar seed={top3[0].id} size={64} className="mb-2 border-4 border-amber-500" />
              <div className="font-black text-base sm:text-2xl truncate w-24 sm:w-full text-white">{top3[0].user.firstName || "Player"}</div>
              <div className="text-base font-black text-slate-300">{top3[0].score} pts</div>
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
          <div className="flex flex-col items-center animate-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both w-[30%] sm:w-48 order-3">
            <div className="mb-4 text-center flex flex-col items-center">
              <Avatar seed={top3[2].id} size={40} className="mb-2" />
              <div className="font-black text-sm sm:text-xl truncate w-20 sm:w-full text-white">{top3[2].user.firstName || "Player"}</div>
              <div className="text-sm font-bold text-slate-300">{top3[2].score} pts</div>
            </div>
            <div className="w-full h-24 sm:h-28 bg-orange-300 border-4 border-black rounded-t-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative flex items-start justify-center pt-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 border-4 border-black flex items-center justify-center font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-orange-700">
                3
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Current User Rank Notification */}
      {currentUserAttempt && (
        <div className="flex justify-center pt-4 pb-4 animate-in fade-in duration-1000 delay-1000 fill-mode-both">
           <div className="neo-badge bg-cyan-400 text-black px-6 py-3 text-lg font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
             You finished Rank #{currentUserRank}!
           </div>
        </div>
      )}

      {/* Remaining Leaderboard */}
      {remaining.length > 0 && (
        <div className="max-w-3xl mx-auto space-y-4 pt-8 animate-in fade-in duration-1000 delay-1000 fill-mode-both">
          <h3 className="text-xl font-black uppercase tracking-tight mb-4 text-white">Other Participants</h3>
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
                    <div className="w-8 font-black text-slate-600 text-lg">#{rank}</div>
                    <Avatar seed={attempt.id} size={32} />
                    <div className="font-bold text-lg text-slate-900">
                      {attempt.user.firstName || "Player"} {isMe && <span className="text-cyan-900 text-xs uppercase bg-cyan-300 px-2 py-0.5 rounded-full ml-2 border-2 border-cyan-900">You</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-black text-black">{attempt.score} <span className="text-xs text-slate-600 font-bold">pts</span></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-center pt-12 pb-20">
         <Link href="/rooms/join" className="neo-btn neo-btn-white">Leave Room</Link>
      </div>
    </div>
  );
}
