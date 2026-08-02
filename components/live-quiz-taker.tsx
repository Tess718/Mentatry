"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitLiveAnswerAction } from "@/app/actions/rooms";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Timer, Lock } from "lucide-react";
import { useAlertModal } from "@/components/ui/use-alert-modal";
import { useSSERelay } from "@/hooks/use-sse-relay";

interface QuestionData {
  id: string;
  text: string;
  options: string[];
  order: number;
}

interface LiveQuizTakerProps {
  roomId: string;
  quizTitle: string;
  difficulty: string;
  timeLimitMinutes: number | null;
  startedAt: string;
  questions: QuestionData[];
  baseRoute?: string;
}

export function LiveQuizTaker({ roomId, quizTitle, difficulty, timeLimitMinutes, startedAt, questions, baseRoute = "/rooms" }: LiveQuizTakerProps) {
  const router = useRouter();
  const { showAlert, AlertModal } = useAlertModal();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [isPending, startTransition] = useTransition();
  const [isLocked, setIsLocked] = useState(false); // Global lock (time up / ended)
  const [lockedQuestions, setLockedQuestions] = useState<Record<string, boolean>>({});
  const [questionResults, setQuestionResults] = useState<Record<string, boolean>>({});
  const [liveStreak, setLiveStreak] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

  // Timer state
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const syncState = async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/status`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === "COMPLETED") {
          setIsLocked(true);
          if (data.userAttemptId) {
            router.push(`${baseRoute}/${roomId}/leaderboard`);
          } else {
            showAlert("The host has ended the quiz.", () => {
              router.push(`${baseRoute}/${roomId}/leaderboard`);
            });
          }
          return data.status;
        }
      }
    } catch (err) {
      console.error("State sync error:", err);
    }
    return null;
  };

  useEffect(() => {
    // 1. Polling for early termination by host
    const pollInterval = setInterval(async () => {
      const finalStatus = await syncState();
      if (finalStatus === "COMPLETED") {
        clearInterval(pollInterval);
      }
    }, 1000);
    return () => clearInterval(pollInterval);
  }, [roomId, router, baseRoute, showAlert]);

  useSSERelay({
    roomId,
    onEvent: (event) => {
      if (event.type !== 'answer_submitted') {
        syncState();
      }
    },
    onResync: () => {
      syncState();
    }
  });

  useEffect(() => {
    // 2. Timer countdown
    let timerInterval: NodeJS.Timeout;
    if (timeLimitMinutes) {
      const startMs = new Date(startedAt).getTime();
      const deadlineMs = startMs + timeLimitMinutes * 60 * 1000;

      timerInterval = setInterval(() => {
        const remaining = Math.max(0, Math.floor((deadlineMs - Date.now()) / 1000));
        setTimeLeft(remaining);

        if (remaining === 0) {
          clearInterval(timerInterval);
          setIsLocked(true);
        }
      }, 1000);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [startedAt, timeLimitMinutes]);

  // Reset question timer when navigating to a new question
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentIndex]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const handleSelectOption = (optionIndex: number) => {
    if (isLocked || lockedQuestions[currentQuestion.id]) return;

    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));

    const timeTakenMs = Date.now() - questionStartTime;

    startTransition(async () => {
      const res = await submitLiveAnswerAction(roomId, currentQuestion.id, optionIndex, timeTakenMs);

      if (res.error) {
        showAlert(res.error);
        setIsLocked(true); // If rejected by server global timer, lock it
      } else {
        // Lock this specific question and update streak
        setLockedQuestions(prev => ({ ...prev, [currentQuestion.id]: true }));
        setQuestionResults(prev => ({ ...prev, [currentQuestion.id]: res.isCorrect ?? false }));
        if (res.isCorrect) {
          setLiveStreak(prev => prev + 1);
        } else {
          setLiveStreak(0);
        }
      }
    });
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) setCurrentIndex((prev) => prev + 1);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 neo-box p-6 bg-white rounded-2xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase text-black leading-tight">
            {quizTitle}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="neo-badge bg-black text-white text-xs">LIVE ROOM</span>
            <span className={`neo-badge text-xs ${
                difficulty === "easy" ? "bg-lime-300 text-black" : difficulty === "medium" ? "bg-yellow-300 text-black" : "bg-pink-300 text-black"
              }`}
            >
              {difficulty}
            </span>
            {liveStreak > 1 && (
              <span className="neo-badge bg-orange-500 text-white text-xs font-black animate-pulse flex items-center gap-1">
                🔥 {liveStreak} IN A ROW
              </span>
            )}
          </div>
        </div>
        
        {timeLimitMinutes && timeLeft !== null && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-mono font-black text-xl ${
            timeLeft <= 60 ? "bg-red-400 text-white animate-pulse" : "bg-amber-100 text-amber-900"
          }`}>
            <Timer className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {isLocked && (
        <div className="p-4 bg-red-100 border-2 border-red-500 rounded-xl text-red-900 font-bold flex items-center justify-center gap-2">
          <Lock className="w-5 h-5" />
          Time is up or the host has ended the room. Your answers have been saved.
        </div>
      )}

      {/* Question Card */}
      <div className="neo-box bg-white p-6 sm:p-8 rounded-3xl space-y-6 min-h-[400px] flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-slate-400 uppercase tracking-widest">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            {isPending && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
          </div>
          
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
            {currentQuestion.text}
          </h2>

          <div className="space-y-3 pt-4">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = userAnswers[currentQuestion.id] === idx;
              const isQuestionLocked = lockedQuestions[currentQuestion.id];
              const isCorrect = questionResults[currentQuestion.id];
              
              let buttonStyle = "border-slate-200 hover:border-indigo-400 hover:bg-slate-50 text-slate-700";
              if (isSelected && !isQuestionLocked) {
                buttonStyle = "border-indigo-600 bg-indigo-50 text-indigo-900 shadow-[4px_4px_0px_0px_rgba(79,70,229,0.2)]";
              } else if (isQuestionLocked) {
                if (isSelected) {
                   buttonStyle = isCorrect 
                     ? "border-green-600 bg-green-50 text-green-900 shadow-[4px_4px_0px_0px_rgba(22,163,74,0.2)]" 
                     : "border-red-600 bg-red-50 text-red-900 shadow-[4px_4px_0px_0px_rgba(220,38,38,0.2)]";
                } else {
                   buttonStyle = "border-slate-200 opacity-50";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isLocked || isPending || isQuestionLocked}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-semibold flex items-center justify-between group ${buttonStyle} ${(isLocked || isPending || isQuestionLocked) ? "cursor-not-allowed" : ""}`}
                >
                  <span>{option}</span>
                  {isSelected && !isQuestionLocked && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                  {isSelected && isQuestionLocked && (isCorrect ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">X</div>)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-end pt-8 border-t-2 border-slate-100">
          <button
            onClick={handleNext}
            disabled={isLastQuestion}
            className="neo-btn neo-btn-cyan flex items-center disabled:opacity-50"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
      <AlertModal />
    </div>
  );
}
