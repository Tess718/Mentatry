"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Download, 
  Sparkles,
  ExternalLink,
  MessageCircle
} from "lucide-react";

interface ShareScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  attemptId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  isDailyQuiz?: boolean;
  streakCount?: number;
}

export function ShareScoreModal({
  isOpen,
  onClose,
  attemptId,
  quizTitle,
  score,
  totalQuestions,
  isDailyQuiz,
  streakCount,
}: ShareScoreModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const baseUrl = typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || "https://mentatry.vercel.app");
  const shareUrl = `${baseUrl}/share/result/${attemptId}`;
  const ogImageUrl = `/api/og/result/${attemptId}`;

  // Formatted Wordle/Duolingo style viral snippet
  const shareText = isDailyQuiz
    ? `⚡ Mentatry Daily Challenge!\n🎯 Score: ${score}/${totalQuestions} (${percentage}%)\n${streakCount ? `🔥 Streak: ${streakCount} Days\n` : ''}Can you beat my score?\n👉 ${shareUrl}`
    : `⚡ Mentatry Quiz: "${quizTitle}"\n🎯 Score: ${score}/${totalQuestions} (${percentage}%)\nThink you can beat me?\n👉 ${shareUrl}`;

  const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  const whatsappIntentUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Mentatry Quiz: ${quizTitle}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed, fallback to copy
        console.warn("Native share error or dismissed:", err);
      }
    } else {
      handleCopyText();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const handleDownloadImage = async () => {
    try {
      setIsDownloading(true);
      const res = await fetch(ogImageUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `mentatry-${isDailyQuiz ? 'daily' : 'score'}-${attemptId.slice(0, 8)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Failed to download image:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="neo-box p-6 sm:p-8 bg-white text-black max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-3 border-black pb-4">
          <div className="flex items-center gap-2.5">
            <Image
              src="/mentatry_logo.png"
              alt="Mentatry Logo"
              width={32}
              height={32}
              className="w-8 h-8 object-contain shrink-0"
            />
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Show Off Your Score</h2>
              <p className="text-xs font-bold text-slate-600">Challenge your friends to beat your result!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border-2 border-black bg-slate-100 hover:bg-pink-300 transition-colors flex items-center justify-center font-black"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Image Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-black uppercase text-slate-600">
            <span>Score Card Preview</span>
            <span className="text-emerald-600 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Auto-Generated
            </span>
          </div>
          <div className="relative aspect-[1200/630] w-full border-3 border-black rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-slate-950">
            {/* Live rendered OG image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ogImageUrl}
              alt="Generated Score Card"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Native Share on Mobile (if supported) */}
        {hasNativeShare && (
          <button
            onClick={handleNativeShare}
            className="neo-btn neo-btn-lime w-full py-3 text-sm font-black uppercase flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <Share2 className="w-4 h-4 stroke-[3]" />
            <span>Share via WhatsApp, Instagram, Messages...</span>
          </button>
        )}

        {/* Social Share Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* WhatsApp */}
          <a
            href={whatsappIntentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="neo-btn bg-emerald-400 text-black py-2.5 px-3 text-xs font-black uppercase flex items-center justify-center gap-2 hover:bg-emerald-300"
          >
            <MessageCircle className="w-4 h-4 fill-black" />
            <span>WhatsApp</span>
          </a>

          {/* X (Twitter) */}
          <a
            href={twitterIntentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="neo-btn bg-black text-white py-2.5 px-3 text-xs font-black uppercase flex items-center justify-center gap-2 hover:bg-slate-800"
          >
            <span className="font-mono text-sm font-bold">𝕏</span>
            <span>Post on X</span>
          </a>
        </div>

        {/* Copy & Download Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t-2 border-black pt-4">
          {/* Copy Shareable Text */}
          <button
            onClick={handleCopyText}
            className={`neo-btn py-2.5 px-3 text-xs font-black uppercase flex items-center justify-center gap-2 transition-colors ${
              copiedText ? "bg-emerald-300 text-black" : "bg-yellow-300 text-black hover:bg-yellow-200"
            }`}
          >
            {copiedText ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4 stroke-[2.5]" />}
            <span>{copiedText ? "Copied Snippet!" : "Copy Score Text"}</span>
          </button>

          {/* Download PNG */}
          <button
            onClick={handleDownloadImage}
            disabled={isDownloading}
            className="neo-btn neo-btn-white py-2.5 px-3 text-xs font-black uppercase flex items-center justify-center gap-2 hover:bg-slate-100 disabled:opacity-50"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>{isDownloading ? "Generating..." : "Download Image"}</span>
          </button>
        </div>

        {/* Copy Direct Link */}
        <div className="bg-slate-100 border-2 border-black p-2.5 rounded-xl flex items-center justify-between gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="bg-transparent text-xs font-mono text-slate-700 w-full outline-none select-all"
          />
          <button
            onClick={handleCopyLink}
            className={`neo-btn py-1 px-3 text-[11px] font-black uppercase shrink-0 ${
              copiedLink ? "bg-emerald-300 text-black" : "bg-black text-white"
            }`}
          >
            {copiedLink ? "Copied" : "Copy Link"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ShareScoreButton({
  attemptId,
  quizTitle,
  score,
  totalQuestions,
  isDailyQuiz,
  streakCount,
  variant = "lime",
  className = "",
}: {
  attemptId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  isDailyQuiz?: boolean;
  streakCount?: number;
  variant?: "lime" | "yellow" | "black" | "white";
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const btnClass = 
    variant === "lime" ? "neo-btn neo-btn-lime" :
    variant === "yellow" ? "neo-btn neo-btn-yellow" :
    variant === "black" ? "neo-btn neo-btn-black" :
    "neo-btn neo-btn-white";

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`${btnClass} text-sm flex items-center gap-2 ${className}`}
      >
        <Share2 className="w-4 h-4 stroke-[3]" />
        <span>Share Score</span>
      </button>

      <ShareScoreModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        attemptId={attemptId}
        quizTitle={quizTitle}
        score={score}
        totalQuestions={totalQuestions}
        isDailyQuiz={isDailyQuiz}
        streakCount={streakCount}
      />
    </>
  );
}
