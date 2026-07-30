import { Timer, HelpCircle, Trophy } from "lucide-react";

export default function DailyChallengeLoading() {
  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8 animate-pulse">
      {/* Huge Header Skeleton */}
      <div className="text-center space-y-3 mb-10">
        <div className="h-12 sm:h-16 bg-slate-200 rounded-lg w-3/4 mx-auto" />
        <div className="h-6 bg-slate-200 rounded w-1/2 mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Main Quiz Action Card Skeleton */}
        <div className="md:col-span-7 lg:col-span-8 neo-box p-6 sm:p-10 bg-lime-200/50 rounded-3xl border-4 border-black space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="h-8 w-24 bg-black/10 rounded-full" />
          </div>

          <div className="space-y-4">
            <div className="h-10 sm:h-12 bg-lime-300/50 rounded w-5/6" />
            <div className="space-y-2">
              <div className="h-5 bg-lime-300/50 rounded w-full" />
              <div className="h-5 bg-lime-300/50 rounded w-4/5" />
            </div>
          </div>
          
          <div className="pt-2">
            <div className="h-16 w-full bg-black/10 rounded-xl" />
          </div>
        </div>

        {/* Right Sidebar Skeleton */}
        <div className="md:col-span-5 lg:col-span-4 space-y-6">
          
          {/* Rules Card Skeleton */}
          <div className="neo-box p-6 bg-white space-y-4 border-2 border-black">
            <h3 className="font-black uppercase text-lg flex items-center gap-2 text-slate-300">
              <HelpCircle className="w-5 h-5" /> How it works
            </h3>
            <div className="space-y-3">
              <div className="h-4 bg-slate-200 rounded w-full" />
              <div className="h-4 bg-slate-200 rounded w-5/6" />
              <div className="h-4 bg-slate-200 rounded w-11/12" />
            </div>
          </div>

          {/* Yesterday's Performance Skeleton */}
          <div className="neo-box p-6 bg-amber-100/50 border-2 border-black space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6 text-yellow-300/50" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="h-3 bg-amber-200 rounded w-1/2" />
                <div className="h-8 bg-amber-200 rounded w-3/4" />
              </div>
            </div>
            <div className="h-4 bg-amber-200 rounded w-full mt-3" />
          </div>

        </div>
      </div>
    </div>
  );
}
