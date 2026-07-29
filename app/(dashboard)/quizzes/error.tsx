"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, LayoutDashboard } from "lucide-react";

export default function QuizzesDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard Route Error Caught:", error);
  }, [error]);

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <div className="neo-box p-8 bg-pink-100 border-2 border-red-600 rounded-3xl space-y-6 text-center shadow-[8px_8px_0px_0px_rgba(220,38,38,1)]">
        <div className="inline-flex p-4 bg-red-600 border-2 border-black rounded-2xl text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <AlertCircle className="w-10 h-10 stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black uppercase text-red-700 tracking-tight">
            Something Went Wrong!
          </h1>
          <p className="text-sm font-semibold text-slate-800 leading-relaxed">
            An unexpected error occurred while trying to load your dashboard data. Our engineers have been notified. Please try reloading the page.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="neo-btn neo-btn-lime text-sm py-2.5 px-5 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4 stroke-[3]" />
            <span>Try Again</span>
          </button>
          <Link
            href="/quizzes"
            className="neo-btn neo-btn-white text-sm py-2.5 px-5 flex items-center gap-2 text-slate-900"
          >
            <LayoutDashboard className="w-4 h-4 stroke-[3]" />
            <span>Reload Quizzes</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
