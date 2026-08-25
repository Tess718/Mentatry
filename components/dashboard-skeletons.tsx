export function DashboardGridSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* 4 Metric Stats Summary Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="neo-box bg-slate-800 p-5 rounded-2xl space-y-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-slate-700 rounded" />
              <div className="w-8 h-8 bg-slate-700 rounded-lg border-2 border-black" />
            </div>
            <div className="h-8 w-16 bg-slate-700 rounded" />
            <div className="h-2.5 w-24 bg-slate-700 rounded" />
          </div>
        ))}
      </div>

      {/* Filter Tabs & Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-slate-700 rounded-full" />
          <div className="h-6 w-44 bg-slate-700 rounded" />
        </div>
        <div className="h-9 w-64 bg-slate-800 border-2 border-black rounded-xl" />
      </div>

      {/* Quizzes Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="neo-box bg-slate-800 p-6 rounded-2xl space-y-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-5 w-16 bg-slate-700 rounded-full border border-black" />
                <div className="h-5 w-16 bg-slate-700 rounded-full border border-black" />
              </div>
              <div className="h-6 w-3/4 bg-slate-700 rounded" />
              <div className="flex items-center gap-2">
                <div className="h-5 w-24 bg-slate-700 rounded border border-black" />
                <div className="h-5 w-16 bg-slate-700 rounded border border-black" />
              </div>
            </div>

            <div className="border-t-2 border-slate-700 pt-3">
              <div className="h-12 w-full bg-slate-700 rounded-xl border border-black" />
            </div>

            <div className="space-y-2 pt-1">
              <div className="h-9 w-full bg-slate-700 rounded-lg border border-black" />
              <div className="h-8 w-full bg-slate-700 rounded-lg border border-black" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function QuizCardsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="neo-box bg-slate-900 border-3 border-black p-6 rounded-2xl space-y-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-5 w-16 bg-slate-800 rounded-full border border-black" />
              <div className="h-5 w-16 bg-slate-800 rounded-full border border-black" />
            </div>
            <div className="h-6 w-3/4 bg-slate-800 rounded" />
            <div className="flex items-center gap-2">
              <div className="h-5 w-24 bg-slate-800 rounded border border-black" />
              <div className="h-5 w-16 bg-slate-800 rounded border border-black" />
            </div>
          </div>

          <div className="border-t-2 border-slate-800 pt-3">
            <div className="h-12 w-full bg-slate-800 rounded-xl border border-black" />
          </div>

          <div className="space-y-2 pt-1">
            <div className="h-9 w-full bg-slate-800 rounded-lg border border-black" />
            <div className="h-8 w-full bg-slate-800 rounded-lg border border-black" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CreateQuizSkeleton() {
  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6 animate-pulse">
      {/* Title Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-60 max-w-full bg-slate-800 rounded" />
        <div className="h-4 w-full max-w-md bg-slate-800 rounded" />
      </div>

      {/* Tabs Bar Skeleton */}
      <div className="flex flex-wrap items-center gap-3 border-b-4 border-black pb-3">
        <div className="h-10 w-44 bg-slate-800 border-2 border-black rounded-xl" />
        <div className="h-10 w-44 bg-slate-800 border-2 border-black rounded-xl" />
        <div className="h-10 w-44 bg-slate-800 border-2 border-black rounded-xl" />
      </div>

      {/* Form Container Skeleton */}
      <div className="neo-box p-8 bg-slate-800 border-2 border-black rounded-3xl space-y-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-700 rounded" />
          <div className="h-12 w-full bg-slate-700 rounded-xl border-2 border-black" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-4 w-28 bg-slate-700 rounded" />
            <div className="h-12 w-full bg-slate-700 rounded-xl border-2 border-black" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-28 bg-slate-700 rounded" />
            <div className="h-12 w-full bg-slate-700 rounded-xl border-2 border-black" />
          </div>
        </div>
        <div className="h-12 w-full bg-slate-700 rounded-xl border-2 border-black" />
      </div>
    </div>
  );
}

export function JoinQuizSkeleton() {
  return (
    <div className="max-w-md mx-auto py-12 animate-pulse">
      <div className="neo-box p-8 bg-slate-800 border-2 border-black rounded-3xl space-y-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="space-y-3 text-center flex flex-col items-center">
          <div className="w-14 h-14 bg-slate-700 border-2 border-black rounded-2xl" />
          <div className="h-7 w-36 bg-slate-700 rounded" />
          <div className="h-4 w-64 bg-slate-700 rounded" />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-3 w-28 bg-slate-700 rounded" />
            <div className="h-14 w-full bg-slate-700 rounded-xl border-2 border-black" />
          </div>
          <div className="h-12 w-full bg-slate-700 rounded-xl border-2 border-black" />
        </div>
      </div>
    </div>
  );
}

export function InsightsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8 animate-pulse">
      {/* Top Header Banner Skeleton */}
      <div className="neo-box p-8 bg-slate-800 rounded-2xl space-y-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="h-5 w-40 bg-slate-700 rounded" />
        <div className="h-8 w-2/3 bg-slate-700 rounded" />
        <div className="h-4 w-1/2 bg-slate-700 rounded" />
      </div>

      {/* Summary Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="neo-box p-6 bg-slate-800 space-y-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="h-3 w-24 bg-slate-700 rounded" />
            <div className="h-8 w-20 bg-slate-700 rounded" />
            <div className="h-3 w-32 bg-slate-700 rounded" />
          </div>
        ))}
      </div>

      {/* Question Miss Rate Analysis Skeleton */}
      <div className="space-y-4 pt-4">
        <div className="h-6 w-64 bg-slate-800 rounded" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="neo-box p-6 bg-slate-800 space-y-3 border-l-8 border-l-slate-600">
            <div className="h-5 w-24 bg-slate-700 rounded" />
            <div className="h-6 w-full bg-slate-700 rounded" />
            <div className="h-3 w-full bg-slate-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function QuizTakerSkeleton() {
  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6 animate-pulse">
      <div className="neo-box bg-slate-800 p-8 space-y-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-slate-700 rounded" />
          <div className="h-6 w-20 bg-slate-700 rounded" />
        </div>
        <div className="h-8 w-full bg-slate-700 rounded" />
        <div className="space-y-3 pt-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 w-full bg-slate-700 rounded-xl border-2 border-black" />
          ))}
        </div>
      </div>
    </div>
  );
}
