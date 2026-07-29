import { auth } from "@/auth";
import { ScrollHeader } from "@/components/scroll-header";
import Avatar from "@/components/ui/avatar";
import Link from "next/link";
import Image from "next/image";
import { Plus, KeyRound, Trophy } from "lucide-react";

export async function Navbar() {
  const session = await auth();
  const displayName = session?.user?.firstName || session?.user?.email;
  const avatarSeed = session?.user?.email || session?.user?.id || "default";

  return (
    <ScrollHeader>
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-2 md:gap-4">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 bg-amber-400 text-black px-2.5 md:px-3.5 py-1 md:py-1.5 font-black tracking-wider border-2 md:border-3 border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] md:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-0.5 transition-transform rounded-xl shrink-0"
        >
          <Image 
            src="/mentatry_logo.png" 
            alt="Mentatry Logo" 
            width={32} 
            height={32}
            className="w-5 h-5 md:w-6 md:h-6 object-contain shrink-0"
            priority
          />
          <span className="font-bebas tracking-widest text-xl md:text-2xl">MENTATRY</span>
        </Link>

        {/* Header Right Items */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {session?.user ? (
            <>
              {/* Dashboard Button — Always Visible */}
              <Link
                href="/quizzes"
                className="neo-btn neo-btn-white text-xs py-1.5 md:py-2 px-2.5 md:px-3.5 whitespace-nowrap shrink-0"
              >
                Dashboard
              </Link>
              
              {/* Achievements */}
              <Link
                href="/achievements"
                className="hidden md:inline-flex neo-btn neo-btn-white text-xs py-2 px-3.5 whitespace-nowrap items-center gap-1 shrink-0"
              >
                <Trophy className="w-3.5 h-3.5 stroke-[3]" />
                <span>Achievements</span>
              </Link>

              {/* Create Quiz — Desktop only (md+) */}
              <Link
                href="/quizzes/new"
                className="hidden md:inline-flex neo-btn neo-btn-lime text-xs py-2 px-3.5 whitespace-nowrap items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Create Quiz</span>
              </Link>

              {/* Join Code — Desktop only (md+) */}
              <Link
                href="/quizzes/join"
                className="hidden md:inline-flex neo-btn neo-btn-pink text-xs py-2 px-3.5 whitespace-nowrap items-center gap-1 shrink-0"
              >
                <KeyRound className="w-3.5 h-3.5 stroke-[3]" />
                <span>Join Code</span>
              </Link>

              {/* Avatar — Always Visible */}
              <div className="flex items-center shrink-0">
                {/* Small Screen: Avatar Icon Only */}
                <div className="flex md:hidden items-center">
                  <Avatar seed={avatarSeed} size={30} />
                </div>

                {/* Desktop (md+): Avatar + User Name Badge */}
                <div className="hidden md:inline-flex items-center gap-2 pl-2 border-l-2 border-slate-700">
                  <span className="inline-flex items-center gap-2 bg-slate-900 text-amber-300 border-2 border-black px-2.5 py-1 text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg">
                    <Avatar seed={avatarSeed} size={24} />
                    <span className="truncate max-w-28">{displayName}</span>
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="neo-btn neo-btn-white text-xs py-1.5 md:py-2 px-2.5 md:px-4 whitespace-nowrap">
                Log In
              </Link>
              <Link href="/signup" className="neo-btn neo-btn-pink text-xs py-1.5 md:py-2 px-2.5 md:px-4 whitespace-nowrap">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </ScrollHeader>
  );
}
