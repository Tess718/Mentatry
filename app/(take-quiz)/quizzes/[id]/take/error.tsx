"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, LayoutDashboard } from "lucide-react";

export default function TakeQuizError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Take Quiz Route Error Caught:", error);
  }, [error]);

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <div className="neo-box p-8 bg-yellow-100 border-2 border-black rounded-3xl space-y-6 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="inline-flex p-4 bg-yellow-400 border-2 border-black rounded-2xl text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <AlertTriangle className="w-10 h-10 stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black uppercase text-black tracking-tight">
            Quiz Load Failure
          </h1>
          <p className="text-sm font-bold text-slate-900 leading-relaxed">
            {error.message || "Unable to retrieve quiz questions. The quiz may have been removed or you may lack permission."}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="neo-btn neo-btn-lime text-sm py-2.5 px-5 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4 stroke-[3]" />
            <span>Retry Loading</span>
          </button>
          <Link
            href="/quizzes"
            className="neo-btn neo-btn-white text-sm py-2.5 px-5 flex items-center gap-2 text-slate-900"
          >
            <LayoutDashboard className="w-4 h-4 stroke-[3]" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
