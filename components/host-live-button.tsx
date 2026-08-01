"use client";

import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { createRoomAction } from "@/app/actions/rooms";
import { UserCheck, Loader2, Users, X } from "lucide-react";
import { useAlertModal } from "@/components/ui/use-alert-modal";

export function HostLiveButton({ quizId }: { quizId: string }) {
  const router = useRouter();
  const { showAlert, AlertModal } = useAlertModal();
  const [isPending, startTransition] = useTransition();
  const [cap, setCap] = useState<string>(""); // empty means default 50
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleConfirm = () => {
    const maxParticipants = cap ? parseInt(cap, 10) : undefined;
    
    startTransition(async () => {
      const res = await createRoomAction(quizId, maxParticipants, isGuestMode, autoAdvance);
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

      {showModal && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
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
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                Access Mode
              </label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setIsGuestMode(false)}
                  className={`neo-btn py-2 px-3 text-xs text-left ${!isGuestMode ? 'neo-btn-yellow' : 'bg-slate-100 border-2 border-slate-300 shadow-none text-slate-600'}`}
                >
                  <div className="font-black">Require Accounts</div>
                  <div className="text-[10px] opacity-80 font-semibold mt-0.5 leading-tight">Players log in. Stats saved.</div>
                </button>
                <button
                  type="button"
                  onClick={() => setIsGuestMode(true)}
                  className={`neo-btn py-2 px-3 text-xs text-left ${isGuestMode ? 'neo-btn-cyan' : 'bg-slate-100 border-2 border-slate-300 shadow-none text-slate-600'}`}
                >
                  <div className="font-black">Guest Mode </div>
                  <div className="text-[10px] opacity-80 font-semibold mt-0.5 leading-tight">Host-driven synchronous pacing. No accounts.</div>
                </button>
              </div>
            </div>

            {isGuestMode && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                  Game Pacing
                </label>
                <button
                  type="button"
                  onClick={() => setAutoAdvance(!autoAdvance)}
                  className={`neo-btn py-2 px-3 text-xs text-left w-full flex items-center justify-between ${autoAdvance ? 'neo-btn-lime' : 'bg-slate-100 border-2 border-slate-300 shadow-none text-slate-600'}`}
                >
                  <div>
                    <div className="font-black">Auto-Advance</div>
                    <div className="text-[10px] opacity-80 font-semibold mt-0.5 leading-tight">
                      Automatically move to results when time is up
                    </div>
                  </div>
                  <div className={`w-10 h-5 rounded-full border-2 border-black flex items-center p-0.5 transition-colors ${autoAdvance ? 'bg-white' : 'bg-slate-300'}`}>
                    <div className={`w-3 h-3 bg-black rounded-full transition-transform ${autoAdvance ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </button>
              </div>
            )}

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
        </div>,
        document.body
      )}
    </>
  );
}
