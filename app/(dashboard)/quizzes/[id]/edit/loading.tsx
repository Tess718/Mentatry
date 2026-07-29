import { Loader2, Plus } from "lucide-react";

export default function QuizEditorLoading() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16 animate-pulse">
      {/* Sticky Header Skeleton */}
      <div className="flex items-center justify-between bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-neutral-200 rounded" />
          <div className="h-4 w-64 bg-neutral-100 rounded" />
        </div>
        <div className="h-10 w-32 bg-cyan-100 rounded-xl" />
      </div>

      {/* Settings Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
        <div className="space-y-2 md:col-span-2">
          <div className="h-4 w-24 bg-neutral-200 rounded" />
          <div className="h-12 w-full bg-neutral-100 rounded-lg" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-neutral-200 rounded" />
          <div className="h-12 w-full bg-neutral-100 rounded-lg" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-neutral-200 rounded" />
          <div className="h-12 w-full bg-neutral-100 rounded-lg" />
        </div>
      </div>

      {/* Questions List Skeleton */}
      <div className="space-y-6">
        <div className="h-6 w-32 bg-neutral-200 rounded" />
        
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-6 bg-white border border-neutral-200 rounded-lg shadow-sm space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-neutral-200 rounded" />
              <div className="h-16 w-full bg-neutral-100 rounded-lg" />
            </div>
            
            <div className="space-y-3 pt-2">
              <div className="h-4 w-16 bg-neutral-200 rounded mb-2" />
              {[...Array(4)].map((_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-neutral-200 shrink-0" />
                  <div className="h-10 w-full bg-neutral-100 rounded-lg" />
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4 border-t border-neutral-100">
              <div className="h-4 w-32 bg-neutral-200 rounded" />
              <div className="h-12 w-full bg-neutral-100 rounded-lg" />
            </div>
          </div>
        ))}

        <div className="w-full neo-box border-dashed border-4 border-slate-200 py-8 flex items-center justify-center">
          <div className="flex items-center gap-2 text-slate-300">
            <Plus className="w-5 h-5 stroke-[3]" />
            <div className="h-5 w-32 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
