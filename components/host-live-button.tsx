"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createRoomAction } from "@/app/actions/rooms";
import { UserCheck, Loader2, Users, X } from "lucide-react";
import { useAlertModal } from "@/components/ui/use-alert-modal";

export function HostLiveButton({ quizId }: { quizId: string }) {
  const router = useRouter();
  const { showAlert, AlertModal } = useAlertModal();
  const [isPending, startTransition] = useTransition();
  const [cap, setCap] = useState<string>(""); // empty means default 50
  const [showModal, setShowModal] = useState(false);

  const handleConfirm = () => {
    const maxParticipants = cap ? parseInt(cap, 10) : undefined;
    
    startTransition(async () => {
      const res = await createRoomAction(quizId, maxParticipants);
      if (res.roomId) {
        setShowModal(false);
        router.push(`/rooms/${res.roomId}/host`);
      } else {
        showAlert(res.error || "Failed to create room");
      }
    });
  };

  return (
    <>
      <AlertModal />
      <button
        onClick={() => setShowModal(true)}
        className="neo-btn neo-btn-yellow text-xs py-2.5 px-4 flex-1 flex items-center justify-center gap-2"
      >
        <UserCheck className="w-4 h-4 stroke-[3]" />
        <span>HOST</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="neo-box bg-white max-w-sm w-full p-6 space-y-5 animate-in zoom-in-95 duration-200 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black rounded-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-300 rounded-xl border-2 border-black">
                  <Users className="w-5 h-5 stroke-[2.5] text-black" />
                </div>
                <h3 className="font-black text-xl text-slate-900 uppercase tracking-tight">Host Live Room</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                disabled={isPending}
                className="text-slate-400 hover:text-black transition-colors"
              >
                <X className="w-5 h-5 stroke-[3]" />
              </button>
            </div>
            
            <div className="space-y-2">
              <label htmlFor={`cap-modal-${quizId}`} className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                Max Participants
              </label>
              <input 
                id={`cap-modal-${quizId}`}
                type="number"
                min="2"
                max="200"
                value={cap}
                onChange={(e) => setCap(e.target.value)}
                placeholder="50 (Default)"
                className="neo-input text-sm py-2 px-3 bg-slate-50 w-full"
                disabled={isPending}
              />
              <p className="text-[10px] font-bold text-slate-500">Leave blank to use the default capacity of 50 players.</p>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isPending}
                className="neo-btn bg-slate-200 text-black border-2 border-black flex-1 py-2 text-xs"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirm}
                disabled={isPending}
                className="neo-btn neo-btn-lime flex-1 py-2 text-xs flex items-center justify-center gap-2"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4 stroke-[3]" />}
                START
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
