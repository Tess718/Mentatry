"use client";

import { X, AlertCircle } from "lucide-react";
import { useState, useCallback } from "react";

export function useAlertModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [onCloseCb, setOnCloseCb] = useState<(() => void) | null>(null);

  const showAlert = useCallback((msg: string, onClose?: () => void) => {
    setMessage(msg);
    if (onClose) setOnCloseCb(() => onClose);
    else setOnCloseCb(null);
    setIsOpen(true);
  }, []);

  const hideAlert = useCallback(() => {
    setIsOpen(false);
    if (onCloseCb) {
      onCloseCb();
    }
  }, [onCloseCb]);

  const AlertModal = () => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="neo-box bg-white max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95 duration-200 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-pink-300 rounded-xl text-black border-2 border-black shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <AlertCircle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="font-black text-xl text-slate-900 leading-tight tracking-tight uppercase">Notice</h3>
              <p className="text-sm font-bold text-slate-700 mt-2">{message}</p>
            </div>
            <button
              onClick={hideAlert}
              className="text-slate-400 hover:text-black transition-colors"
            >
              <X className="w-5 h-5 stroke-[3]" />
            </button>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={hideAlert}
              className="neo-btn bg-black text-white px-6 py-2.5 text-sm uppercase tracking-widest"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    );
  };

  return { showAlert, AlertModal };
}
