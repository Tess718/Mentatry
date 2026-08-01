"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, X as XIcon } from "lucide-react";
import { calculateAnswerPoints } from "@/lib/scoring";

interface Question {
  id: string;
  text: string;
  options: string[];
  order: number;
}

export function GuestLiveQuizTaker({
  roomId,
  quizTitle,
  questions,
  initialPoints,
  initialStreak,
}: {
  roomId: string;
  quizTitle: string;
  questions: Question[];
  initialPoints?: number;
  initialStreak?: number;
}) {
  const router = useRouter();
  
  const [status, setStatus] = useState<string>("WAITING");
  const [currentPhase, setCurrentPhase] = useState<string>("WAITING");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [phaseStartedAt, setPhaseStartedAt] = useState<string | null>(null);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(10);
  
  // Local state
  const [selectedOriginalIndex, setSelectedOriginalIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [points, setPoints] = useState<number>(initialPoints || 0);
  const [streak, setStreak] = useState<number>(initialStreak || 0);
  const [lastQuestionCorrect, setLastQuestionCorrect] = useState<boolean | null>(null);
  const [lastPointsEarned, setLastPointsEarned] = useState<number>(0);

  // We need to shuffle options once per question
  const [shuffledOptions, setShuffledOptions] = useState<{ text: string; originalIndex: number }[]>([]);

  const prevPhaseRef = useRef<string | null>(null);

  useEffect(() => {
    let interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/rooms/${roomId}/status`);
        if (res.ok) {
          const data = await res.json();
          setStatus(data.status);
          
          if (data.timeLimitMinutes) setTimeLimitMinutes(data.timeLimitMinutes);
          
          if (data.currentPhase) {
            // Detect phase changes
            if (prevPhaseRef.current !== data.currentPhase) {
              if (data.currentPhase === "QUESTION_ACTIVE") {
                // Reset selected option for new question
                setSelectedOriginalIndex(null);
                setLastQuestionCorrect(null);
                setLastPointsEarned(0);
                
                // Shuffle options for the new question
                const currentQ = questions[data.currentQuestionIndex];
                if (currentQ) {
                  const mapped = currentQ.options.map((opt, i) => ({ text: opt, originalIndex: i }));
                  // Fisher-Yates shuffle
                  for (let i = mapped.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [mapped[i], mapped[j]] = [mapped[j], mapped[i]];
                  }
                  setShuffledOptions(mapped);
                }
              }
              prevPhaseRef.current = data.currentPhase;
            }
            setCurrentPhase(data.currentPhase);
          }
          
          if (data.currentQuestionIndex !== undefined) setCurrentQuestionIndex(data.currentQuestionIndex);
          if (data.phaseStartedAt) setPhaseStartedAt(data.phaseStartedAt);

          if (data.status === "COMPLETED" || data.status === "EXPIRED") {
            clearInterval(interval);
            router.push(`/play/${roomId}/leaderboard`);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [roomId, router, questions]);

  const handleSelectOption = async (originalIndex: number) => {
    if (selectedOriginalIndex !== null || isSubmitting || currentPhase !== "QUESTION_ACTIVE") return;
    
    setSelectedOriginalIndex(originalIndex);
    setIsSubmitting(true);
    
    const timeTakenMs = phaseStartedAt ? Date.now() - new Date(phaseStartedAt).getTime() : 1000;
    
    try {
      const res = await fetch(`/api/rooms/${roomId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: questions[currentQuestionIndex].id,
          selectedOption: originalIndex,
          timeTakenMs,
        }),
      });
      
      if (res.ok) {
        const body = await res.json();
        const isCorrect = body.isCorrect;
        
        setLastQuestionCorrect(isCorrect);
        
        if (isCorrect) {
          const expectedDurationMs = timeLimitMinutes
            ? (timeLimitMinutes * 60 * 1000) / (questions.length || 1)
            : 15000;
          const pts = calculateAnswerPoints(true, timeTakenMs, expectedDurationMs, streak);
          setLastPointsEarned(pts);
          setPoints(p => p + pts);
          setStreak(s => s + 1);
        } else {
          setStreak(0);
        }
      } else {
        const errorBody = await res.json().catch(() => ({}));
        if (errorBody.error !== "You have already submitted an answer for this question.") {
          console.error("Server returned error:", errorBody);
          setSelectedOriginalIndex(null); // revert on error so they can try again
        }
      }
    } catch (err) {
      console.error(err);
      setSelectedOriginalIndex(null); // revert on error
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "EXPIRED") {
    return (
      <div className="neo-box p-12 bg-white rounded-3xl text-center space-y-6 max-w-lg mx-auto mt-20">
        <h1 className="text-3xl font-black text-red-600">Room Expired</h1>
        <button onClick={() => router.push("/")} className="neo-btn neo-btn-cyan">Go Home</button>
      </div>
    );
  }

  if (status === "WAITING" || currentPhase === "WAITING" || currentPhase === null) {
    return (
      <div className="neo-box p-12 bg-white rounded-3xl text-center space-y-6 max-w-lg mx-auto mt-20">
        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto" />
        <h1 className="text-3xl font-black">You're in!</h1>
        <p className="text-lg font-bold text-slate-600">See your nickname on screen</p>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];
  if (!currentQ) return null;

  if (currentPhase === "QUESTION_ACTIVE") {
    return (
      <div className="space-y-6 max-w-4xl mx-auto mt-6">
        {selectedOriginalIndex === null ? (
          <>
            <div className="neo-box bg-white p-6 md:p-12 text-center rounded-3xl">
              <h2 className="text-3xl md:text-5xl font-black">{currentQ.text}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shuffledOptions.map((opt, idx) => {
                const colors = [
                  "bg-red-400 text-black", 
                  "bg-blue-400 text-black", 
                  "bg-yellow-400 text-black", 
                  "bg-green-400 text-black"
                ];
                const colorClass = colors[idx % 4];
                
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(opt.originalIndex)}
                    disabled={isSubmitting}
                    className={`p-8 md:p-12 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black text-2xl md:text-3xl transition-transform hover:-translate-y-1 hover:translate-x-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${colorClass}`}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="neo-box bg-slate-100 p-12 text-center rounded-3xl mt-20 animate-in fade-in duration-300">
            <Loader2 className="w-16 h-16 text-slate-400 animate-spin mx-auto mb-6" />
            <h2 className="text-4xl font-black text-slate-700">Waiting for others...</h2>
          </div>
        )}
      </div>
    );
  }

  if (currentPhase === "QUESTION_RESULTS") {
    return (
      <div className="max-w-2xl mx-auto mt-10">
        <div className={`neo-box p-12 text-center rounded-3xl ${lastQuestionCorrect ? 'bg-green-400' : 'bg-red-400'}`}>
          <div className="animate-in zoom-in duration-300">
            <h1 className="text-5xl md:text-7xl font-black text-black mb-6 tracking-tight drop-shadow-sm">
              {lastQuestionCorrect ? "Correct!" : "Incorrect"}
            </h1>
            
            <div className="inline-block bg-white text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-8 py-3 rounded-full font-black text-3xl mb-8 transform -rotate-2">
              {lastQuestionCorrect ? `+${lastPointsEarned}` : "0"}
            </div>
            
            <div className="flex items-center justify-center gap-6 mt-8 p-6 bg-black/10 rounded-2xl border-4 border-black border-dashed">
              <div>
                <div className="text-sm font-black uppercase text-black/70">Streak</div>
                <div className="text-4xl font-black text-black">{streak}</div>
              </div>
              <div className="w-2 h-12 bg-black/20 rounded-full" />
              <div>
                <div className="text-sm font-black uppercase text-black/70">Total Score</div>
                <div className="text-4xl font-black text-black">{points}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentPhase === "LEADERBOARD") {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center animate-in fade-in duration-300">
        <div className="neo-box bg-cyan-400 p-12 rounded-3xl text-black">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Get ready...</h1>
          <p className="text-2xl font-bold bg-white inline-block px-6 py-2 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Next question coming up</p>
        </div>
      </div>
    );
  }

  return null;
}
