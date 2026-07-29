"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAlertModal } from "@/components/ui/use-alert-modal";

export function ParticipantWaitView({ roomId }: { roomId: string }) {
  const router = useRouter();
  const { showAlert, AlertModal } = useAlertModal();
  const [status, setStatus] = useState<string>("WAITING");
  const [participantsCount, setParticipantsCount] = useState<number>(0);
  const [maxParticipants, setMaxParticipants] = useState<number>(50);

  useEffect(() => {
    let interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/rooms/${roomId}/status`);
        if (res.ok) {
          const data = await res.json();
          setStatus(data.status);
          if (data.participants) setParticipantsCount(data.participants.length);
          if (data.maxParticipants) setMaxParticipants(data.maxParticipants);

          if (data.status === "ACTIVE") {
            clearInterval(interval);
            router.push(`/rooms/${roomId}/take`);
          } else if (data.status === "COMPLETED") {
            clearInterval(interval);
            if (data.userAttemptId) {
              router.push(`/quizzes/${data.quizId}/results/${data.userAttemptId}`);
            } else {
              showAlert("The host ended this room.", () => {
                router.push("/quizzes");
              });
            }
          } else if (data.status === "EXPIRED") {
            clearInterval(interval);
            // Handle below in UI render
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [roomId, router]);

  return (
    <div className="max-w-2xl mx-auto pt-20">
      {status === "EXPIRED" ? (
        <div className="neo-box p-12 bg-white rounded-3xl text-center space-y-6">
          <h1 className="text-3xl font-black uppercase tracking-tight text-red-600">
            Room Expired
          </h1>
          <p className="text-lg font-bold text-slate-600">
            The host never started this room.
          </p>
          <button onClick={() => router.push("/quizzes")} className="neo-btn neo-btn-cyan">
            Return to Dashboard
          </button>
        </div>
      ) : (
        <div className="neo-box p-12 bg-white rounded-3xl text-center space-y-6">
          <div className="inline-flex p-6 bg-amber-200 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-bounce">
            <Loader2 className="w-12 h-12 text-black animate-spin" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black">
            You're in!
          </h1>
          <p className="text-lg font-bold text-slate-600">
            Waiting for the host to start the quiz...
          </p>
          <p className="text-sm font-semibold text-slate-400">
            Your screen will automatically update when the quiz begins.
          </p>
          <div className="inline-flex items-center justify-center bg-slate-100 border-2 border-slate-200 px-4 py-2 rounded-xl text-slate-600 font-bold">
            <span className="text-black font-black text-xl mr-1">{participantsCount}</span> / {maxParticipants} Participants
          </div>
        </div>
      )}
      <AlertModal />
    </div>
  );
}
