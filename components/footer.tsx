import Link from "next/link";
import Image from "next/image";
import {
  Compass,
  Sparkles,
  Zap,
  Trophy,
  PlusCircle,
  Flame,
  ShieldCheck,
  FileText,
  LogIn,
  UserPlus,
  Heart,
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t-4 border-black bg-slate-950 text-slate-400 mt-16 pt-12 pb-8 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Column (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <span className="flex items-center gap-2 bg-amber-400 text-black px-2.5 py-1 font-black tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] group-hover:-translate-y-0.5 transition-transform rounded-xl">
                <Image
                  src="/mentatry_logo.png"
                  alt="Mentatry Logo"
                  width={24}
                  height={24}
                  className="w-5 h-5 object-contain"
                />
                <span className="font-bebas tracking-widest text-xl leading-none pt-0.5">
                  MENTATRY
                </span>
              </span>
            </Link>

            <p className="text-sm font-medium text-slate-400 max-w-sm leading-relaxed">
              Create, host, and conquer interactive quizzes from any topic in seconds. Built for classrooms, teams, and curious minds everywhere.
            </p>
          </div>

          {/* Nav Links (7 cols -> 3 sub-columns) */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Column 1: Platform */}
            <div className="space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Platform</span>
              </div>
              <ul className="space-y-2 text-xs font-bold">
                <li>
                  <Link
                    href="/explore"
                    className="hover:text-amber-300 transition-colors"
                  >
                    Explore Quizzes
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#features"
                    className="hover:text-amber-300 transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#faq"
                    className="hover:text-amber-300 transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Get Started */}
            <div className="space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Get Started</span>
              </div>
              <ul className="space-y-2 text-xs font-bold">
                <li>
                  <Link
                    href="/signup"
                    className="hover:text-amber-300 transition-colors text-amber-400"
                  >
                    Create Free Account &rarr;
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-amber-300 transition-colors"
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    href="/rooms/join"
                    className="hover:text-amber-300 transition-colors"
                  >
                    Join with Code
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Legal */}
            <div className="space-y-3 col-span-2 sm:col-span-1">
              <div className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
                <span>Legal</span>
              </div>
              <ul className="space-y-2 text-xs font-bold">
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-amber-300 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-amber-300 transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Sub-Footer Bar */}
        <div className="pt-8 border-t-2 border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-500">
          <div>
            &copy; {currentYear} <span className="text-slate-300 font-extrabold">Mentatry</span>. All rights reserved.
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Built for curious minds & trivia champions</span>
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          </div>
        </div>
      </div>
    </footer>
  );
}
