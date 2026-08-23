"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { submitAttemptAction } from "@/app/actions/quizzes";
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Loader2, Timer } from "lucide-react";

interface QuestionData {
  id: string;
  text: string;
  options: string[];
  order: number;
}

interface QuizTakerProps {
  quizId: string;
  quizTitle: string;
  difficulty: string;
  timeLimitMinutes: number | null;
  questions: QuestionData[];
  resumeWarning?: string;
}

export function QuizTaker({ quizId, quizTitle, difficulty, timeLimitMinutes, questions, resumeWarning }: QuizTakerProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [timeLeft, setTimeLeft] = useState<number | null>(() => (timeLimitMinutes ? timeLimitMinutes * 60 : null));
  const startedAtRef = useRef<string | null>(null);
  const attemptIdRef = useRef<string | null>(null);
  const autoSubmittedRef = useRef(false);
  const userAnswersRef = useRef(userAnswers);

  useEffect(() => {
    userAnswersRef.current = userAnswers;
  }, [userAnswers]);

  useEffect(() => {
    // Initialize attempt on mount
    fetch(`/api/quizzes/${quizId}/start`, { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (data.attemptId) {
          attemptIdRef.current = data.attemptId;
        }
      })
      .catch((err) => console.error("Failed to start quiz:", err));

    if (!timeLimitMinutes) return;

    // Initialize timer on mount
    const now = new Date();
    startedAtRef.current = now.toISOString();
    const deadlineMs = now.getTime() + timeLimitMinutes * 60 * 1000;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((deadlineMs - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0 && !autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        clearInterval(interval);
        
        startTransition(async () => {
          const res = await submitAttemptAction({
            quizId,
            userAnswers: userAnswersRef.current,
            startedAt: startedAtRef.current || undefined,
            attemptId: attemptIdRef.current || undefined,
          });

          if (res.error) {
            setErrorMsg(`Time's up! ${res.error}`);
          } else if (res.attemptId) {
            router.push(`/quizzes/${quizId}/results/${res.attemptId}`);
          }
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [quizId, router, timeLimitMinutes]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const handleSelectOption = (optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSubmit = (isAutoSubmit = false) => {
    setErrorMsg(null);

    startTransition(async () => {
      const res = await submitAttemptAction({
        quizId,
        userAnswers,
        startedAt: startedAtRef.current || undefined,
        attemptId: attemptIdRef.current || undefined,
      });

      if (res.error) {
        setErrorMsg(isAutoSubmit ? `Time's up! ${res.error}` : res.error);
      } else if (res.attemptId) {
        router.push(`/quizzes/${quizId}/results/${res.attemptId}`);
      }
    });
  };

  const isCurrentSelected = userAnswers[currentQuestion.id] !== undefined;

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="neo-box p-6 bg-yellow-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`neo-badge ${
                difficulty === "easy"
                  ? "bg-lime-300"
                  : difficulty === "medium"
                  ? "bg-yellow-200"
                  : "bg-pink-300"
              }`}
            >
              {difficulty}
            </span>
            <span className="text-xs font-bold text-black uppercase">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            
            {timeLeft !== null && (
              <span className={`neo-badge flex items-center gap-1.5 ${timeLeft < 60 ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-black'}`}>
                <Timer className="w-3.5 h-3.5" />
                <span className="font-mono text-sm">{formatTime(timeLeft)}</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight">{quizTitle}</h1>
        </div>

        {/* Neo-brutalist Progress Bar */}
        <div className="w-full sm:w-48 space-y-1">
          <div className="flex justify-between text-xs font-black uppercase">
            <span>Progress</span>
            <span>{Math.round(((currentIndex + 1) / totalQuestions) * 100)}%</span>
          </div>
          <div className="w-full h-4 border-2 border-black bg-white p-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div
              className="h-full bg-lime-400 border-r border-black transition-all duration-200"
              style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="neo-box bg-pink-100 border-red-600 p-4 text-red-700 text-sm font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {resumeWarning && (
        <div className="neo-box bg-orange-100 border-orange-500 p-4 text-orange-800 text-sm font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{resumeWarning}</span>
        </div>
      )}

      {/* Main Question Card (Ensuring high legibility) */}
      <div className="neo-box p-6 sm:p-8 bg-white space-y-6">
        <div className="space-y-2">
          <span className="neo-badge bg-black text-white">Q #{currentIndex + 1}</span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-relaxed">
            {currentQuestion.text}
          </h2>
        </div>

        {/* 4 Options Grid */}
        <div className="space-y-3">
          {currentQuestion.options.map((optionText, optIdx) => {
            const isSelected = userAnswers[currentQuestion.id] === optIdx;

            return (
              <button
                key={optIdx}
                type="button"
                onClick={() => handleSelectOption(optIdx)}
                className={`w-full text-left p-4 border-3 border-black text-base font-semibold flex items-center justify-between gap-4 transition-all ${
                  isSelected
                    ? "bg-lime-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-1px] translate-y-[-1px]"
                    : "bg-slate-50 hover:bg-slate-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`w-7 h-7 flex items-center justify-center font-black text-xs border-2 border-black shrink-0 ${
                      isSelected ? "bg-black text-white" : "bg-white text-black"
                    }`}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="pt-0.5 text-slate-900 leading-normal">{optionText}</span>
                </div>

                {isSelected && <CheckCircle2 className="w-6 h-6 text-black shrink-0 stroke-[2.5]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation & Submission Controls */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentIndex === 0 || isPending}
          className="neo-btn neo-btn-white text-sm py-2.5 px-4 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>Previous</span>
        </button>

        {isLastQuestion ? (
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={!isCurrentSelected || isPending}
            className="neo-btn neo-btn-lime py-3 px-6 text-base disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Submitting & Scoring...</span>
              </>
            ) : (
              <>
                <span>Submit Quiz</span>
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={!isCurrentSelected || isPending}
            className="neo-btn neo-btn-yellow text-sm py-2.5 px-5 disabled:opacity-50"
          >
            <span>Next Question</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        )}
      </div>
    </div>
  );
}
