"use client";

import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { deleteQuizAction } from "@/app/actions/quizzes";
import { Trash2, AlertTriangle, Loader2, X } from "lucide-react";
import { useAlertModal } from "@/components/ui/use-alert-modal";

export function DeleteQuizButton({
  quizId,
  quizTitle,
  fullWidth = false,
}: {
  quizId: string;
  quizTitle: string;
  fullWidth?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { showAlert, AlertModal } = useAlertModal();

  // Client-side portal mounting flag
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showModal && !isPending) {
        setShowModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showModal, isPending]);

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteQuizAction(quizId);
      if (res.error) {
        showAlert(res.error);
      } else {
        setShowModal(false);
        router.refresh();
      }
    });
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) {
          setShowModal(false);
        }
      }}
    >
      <div className="neo-box max-w-md w-full bg-white text-black p-6 sm:p-8 space-y-6 rounded-3xl shadow-[10px_10px_0px_0px_rgba(220,38,38,1)] border-4 border-black animate-in zoom-in-95 duration-150 relative z-50">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b-4 border-black pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500 border-2 border-black rounded-2xl text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <AlertTriangle className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-red-600">
                Delete Quiz?
              </h2>
              <p className="text-xs font-black uppercase text-slate-500">
                PERMANENT ACTION
              </p>
            </div>
          </div>

          <button
            onClick={() => !isPending && setShowModal(false)}
            disabled={isPending}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 border-2 border-black rounded-xl text-black transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-3">
          <p className="text-sm font-bold text-slate-900 leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="bg-amber-200 px-2 py-0.5 border border-black font-black uppercase">
              &quot;{quizTitle}&quot;
            </span>
            ?
          </p>
          <div className="bg-pink-50 border-2 border-red-500 p-3 rounded-xl text-xs font-bold text-red-900 leading-snug">
            ⚠️ This action cannot be undone. All questions and student attempt scores will be permanently deleted from the system.
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            disabled={isPending}
            className="neo-btn neo-btn-white w-full sm:w-auto text-xs py-2.5 px-5 font-black uppercase"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="neo-btn bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto text-xs py-2.5 px-5 flex items-center justify-center gap-2 font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 stroke-[2.5]" />
                <span>Confirm Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Delete Trigger Button */}
      <button
        onClick={() => setShowModal(true)}
        className={`neo-btn bg-red-400 hover:bg-red-500 text-black text-xs py-2 px-3 transition-colors ${
          fullWidth
            ? "w-full flex items-center justify-center gap-1.5 font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            : ""
        }`}
        title={`Delete "${quizTitle}"`}
        aria-label={`Delete quiz ${quizTitle}`}
      >
        <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
        {fullWidth && <span>Delete Quiz</span>}
      </button>

      {/* Render Modal into document.body using React Portal */}
      {mounted && showModal ? createPortal(modalContent, document.body) : null}
      <AlertModal />
    </>
  );
}
