"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { checkRoomJoinCodeAction, joinGuestRoomAction, joinRoomAction } from "@/app/actions/rooms";
import { Loader2, ArrowRight, User } from "lucide-react";
import Avatar from "@/components/ui/avatar";

export function JoinLiveRoomForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [joinCode, setJoinCode] = useState(searchParams.get("code") || "");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  // State to track if we discovered it's a guest room and need a display name
  const [needsDisplayName, setNeedsDisplayName] = useState(false);
  const [debouncedDisplayName, setDebouncedDisplayName] = useState(displayName);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedDisplayName(displayName);
    }, 500);
    return () => clearTimeout(handler);
  }, [displayName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!joinCode.trim()) {
      setError("Please enter a join code.");
      return;
    }

    startTransition(async () => {
      if (needsDisplayName) {
        if (!displayName.trim()) {
          setError("Display name is required for this room.");
          return;
        }
        const res = await joinGuestRoomAction(joinCode.trim(), displayName.trim());
        if (res.error) {
          setError(res.error);
        } else if (res.roomId) {
          router.push(`/play/${res.roomId}/wait`);
        }
        return;
      }

      // Initial check
      const checkRes = await checkRoomJoinCodeAction(joinCode.trim());
      
      if (checkRes.error) {
        setError(checkRes.error);
        return;
      }

      if (checkRes.isGuestMode) {
        setNeedsDisplayName(true);
      } else {
        // Require auth. Let's try to join via authenticated action.
        const joinRes = await joinRoomAction(joinCode.trim());
        if (joinRes.error === "Unauthorized.") {
          router.push(`/login?callbackUrl=${encodeURIComponent(`/rooms/join?code=${joinCode.trim()}`)}`);
          return;
        } else if (joinRes.error) {
          setError(joinRes.error);
        } else if (joinRes.roomId) {
          router.push(`/rooms/${joinRes.roomId}/wait`);
        }
      }
    });
  };

  return (
    <div className="w-full max-w-md bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-6 sm:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black uppercase text-black tracking-tight mb-2">
          Join Live Room
        </h1>
        <p className="text-slate-600 font-bold">
          Enter the join code provided by your host.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="joinCode" className="block text-sm font-black uppercase tracking-wider text-slate-700">
            Join Code
          </label>
          <input
            id="joinCode"
            type="text"
            value={joinCode}
            onChange={(e) => {
              setJoinCode(e.target.value);
              setError(null);
              setNeedsDisplayName(false);
            }}
            disabled={isPending || needsDisplayName}
            className="neo-input text-lg py-3 px-4 w-full text-center tracking-widest font-mono font-bold uppercase"
            placeholder="e.g. ABCDEF"
            autoComplete="off"
            maxLength={10}
          />
        </div>

        {needsDisplayName && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col items-center">
            
            {/* Live Avatar Preview */}
            <div className="p-2 bg-slate-100 rounded-2xl border-2 border-slate-200 transition-all duration-300">
              <Avatar seed={debouncedDisplayName.trim() || "guest"} size={80} />
            </div>

            <div className="w-full space-y-2">
              <label htmlFor="displayName" className="block text-sm font-black uppercase tracking-wider text-slate-700 text-left">
                Choose a Display Name
              </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  setError(null);
                }}
                disabled={isPending}
                className="neo-input text-lg py-3 pl-10 pr-4 w-full font-bold"
                placeholder="Guest123"
                autoComplete="off"
                maxLength={20}
                autoFocus
              />
            </div>
            <p className="text-xs font-bold text-slate-500 mt-1 text-left">This room is in Guest Mode. No account required.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-100 border-2 border-red-500 text-red-700 text-sm font-bold rounded-lg animate-in fade-in">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || !joinCode.trim()}
          className="neo-btn neo-btn-cyan w-full py-4 text-lg flex items-center justify-center gap-2"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>{needsDisplayName ? "Join as Guest" : "Continue"}</span>
              <ArrowRight className="w-5 h-5 stroke-[3]" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
