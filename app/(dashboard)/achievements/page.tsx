import { Suspense } from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Flame, Trophy, Play, Award, Zap, GraduationCap, Users, Brain } from "lucide-react";

// Helper to map icon names from DB to Lucide components
const IconMap: Record<string, any> = {
  Trophy,
  Flame,
  Play,
  Award,
  Zap,
  GraduationCap,
  Users,
  Brain,
};

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Achievements",
  description: "View your earned badges, perfect scores, and daily streaks.",
};

export default async function AchievementsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <Suspense fallback={<AchievementsSkeleton />}>
        <AsyncAchievements userId={userId} />
      </Suspense>
    </div>
  );
}

function AchievementsSkeleton() {
  return (
    <div className="space-y-12 animate-pulse">
      <div className="neo-box p-8 bg-amber-300/50 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 w-full">
          <div className="h-10 w-64 bg-amber-400/50 rounded" />
          <div className="h-6 w-96 bg-amber-400/50 rounded" />
        </div>
        <div className="neo-box bg-white/50 p-6 w-48 h-24 shrink-0" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="neo-box p-6 rounded-2xl h-64 bg-slate-100" />
        ))}
      </div>
    </div>
  );
}

async function AsyncAchievements({ userId }: { userId: string }) {
  // 1. Fetch all catalog achievements
  const allAchievements = await prisma.achievement.findMany({
    orderBy: { name: "asc" },
  });

  // 2. Fetch user's earned achievements
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
  });
  const earnedIds = new Set(userAchievements.map((ua) => ua.achievementId));
  
  // Create a map for fast lookup of earned dates
  const earnedDates = new Map(userAchievements.map((ua) => [ua.achievementId, ua.earnedAt]));

  // 3. Compute Daily Streak live in UTC
  const attemptsDates = await prisma.attempt.findMany({
    where: { userId, completedAt: { not: null } },
    select: { completedAt: true },
    orderBy: { completedAt: "desc" },
  });

  const distinctDays = new Set(
    attemptsDates.map((a) => {
      const d = new Date(a.completedAt!);
      return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
    })
  );

  let currentStreak = 0;
  const now = new Date();
  const todayDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const yesterdayDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));

  const todayStr = `${todayDate.getUTCFullYear()}-${todayDate.getUTCMonth() + 1}-${todayDate.getUTCDate()}`;
  const yesterdayStr = `${yesterdayDate.getUTCFullYear()}-${yesterdayDate.getUTCMonth() + 1}-${yesterdayDate.getUTCDate()}`;

  let checkDate: Date | null = null;
  if (distinctDays.has(todayStr)) {
    checkDate = new Date(todayDate);
  } else if (distinctDays.has(yesterdayStr)) {
    checkDate = new Date(yesterdayDate);
  }

  if (checkDate) {
    while (true) {
      const checkStr = `${checkDate.getUTCFullYear()}-${checkDate.getUTCMonth() + 1}-${checkDate.getUTCDate()}`;
      if (distinctDays.has(checkStr)) {
        currentStreak++;
        checkDate.setUTCDate(checkDate.getUTCDate() - 1);
      } else {
        break;
      }
    }
  }

  return (
    <>
      {/* Header & Streak */}
      <div className="neo-box p-8 bg-amber-300 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black uppercase text-black tracking-tight">
            Your Achievements
          </h1>
          <p className="text-amber-900 font-bold mt-2">
            Complete quizzes and master topics to unlock badges.
          </p>
        </div>
        
        <div className="neo-box bg-white p-6 flex items-center gap-6 shrink-0">
          <div className="bg-orange-100 p-4 rounded-2xl border-2 border-orange-500 text-orange-500">
            <Flame className="w-10 h-10" />
          </div>
          <div>
            <div className="text-sm font-black uppercase text-slate-500">Daily Streak</div>
            <div className="text-4xl font-black text-black flex items-baseline gap-2">
              {currentStreak}
              <span className="text-lg text-slate-500">Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {allAchievements.map((ach) => {
          const isEarned = earnedIds.has(ach.id);
          const earnedDate = earnedDates.get(ach.id);
          const Icon = IconMap[ach.icon] || Trophy;

          return (
            <div
              key={ach.id}
              className={`neo-box p-6 rounded-2xl flex flex-col items-center text-center transition-all ${
                isEarned
                  ? "bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1"
                  : "bg-slate-50 border-4 border-slate-200 shadow-none opacity-75 grayscale"
              }`}
            >
              <div
                className={`p-4 rounded-full border-4 mb-4 ${
                  isEarned
                    ? "bg-yellow-300 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black"
                    : "bg-slate-200 border-slate-300 text-slate-400"
                }`}
              >
                <Icon className="w-10 h-10" />
              </div>
              <h3 className={`text-xl font-black uppercase tracking-tight ${isEarned ? "text-slate-900" : "text-slate-500"}`}>
                {ach.name}
              </h3>
              <p className={`text-sm mt-2 font-bold ${isEarned ? "text-slate-600" : "text-slate-400"}`}>
                {ach.description}
              </p>
              
              <div className="mt-auto pt-6">
                {isEarned ? (
                  <span className="neo-badge bg-lime-300 text-black text-xs font-black">
                    EARNED {earnedDate?.toLocaleDateString()}
                  </span>
                ) : (
                  <span className="neo-badge bg-slate-200 text-slate-500 text-xs font-black">
                    LOCKED
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
