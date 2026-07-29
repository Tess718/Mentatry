"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinQuizByCodeAction } from "@/app/actions/quizzes";
import { KeyRound, ArrowRight, AlertCircle, Loader2 } from "lucide-react";


export default function JoinQuizPage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    startTransition(async () => {
      const res = await joinQuizByCodeAction(joinCode);
      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.quizId) {
        router.push(`/quizzes/${res.quizId}/take`);
      }
    });
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="neo-box p-8 bg-white space-y-6">
        <div className="space-y-2 text-center">
          <div className="inline-flex p-3 bg-pink-300 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <KeyRound className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black">Join Quiz</h1>
          <p className="text-sm font-semibold text-slate-600">
            Enter a 6-character classroom join code provided by your quiz owner
          </p>
        </div>

        {errorMsg && (
          <div className="neo-box bg-pink-100 border-red-600 p-3 text-red-700 text-sm font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-900">Classroom Join Code</label>
            <input
              type="text"
              required
              maxLength={12}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="e.g. AB12CD"
              className="neo-input uppercase tracking-widest text-center text-xl font-mono font-black py-3 text-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={isPending || joinCode.trim().length < 4}
            className="neo-btn neo-btn-pink w-full py-3 text-base flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Joining Quiz...</span>
              </>
            ) : (
              <>
                <span>Enter Quiz</span>
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
