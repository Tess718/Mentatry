import { DashboardGridSkeleton } from "@/components/dashboard-skeletons";

export default function QuizzesDashboardLoading() {
  return (
    <div className="py-4 space-y-8">
      {/* Top Welcome Banner Loader */}
      <div className="neo-box p-8 bg-amber-300/20 border-2 border-black rounded-3xl animate-pulse space-y-3">
        <div className="h-4 w-32 bg-amber-400/40 rounded" />
        <div className="h-8 w-2/3 bg-amber-400/40 rounded" />
        <div className="h-4 w-1/2 bg-amber-400/40 rounded" />
      </div>

      <DashboardGridSkeleton />
    </div>
  );
}
