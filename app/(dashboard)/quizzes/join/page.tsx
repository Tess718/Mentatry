"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { joinQuizByCodeAction } from "@/app/actions/quizzes";
import { KeyRound, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

export default function JoinQuizPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(joinQuizByCodeAction, null);

  useEffect(() => {
    if (state?.success && state?.quizId) {
      router.push(`/quizzes/${state.quizId}/take`);
    }
  }, [state, router]);

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

        <div aria-live="polite">
          {state?.error && !state?.errors?.joinCode && (
            <div className="neo-box bg-pink-100 border-red-600 p-3 text-red-700 text-sm font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}
        </div>

        <form action={formAction} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="joinCode" className="block text-xs font-black uppercase tracking-wider text-slate-900">
              Classroom Join Code
            </label>
            <input
              id="joinCode"
              name="joinCode"
              type="text"
              required
              maxLength={12}
              defaultValue={state?.fields?.joinCode || ""}
              aria-invalid={!!state?.errors?.joinCode}
              aria-describedby={state?.errors?.joinCode ? "joinCode-error" : undefined}
              placeholder="e.g. AB12CD"
              className={`neo-input uppercase tracking-widest text-center text-xl font-mono font-black py-3 text-slate-900 ${
                state?.errors?.joinCode ? "border-red-600 bg-red-50/50" : ""
              }`}
            />
            {state?.errors?.joinCode && (
              <p id="joinCode-error" className="text-xs font-bold text-red-600 mt-1 flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{state.errors.joinCode[0]}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            aria-busy={isPending}
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
