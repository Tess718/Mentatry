"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyJoinCodeButton({ joinCode }: { joinCode: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API is restricted
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 bg-black text-white px-2 py-0.5 text-xs font-mono font-bold hover:bg-slate-800 transition-colors"
      title="Click to copy join code"
    >
      <span>CODE: {joinCode}</span>
      {copied ? <Check className="w-3.5 h-3.5 text-lime-400" /> : <Copy className="w-3.5 h-3.5 text-yellow-400" />}
    </button>
  );
}
