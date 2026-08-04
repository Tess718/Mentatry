"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startRoomAction, endRoomAction, advanceToQuestionAction, showResultsAction, showLeaderboardAction } from "@/app/actions/rooms";
import { Loader2, Users, Check, Play, Square, ChevronRight, BarChart3, Trophy, X, Copy } from "lucide-react";
import { useAlertModal } from "@/components/ui/use-alert-modal";

interface Participant {
  id: string;
  firstName: string;
}

import { HostQuestionData } from "./host-room-view";
import Avatar from "@/components/ui/avatar";
import { useSSERelay } from "@/hooks/use-sse-relay";

export function GuestHostDashboard({ roomId, initialJoinCode, questions }: { roomId: string; initialJoinCode: string; questions?: HostQuestionData[] }) {
  const router = useRouter();
  const { showAlert, AlertModal } = useAlertModal();
  
  const [status, setStatus] = useState<string>("WAITING");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [maxParticipants, setMaxParticipants] = useState<number>(50);
  
  // Game State
  const [currentPhase, setCurrentPhase] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [phaseStartedAt, setPhaseStartedAt] = useState<string | null>(null);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(false);
  const [answerCount, setAnswerCount] = useState<number>(0);
  
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const syncState = async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/status`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status);
        setParticipants(data.participants || []);
        if (data.maxParticipants) setMaxParticipants(data.maxParticipants);
        
        if (data.currentPhase) setCurrentPhase(data.currentPhase);
        if (data.currentQuestionIndex !== undefined) setCurrentQuestionIndex(data.currentQuestionIndex);
        if (data.phaseStartedAt) setPhaseStartedAt(data.phaseStartedAt);
        if (data.autoAdvance !== undefined) setAutoAdvance(data.autoAdvance);
        if (data.answerCount !== undefined) setAnswerCount(data.answerCount);

        if (data.status === "COMPLETED" || data.status === "EXPIRED") {
          return data.status; // Return status so interval can be cleared
        }
      }
    } catch (err) {
      console.error("State sync error:", err);
    }
    return null;
  };

  // 1. Always-on Polling Fallback
  useEffect(() => {
    // Fallback polling for missed SSE events or general state sync
    const interval = setInterval(async () => {
      const finalStatus = await syncState();
      if (finalStatus === "COMPLETED" || finalStatus === "EXPIRED") {
        clearInterval(interval);
        if (finalStatus === "COMPLETED") {
          router.push(`/rooms/${roomId}/summary`);
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [roomId, router]);

  // 2. Additive SSE Relay
  useSSERelay({
    roomId,
    onEvent: (event) => {
      // For immediate UI feedback, we can optimistically update
      if (event.type === 'answer_submitted') {
        setAnswerCount(prev => prev + 1);
      } else {
        // But for phase changes and joins, always trigger an out-of-band fetch to get exact authoritative state
        syncState();
      }
    },
    onResync: () => {
      // Triggered immediately when EventSource recovers from a drop
      syncState();
    }
  });

  // Auto-advance logic
  useEffect(() => {
    if (!autoAdvance) return;
    
    // We only want to trigger the transition from the Host side once the phase has lasted long enough
    // But since the host doesn't know the question duration directly in this component yet, 
    // we can either fetch it or just use a dummy timeout for now. 
    // Wait, the host dashboard should know the question duration or we can just fetch it. 
    // Let's implement a simple 10s timeout for results and 5s for leaderboard.
    // For questions, we need the actual duration.
    let timer: NodeJS.Timeout;

    if (currentPhase === "QUESTION_RESULTS") {
      timer = setTimeout(() => {
        handleNextPhase();
      }, 5000); // 5 seconds for results
    } else if (currentPhase === "LEADERBOARD") {
      timer = setTimeout(() => {
        handleNextPhase();
      }, 5000); // 5 seconds for leaderboard
    }

    return () => clearTimeout(timer);
  }, [currentPhase, autoAdvance]);

  // Auto-advance to results when all players have answered
  useEffect(() => {
    if (autoAdvance && currentPhase === "QUESTION_ACTIVE" && participants.length > 0 && answerCount >= participants.length) {
      // Small delay to ensure the last player sees the "Waiting" spinner briefly
      const timer = setTimeout(() => {
        if (!isPending) {
          startTransition(async () => {
            const res = await showResultsAction(roomId);
            if (res.error) showAlert(res.error);
          });
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoAdvance, currentPhase, answerCount, participants.length, isPending, roomId, showAlert]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(initialJoinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStart = () => {
    startTransition(async () => {
      const res = await startRoomAction(roomId);
      if (res.error) showAlert(res.error);
    });
  };

  const handleEnd = () => {
    startTransition(async () => {
      const res = await endRoomAction(roomId);
      if (res.error) {
        showAlert(res.error);
      } else {
        router.push(`/rooms/${roomId}/summary`);
      }
    });
  };

  const handleNextPhase = () => {
    startTransition(async () => {
      if (currentPhase === "QUESTION_ACTIVE") {
        const res = await showResultsAction(roomId);
        if (res.error) showAlert(res.error);
      } else if (currentPhase === "QUESTION_RESULTS") {
        const res = await showLeaderboardAction(roomId);
        if (res.error) showAlert(res.error);
      } else if (currentPhase === "LEADERBOARD") {
        const res = await advanceToQuestionAction(roomId, currentQuestionIndex + 1);
        if (res.error) showAlert(res.error);
      }
    });
  };

  if (status === "EXPIRED") {
    return (
      <div className="max-w-4xl mx-auto pt-10">
        <div className="neo-box p-12 bg-white rounded-3xl text-center space-y-6">
          <h1 className="text-3xl font-black uppercase tracking-tight text-red-600">Room Expired</h1>
          <button onClick={() => router.push("/quizzes")} className="neo-btn neo-btn-cyan">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pt-6">
      <AlertModal />
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white neo-box p-4 mb-6">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black text-slate-900 leading-none">Guest Game</h1>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg border-2 border-slate-200">
              <Users className="w-4 h-4 text-slate-500" />
              <span className="font-bold text-slate-700 text-sm">{participants.length} / {maxParticipants}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {status === "WAITING" ? (
            <button
              onClick={handleStart}
              disabled={isPending}
              className="neo-btn neo-btn-green flex-1 sm:flex-none flex items-center justify-center gap-2"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
              <span>START GAME</span>
            </button>
          ) : (
            <>
              {autoAdvance && (
                <div className="px-3 py-2 bg-lime-100 border-2 border-lime-300 text-lime-800 rounded-lg text-sm font-bold flex items-center gap-2">
                  <Play className="w-4 h-4" /> Auto-Advance ON
                </div>
              )}
              <button
                onClick={handleEnd}
                disabled={isPending}
                className="neo-btn bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 shadow-[4px_4px_0px_0px_rgba(226,232,240,1)] flex-1 sm:flex-none flex items-center justify-center gap-2"
              >
                <Square className="w-5 h-5 fill-current" />
                <span>END GAME</span>
              </button>
            </>
          )}
        </div>
      </div>

      {status === "WAITING" ? (
        <div className="text-center neo-box bg-white p-8 sm:p-12">
          <h2 className="text-3xl sm:text-4xl font-black mb-6">
            {participants.length > 0 ? "Players joined so far" : "Waiting for players..."}
          </h2>
          <div 
            onClick={handleCopyCode}
            className="inline-block cursor-pointer group mb-8"
            title="Click to copy join code"
          >
            <div className="text-5xl sm:text-7xl font-black tracking-widest text-cyan-600 px-8 py-4 bg-cyan-50 border-4 border-cyan-600 rounded-3xl group-hover:bg-cyan-100 group-hover:-translate-y-1 group-active:translate-y-0 transition-all flex items-center justify-center gap-4 shadow-[4px_4px_0px_0px_rgba(8,145,178,1)]">
              {initialJoinCode}
              {copied ? <Check className="w-8 h-8 text-green-600" /> : <Copy className="w-8 h-8 text-cyan-600 opacity-50 group-hover:opacity-100 transition-opacity" />}
            </div>
            {copied && <div className="text-green-600 font-bold mt-2 text-sm">Copied to clipboard!</div>}
          </div>

          {participants.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-4 justify-center">
              {participants.map((p) => (
                <div key={p.id} className="bg-slate-50 border-2 border-slate-200 p-3 rounded-xl flex flex-col items-center justify-center shadow-sm animate-in zoom-in duration-300">
                  <Avatar seed={p.firstName} size={48} className="mb-2" />
                  <span className="font-bold text-slate-800 text-sm max-w-[80px] text-center truncate">{p.firstName}</span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-12">
            <button
              onClick={handleEnd}
              disabled={isPending}
              className="neo-btn bg-white hover:bg-red-50 text-red-600 border-2 border-red-200 shadow-[4px_4px_0px_0px_rgba(254,202,202,1)] text-sm py-2 px-6"
            >
              Cancel Room
            </button>
          </div>
        </div>
      ) : (
        <div className="neo-box bg-white p-8 min-h-[500px] flex flex-col">
          {/* Main Display Area */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            {currentPhase === "QUESTION_ACTIVE" && (
              <div className="space-y-6 w-full">
                {questions && questions[currentQuestionIndex] && (
                  <div className="bg-slate-50 p-8 rounded-3xl mb-8 border-2 border-slate-100 shadow-sm animate-in fade-in zoom-in duration-500">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                      {questions[currentQuestionIndex].text}
                    </h2>
                  </div>
                )}
                <h2 className="text-3xl font-black">Question {currentQuestionIndex + 1} is active</h2>
                <div className="text-xl font-bold text-slate-500">{answerCount} / {participants.length} Answers In</div>
                {/* Timer logic could go here */}
              </div>
            )}
            
            {currentPhase === "QUESTION_RESULTS" && (
              <div className="space-y-8 w-full">
                {questions && questions[currentQuestionIndex] && (
                  <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 shadow-sm mb-4">
                    <h2 className="text-2xl font-black text-slate-500 mb-6">
                      {questions[currentQuestionIndex].text}
                    </h2>
                    <div className="inline-flex items-center gap-3 bg-green-100 border-2 border-green-400 text-green-800 px-8 py-4 rounded-2xl animate-in zoom-in duration-500">
                      <div className="bg-green-500 rounded-full p-1">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-2xl font-black">
                        {questions[currentQuestionIndex].options[questions[currentQuestionIndex].correctIndex]}
                      </span>
                    </div>
                  </div>
                )}
                <div>
                  <BarChart3 className="w-20 h-20 mx-auto text-yellow-500 mb-4" />
                  <h2 className="text-4xl font-black">Results</h2>
                </div>
              </div>
            )}

            {currentPhase === "LEADERBOARD" && (
              <div className="space-y-6">
                <Trophy className="w-24 h-24 mx-auto text-amber-500" />
                <h2 className="text-4xl font-black">Leaderboard</h2>
              </div>
            )}
          </div>
          
          {/* Host Controls */}
          {!autoAdvance && (
            <div className="mt-8 pt-6 border-t-2 border-slate-100 flex justify-end">
              <button
                onClick={handleNextPhase}
                disabled={isPending}
                className="neo-btn neo-btn-cyan flex items-center gap-2"
              >
                <span>
                  {currentPhase === "QUESTION_ACTIVE" ? "Show Results" : 
                   currentPhase === "QUESTION_RESULTS" ? "Show Leaderboard" : 
                   "Next Question"}
                </span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
