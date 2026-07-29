"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startRoomAction, endRoomAction, joinAsPlayerAction } from "@/app/actions/rooms";
import { Loader2, Users, Play, Square, UserPlus, Copy, Check } from "lucide-react";
import { useAlertModal } from "@/components/ui/use-alert-modal";

interface Participant {
  id: string;
  firstName: string;
}

export function HostRoomView({ roomId, initialJoinCode }: { roomId: string; initialJoinCode: string }) {
  const router = useRouter();
  const { showAlert, AlertModal } = useAlertModal();
  const [status, setStatus] = useState<string>("WAITING");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [maxParticipants, setMaxParticipants] = useState<number>(50);
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    let interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/rooms/${roomId}/status`);
        if (res.ok) {
          const data = await res.json();
          setStatus(data.status);
          setParticipants(data.participants || []);
          if (data.maxParticipants) setMaxParticipants(data.maxParticipants);

          // Stop polling on terminal states
          if (data.status === "COMPLETED" || data.status === "EXPIRED") {
            clearInterval(interval);
            
            // If the room completed elsewhere, redirect host to summary
            if (data.status === "COMPLETED") {
              router.push(`/rooms/${roomId}/summary`);
            }
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [roomId]);

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

  const handleJoinAsPlayer = () => {
    startTransition(async () => {
      const res = await joinAsPlayerAction(roomId);
      if (res.error) {
        showAlert(res.error);
      } else {
        setHasJoined(true);
        window.open(`/rooms/${roomId}/take`, "_blank"); // Open in new tab so host doesn't lose this screen
      }
    });
  };

  if (status === "EXPIRED") {
    return (
      <div className="max-w-4xl mx-auto pt-10">
        <div className="neo-box p-12 bg-white rounded-3xl text-center space-y-6">
          <h1 className="text-3xl font-black uppercase tracking-tight text-red-600">
            Room Expired
          </h1>
          <p className="text-lg font-bold text-slate-600">
            This room was automatically closed because it wasn't started within 30 minutes.
          </p>
          <button onClick={() => router.push("/quizzes")} className="neo-btn neo-btn-cyan">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 pt-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 neo-box p-6 sm:p-8 bg-amber-300 rounded-3xl">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-black tracking-tight leading-tight">
            Live Room Management
          </h1>
          <p className="text-slate-900 font-bold text-sm sm:text-base flex items-center gap-2">
            Status: 
            <span className={`px-2 py-0.5 rounded-full text-xs font-black ${status === 'WAITING' ? 'bg-white text-black' : status === 'ACTIVE' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
              {status}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          {/* Join Code Box */}
          <div className="neo-box p-6 bg-white rounded-2xl text-center space-y-4">
            <h3 className="text-lg font-black uppercase text-black">Join Code</h3>
            <div className="text-4xl font-mono font-black tracking-widest text-indigo-600 bg-indigo-50 py-4 rounded-xl border-2 border-indigo-200">
              {initialJoinCode}
            </div>
            <button onClick={handleCopyCode} className="neo-btn bg-white border-2 border-black w-full flex items-center justify-center font-bold">
              {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "COPIED!" : "COPY CODE"}
            </button>
          </div>

          {/* Host Controls */}
          <div className="neo-box p-6 bg-white rounded-2xl space-y-4">
            <h3 className="text-lg font-black uppercase text-black">Controls</h3>
            
            {status === "WAITING" && (
              <button onClick={handleStart} disabled={isPending} className="w-full neo-btn neo-btn-lime flex items-center justify-center">
                {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2 fill-black" />}
                START QUIZ
              </button>
            )}

            {status === "ACTIVE" && (
              <button onClick={handleEnd} disabled={isPending} className="w-full neo-btn neo-btn-pink flex items-center justify-center mt-4">
                {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Square className="w-4 h-4 mr-2 fill-black" />}
                END QUIZ
              </button>
            )}

            {!hasJoined && status !== "COMPLETED" && (
              <button onClick={handleJoinAsPlayer} disabled={isPending} className="w-full neo-btn bg-white border-2 border-black font-bold mt-4 flex items-center justify-center">
                <UserPlus className="w-4 h-4 mr-2" />
                Join as Player Too
              </button>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="neo-box p-6 bg-white rounded-2xl min-h-[400px]">
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-slate-100">
              <h3 className="text-xl font-black uppercase text-black flex items-center gap-2">
                <Users className="w-5 h-5" />
                Participants
              </h3>
              <span className="font-black text-lg bg-slate-100 px-3 py-1 rounded-lg border-2 border-slate-200">
                {participants.length} / {maxParticipants}
              </span>
            </div>

            {participants.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin opacity-50" />
                <p className="font-bold">Waiting for players to join...</p>
              </div>
            ) : (
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {participants.map(p => (
                  <li key={p.id} className="bg-slate-50 border-2 border-slate-200 px-4 py-3 rounded-xl font-bold text-center truncate shadow-sm">
                    {p.firstName}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      <AlertModal />
    </div>
  );
}
