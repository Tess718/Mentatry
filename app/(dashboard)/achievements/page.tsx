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

  // 3. Compute Daily Streak live
  const attemptsDates = await prisma.attempt.findMany({
    where: { userId },
    select: { completedAt: true },
    orderBy: { completedAt: "desc" },
  });

  const distinctDays = new Set(
    attemptsDates.map((a) => {
      const d = new Date(a.completedAt);
      return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    })
  );

  let currentStreak = 0;
  const todayDate = new Date();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(todayDate.getDate() - 1);

  const todayStr = `${todayDate.getFullYear()}-${todayDate.getMonth() + 1}-${todayDate.getDate()}`;
  const yesterdayStr = `${yesterdayDate.getFullYear()}-${yesterdayDate.getMonth() + 1}-${yesterdayDate.getDate()}`;

  let checkDate = new Date();
  if (distinctDays.has(todayStr)) {
    checkDate = todayDate;
  } else if (distinctDays.has(yesterdayStr)) {
    checkDate = yesterdayDate;
  } else {
    checkDate = null as any;
  }

  if (checkDate) {
    while (true) {
      const checkStr = `${checkDate.getFullYear()}-${checkDate.getMonth() + 1}-${checkDate.getDate()}`;
      if (distinctDays.has(checkStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12">
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
    </div>
  );
}
