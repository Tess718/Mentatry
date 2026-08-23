"use client";

import { useEffect } from "react";
import "./globals.css";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root Layout Global Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="grid-bg-dark text-white flex flex-col min-h-screen items-center justify-center p-4">
        <div className="max-w-lg w-full neo-box p-8 bg-white text-black border-3 border-black rounded-3xl space-y-6 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="inline-flex p-4 bg-amber-400 border-2 border-black rounded-2xl text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <AlertTriangle className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase text-black tracking-tight">
              Application Error
            </h1>
            <p className="text-sm font-semibold text-slate-600 leading-relaxed">
              An unexpected system error occurred. Please try reloading the application.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => reset()}
              className="neo-btn neo-btn-lime text-sm py-2.5 px-5 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4 stroke-[3]" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
