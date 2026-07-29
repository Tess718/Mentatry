import { Trophy } from "lucide-react";

export default function AchievementsLoading() {
  return (
    <div className="space-y-12 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b-4 border-black pb-8">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-slate-800 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Trophy className="w-10 h-10 stroke-[2.5] text-slate-700" />
          </div>
          <div>
            <div className="h-10 w-64 bg-slate-800 rounded-lg" />
            <div className="h-5 w-48 bg-slate-800 rounded mt-3" />
          </div>
        </div>

        {/* Daily Streak Skeleton */}
        <div className="neo-box bg-slate-800 border-4 border-black px-8 py-4 flex items-center gap-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-3xl">
          <div className="w-10 h-10 bg-slate-700 rounded-full" />
          <div>
            <div className="h-4 w-24 bg-slate-700 rounded mb-2" />
            <div className="h-8 w-12 bg-slate-700 rounded" />
          </div>
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="neo-box p-6 rounded-3xl flex flex-col items-center text-center space-y-4 bg-slate-800 border-4 border-black opacity-50"
          >
            <div className="p-4 rounded-2xl bg-slate-700 border-2 border-black">
              <div className="w-10 h-10 bg-slate-600 rounded-lg" />
            </div>
            <div className="w-full flex flex-col items-center">
              <div className="h-6 w-32 bg-slate-700 rounded mb-2" />
              <div className="h-4 w-48 bg-slate-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
