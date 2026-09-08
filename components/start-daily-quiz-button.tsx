"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Loader2 } from "lucide-react";

export function StartDailyQuizButton({ quizId }: { quizId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(() => {
      router.push(`/quizzes/${quizId}/take`);
    });
  };

  return (
    <button 
      onClick={handleClick}
      disabled={isPending}
      className="neo-btn neo-btn-black text-lg px-8 py-4 flex justify-center w-full text-white shadow-[5px_5px_0px_0px_rgba(255,255,255,1)] hover:shadow-[7px_7px_0px_0px_rgba(255,255,255,1)] active:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] disabled:opacity-80 transition-all"
    >
      <span>{isPending ? "Loading Challenge..." : "Play Today's Quiz"}</span>
      {isPending ? (
        <Loader2 className="w-6 h-6 ml-3 text-yellow-400 animate-spin" />
      ) : (
        <Trophy className="w-6 h-6 ml-3 text-yellow-400" />
      )}
    </button>
  );
}
