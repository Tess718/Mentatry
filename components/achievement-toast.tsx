"use client";

import { useState, useEffect } from "react";
import { getAndAcknowledgeNewAchievementsAction } from "@/app/actions/gamification";
import { Trophy, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export function AchievementToast() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [visibleIndexes, setVisibleIndexes] = useState<number[]>([]);

  useEffect(() => {
    async function fetchAchievements() {
      const res = await getAndAcknowledgeNewAchievementsAction();
      if ("success" in res && res.newlyEarned && res.newlyEarned.length > 0) {
        setAchievements(res.newlyEarned);
        setVisibleIndexes(res.newlyEarned.map((_, i) => i));
      }
    }
    fetchAchievements();
  }, []);

  const dismiss = (index: number) => {
    setVisibleIndexes((prev) => prev.filter((i) => i !== index));
  };

  if (visibleIndexes.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 sm:left-auto sm:w-full sm:max-w-sm z-50 flex flex-col gap-4">
      {achievements.map((ach, index) => {
        if (!visibleIndexes.includes(index)) return null;

        return (
          <div
            key={index}
            className="neo-box bg-white border-4 border-black p-4 flex items-start gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-right-10 duration-300"
          >
            <div className="bg-yellow-300 p-2 rounded-xl border-2 border-black shrink-0">
              <Trophy className="w-8 h-8 text-black" />
            </div>
            <div className="flex-1 pt-1">
              <div className="text-xs font-black uppercase text-indigo-600 tracking-wider">
                Achievement Unlocked!
              </div>
              <h3 className="text-lg font-black text-slate-900 leading-tight mt-1">{ach.name}</h3>
              <p className="text-sm font-bold text-slate-600 mt-1">{ach.description}</p>
            </div>
            <button
              onClick={() => dismiss(index)}
              className="text-slate-400 hover:text-black transition-colors"
            >
              <X className="w-5 h-5 stroke-[3]" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
