import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Timer, Trophy, CheckCircle, HelpCircle } from "lucide-react";
import { CountdownTimer } from "@/components/countdown-timer";
import { StartDailyQuizButton } from "@/components/start-daily-quiz-button";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daily Challenge",
  description: "Play today's daily AI generated trivia challenge.",
};

export default async function DailyChallengePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Daily Quiz & Leaderboard logic
  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const yesterdayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));

  const [todayDailyQuiz, lastResult] = await Promise.all([
    prisma.quiz.findUnique({ where: { dailyDate: todayUTC } }),
    prisma.dailyLeaderboardResult.findFirst({
      where: { userId },
      orderBy: { date: 'desc' }
    }),
  ]);

  let lastResultLabel = "";
  if (lastResult) {
    const timeDiffMs = todayUTC.getTime() - lastResult.date.getTime();
    const daysAgo = Math.round(timeDiffMs / (1000 * 60 * 60 * 24));
    
    if (daysAgo === 1) {
      lastResultLabel = "Yesterday's Rank";
    } else if (daysAgo > 1 && daysAgo < 7) {
      const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'UTC' }).format(lastResult.date);
      lastResultLabel = `Rank from ${dayName}`;
    } else if (daysAgo >= 7) {
      const dateStr = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(lastResult.date);
      lastResultLabel = `Rank from ${dateStr}`;
    } else {
      lastResultLabel = "Latest Rank";
    }
  }

  if (!todayDailyQuiz) {
    return (
      <div className="py-12 max-w-2xl mx-auto space-y-6">
        <div className="neo-box p-8 sm:p-12 bg-white text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
            <Timer className="w-8 h-8 text-slate-400" />
          </div>
          <h1 className="text-2xl font-black uppercase text-white tracking-tight">No Daily Challenge Available</h1>
          <p className="text-slate-500 font-medium max-w-md mx-auto">
            The daily challenge for today has not been generated yet. Please check back soon!
          </p>
        </div>
      </div>
    );
  }

  // Check if user already completed today's quiz
  const todaysAttempt = await prisma.attempt.findFirst({
    where: {
      userId,
      quizId: todayDailyQuiz.id,
      isFirstDailyAttempt: true,
      completedAt: { not: null },
    }
  });

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8">
      {/* Huge Header */}
      <div className="text-center space-y-3 mb-10">
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-white flex items-center justify-center gap-3">
          Daily Challenge
        </h1>
        <p className="text-lg font-bold text-slate-500">One quiz. One global leaderboard. Every single day.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Main Quiz Action Card */}
        <div className="md:col-span-7 lg:col-span-8 neo-box p-6 sm:p-10 bg-lime-300 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 neo-badge bg-black text-white px-3 py-1.5 text-sm">
              <CountdownTimer />
            </div>
            {todaysAttempt && (
              <div className="inline-flex items-center gap-1.5 font-black text-lime-800 text-sm">
                <CheckCircle className="w-5 h-5" /> Completed
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight leading-none">
              {todayDailyQuiz.title}
            </h2>
            <p className="text-slate-900 font-bold text-base sm:text-lg max-w-lg leading-snug">
              {todaysAttempt 
                ? "You've submitted your official attempt! Rankings will be calculated at midnight UTC." 
                : "Your first attempt counts toward today's global leaderboard. Complete the challenge to secure your rank!"}
            </p>
          </div>
          
          <div className="pt-2">
            {todaysAttempt ? (
              <Link href={`/quizzes/${todayDailyQuiz.id}/results/${todaysAttempt.id}`} className="neo-btn neo-btn-white text-lg px-8 py-4 flex justify-center w-full">
                <span>View Your Results</span>
              </Link>
            ) : (
              <StartDailyQuizButton quizId={todayDailyQuiz.id} />
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="md:col-span-5 lg:col-span-4 space-y-6">
          
          {/* Rules Card */}
          <div className="neo-box p-6 bg-white space-y-4 border-2 border-black">
            <h3 className="font-black uppercase text-lg flex items-center gap-2">
              <HelpCircle className="w-5 h-5" /> How it works
            </h3>
            <ul className="space-y-3 text-sm font-semibold text-slate-700">
              <li className="flex gap-2">
                <span className="text-lime-600">✓</span> 
                <span>Only your <strong>very first attempt</strong> counts towards the leaderboard.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-lime-600">✓</span> 
                <span>Tie-breakers are decided by how fast you submit your answers.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-lime-600">✓</span> 
                <span>You can retake the quiz later for practice without affecting your score.</span>
              </li>
            </ul>
          </div>

          {/* Yesterday's Performance -> Last Performance */}
          {lastResult ? (
            <div className="neo-box p-6 bg-amber-200 border-2 border-black space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 transition-transform cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center shrink-0">
                  <Trophy className="w-6 h-6 text-yellow-300" />
                </div>
                <div>
                  <h3 className="font-black text-xs uppercase text-slate-800 leading-none mb-1 tracking-wider">{lastResultLabel}</h3>
                  <p className="text-2xl font-black leading-none">
                    #{lastResult.rank} <span className="text-sm font-bold text-amber-800">/ {lastResult.totalParticipants}</span>
                  </p>
                </div>
              </div>
              <p className="text-sm font-bold text-amber-900 border-t border-amber-300 pt-3">
                You placed in the top {Math.round(lastResult.percentile * 100)}% globally!
              </p>
            </div>
          ) : (
            <div className="neo-box p-6 bg-slate-50 border-2 border-slate-300 border-dashed text-center">
              <p className="text-sm font-bold text-slate-500">
                Take today's challenge to get your first rank!
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
