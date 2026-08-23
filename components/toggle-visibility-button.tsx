"use client";

import { useState, useTransition } from "react";
import { toggleQuizVisibilityAction } from "@/app/actions/quizzes";
import { Globe, Lock, Loader2 } from "lucide-react";

export function ToggleVisibilityButton({
  quizId,
  initialIsPublic,
}: {
  quizId: string;
  initialIsPublic: boolean;
}) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleQuizVisibilityAction(quizId);
      if (res.success && res.isPublic !== undefined) {
        setIsPublic(res.isPublic);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      title={
        isPublic
          ? "Public: Listed on Community Explore. Click to make Private."
          : "Private: Join code only. Click to list on Community Explore."
      }
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-mono font-bold uppercase transition-all cursor-pointer border-2 border-black ${
        isPublic
          ? "bg-emerald-300 text-black hover:bg-emerald-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          : "bg-slate-200 text-slate-800 hover:bg-slate-300"
      }`}
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
      ) : isPublic ? (
        <Globe className="w-3.5 h-3.5 text-emerald-950 stroke-[2.5] shrink-0" />
      ) : (
        <Lock className="w-3.5 h-3.5 text-slate-800 stroke-[2.5] shrink-0" />
      )}
      <span>{isPublic ? "Public" : "Private"}</span>
    </button>
  );
}
