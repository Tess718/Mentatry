"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Avatar from "@/components/ui/avatar";
import {
  Compass,
  Plus,
  KeyRound,
  Trophy,
  Timer,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  User,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

interface NavbarClientProps {
  user?: {
    id: string;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
}

export function NavbarClient({ user }: NavbarClientProps) {
  const pathname = usePathname();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
    : user?.email?.split("@")[0] || "Player";
  const avatarSeed = user?.email || user?.id || "default";

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Outside desktop navigation links (Discovery & Game modes only)
  const navLinks = [
    { label: "Explore", href: "/explore", icon: Compass },
    { label: "Daily Quiz", href: "/daily", icon: Timer },
    { label: "Join Room", href: "/rooms/join", icon: KeyRound },
  ];

  return (
    <>
      <div className="max-w-7xl w-full mx-auto relative flex items-center justify-between gap-3">
        {/* 1. Left: Brand Logo */}
        <div className="flex items-center shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 bg-amber-400 text-black px-2.5 sm:px-3 py-1 sm:py-1.5 font-black tracking-wider border-2 sm:border-3 border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] sm:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-0.5 transition-transform rounded-xl shrink-0"
          >
            <Image
              src="/mentatry_logo.png"
              alt="Mentatry Logo"
              width={26}
              height={26}
              className="w-5 h-5 sm:w-6 sm:h-6 object-contain shrink-0"
              priority
            />
            <span className="font-bebas tracking-widest text-xl sm:text-2xl leading-none pt-0.5">
              MENTATRY
            </span>
          </Link>
        </div>

        {/* 2. Center: Desktop Discovery Nav Links */}
        <nav className="hidden lg:flex items-center justify-center gap-1.5 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                  isActive
                    ? "bg-white/10 text-amber-300 border border-white/20 shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* 3. Right: Desktop Actions & Mobile Menu Triggers */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              {/* Create Quiz CTA Button (Desktop & Tablet) */}
              <Link
                href="/quizzes/new"
                className="hidden sm:inline-flex neo-btn neo-btn-lime text-xs py-2 px-3.5 font-black items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Create Quiz</span>
              </Link>

              {/* User Dropdown Menu (Desktop ONLY - lg+) */}
              <div className="hidden lg:block relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 bg-slate-900 text-white hover:bg-slate-800 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                  aria-expanded={isUserMenuOpen}
                  aria-label="User profile menu"
                >
                  <Avatar seed={avatarSeed} size={28} className="shrink-0" />
                  <span className="text-xs font-black text-amber-300 max-w-28 truncate">
                    {displayName}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      isUserMenuOpen ? "rotate-180 text-amber-300" : ""
                    }`}
                  />
                </button>

                {/* Floating Dropdown Card (Desktop) */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white border-3 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User Info Header */}
                    <div className="px-3.5 py-2.5 border-b-2 border-slate-200">
                      <div className="text-xs font-black text-black uppercase truncate">
                        {displayName}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-500 truncate">
                        {user.email}
                      </div>
                    </div>

                    {/* Personal Library Links */}
                    <div className="py-1.5 px-1.5 space-y-0.5">
                      <Link
                        href="/quizzes"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-yellow-300 hover:text-black rounded-lg transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-black" />
                        <span>My Quizzes & Dashboard</span>
                      </Link>

                      <Link
                        href="/achievements"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-amber-300 hover:text-black rounded-lg transition-colors"
                      >
                        <Trophy className="w-4 h-4 text-black" />
                        <span>My Achievements</span>
                      </Link>
                    </div>

                    {/* Logout Button */}
                    <div className="pt-1.5 px-1.5 border-t-2 border-slate-200">
                      <button
                        type="button"
                        onClick={async () => {
                          setIsUserMenuOpen(false);
                          await logoutAction();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-600" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Quick Create + Hamburger Trigger (< lg) */}
              <div className="flex lg:hidden items-center gap-2">
                <Link
                  href="/quizzes/new"
                  className="neo-btn neo-btn-lime text-xs py-1.5 px-2.5 font-black flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Create</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="flex items-center gap-1.5 p-1 bg-slate-900 text-white hover:bg-slate-800 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                  aria-label="Toggle Mobile Menu"
                >
                  <Avatar seed={avatarSeed} size={28} className="shrink-0" />
                  <Menu className="w-4 h-4 mr-1 text-amber-300 stroke-[2.5]" />
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Desktop Logged-Out Actions (lg+) */}
              <div className="hidden lg:flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-xs font-black uppercase tracking-wider text-slate-200 hover:text-white px-3 py-2 transition-colors"
                >
                  Log In
                </Link>

                <Link
                  href="/signup"
                  className="neo-btn neo-btn-pink text-xs py-2 px-4 font-black flex items-center gap-1.5"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                </Link>
              </div>

              {/* Mobile Logged-Out Actions (< lg) — Clean Hamburger Only */}
              <div className="flex lg:hidden items-center">
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-1.5 bg-slate-900 text-white hover:bg-slate-800 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                  aria-label="Toggle Navigation Menu"
                >
                  <Menu className="w-5 h-5 text-amber-300 stroke-[2.5]" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 4. Full-Screen Viewport Portal Mobile Navigation Drawer */}
      {mounted && isMobileMenuOpen && createPortal(
        <div className="lg:hidden fixed inset-0 z-[9999] flex flex-col justify-start">
          {/* Backdrop overlay */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
          />

          {/* Sliding Navigation Container */}
          <div className="relative w-full bg-slate-950 border-b-4 border-black shadow-[0_16px_50px_rgba(0,0,0,0.95)] p-5 z-10 animate-in slide-in-from-top-4 duration-200 max-h-[85vh] overflow-y-auto">
            {/* Header: Brand + Close Button */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-800">
              <div className="flex items-center gap-2 bg-amber-400 text-black px-2.5 py-1 font-black rounded-lg border-2 border-black">
                <Image
                  src="/mentatry_logo.png"
                  alt="Mentatry Logo"
                  width={24}
                  height={24}
                  className="w-5 h-5 object-contain shrink-0"
                />
                <span className="font-bebas tracking-widest text-lg pt-0.5">MENTATRY</span>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 bg-slate-900 text-white hover:bg-slate-800 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                aria-label="Close Menu"
              >
                <X className="w-5 h-5 stroke-[2.5] text-amber-300" />
              </button>
            </div>

            {/* User Profile Card (if logged in) */}
            {user && (
              <div className="my-4 p-3 bg-slate-900 border-2 border-black rounded-xl flex items-center gap-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <Avatar seed={avatarSeed} size={36} className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-amber-300 uppercase truncate">
                    {displayName}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-400 truncate">
                    {user.email}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Section */}
            {user ? (
              <div className="space-y-4 my-4">
                {/* 1. Play & Discovery */}
                <div>
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 px-1">
                    Play & Discover
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/explore"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-3 bg-violet-400 text-black border-2 border-black rounded-xl font-black text-xs uppercase flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5"
                    >
                      <Compass className="w-4 h-4 stroke-[2.5]" />
                      <span>Explore</span>
                    </Link>

                    <Link
                      href="/daily"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-3 bg-cyan-400 text-black border-2 border-black rounded-xl font-black text-xs uppercase flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5"
                    >
                      <Timer className="w-4 h-4 stroke-[2.5]" />
                      <span>Daily Quiz</span>
                    </Link>

                    <Link
                      href="/rooms/join"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-3 bg-pink-400 text-black border-2 border-black rounded-xl font-black text-xs uppercase flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5"
                    >
                      <KeyRound className="w-4 h-4 stroke-[2.5]" />
                      <span>Join Room</span>
                    </Link>

                    <Link
                      href="/quizzes/new"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-3 bg-lime-400 text-black border-2 border-black rounded-xl font-black text-xs uppercase flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Create Quiz</span>
                    </Link>
                  </div>
                </div>

                {/* 2. Personal Workspace */}
                <div>
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 px-1">
                    My Account
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/quizzes"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-3 bg-amber-400 text-black border-2 border-black rounded-xl font-black text-xs uppercase flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5"
                    >
                      <LayoutDashboard className="w-4 h-4 stroke-[2.5]" />
                      <span>Dashboard</span>
                    </Link>

                    <Link
                      href="/achievements"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-3 bg-yellow-300 text-black border-2 border-black rounded-xl font-black text-xs uppercase flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5"
                    >
                      <Trophy className="w-4 h-4 stroke-[2.5]" />
                      <span>Achievements</span>
                    </Link>
                  </div>
                </div>

                {/* 3. Sign Out */}
                <div className="pt-2 border-t-2 border-slate-800">
                  <button
                    type="button"
                    onClick={async () => {
                      setIsMobileMenuOpen(false);
                      await logoutAction();
                    }}
                    className="w-full p-2.5 bg-red-950/40 text-red-400 border-2 border-red-800 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 cursor-pointer hover:bg-red-900/60"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Guest Mobile Drawer (Minimal & 100% relevant) */
              <div className="space-y-4 my-4">
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    href="/explore"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-3 bg-violet-400 text-black border-2 border-black rounded-xl font-black text-xs uppercase flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5"
                  >
                    <Compass className="w-4 h-4 stroke-[2.5]" />
                    <span>Explore Quizzes</span>
                  </Link>

                  <Link
                    href="/rooms/join"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-3 bg-pink-400 text-black border-2 border-black rounded-xl font-black text-xs uppercase flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5"
                  >
                    <KeyRound className="w-4 h-4 stroke-[2.5]" />
                    <span>Join Room</span>
                  </Link>
                </div>

                {/* Auth Actions for Guests */}
                <div className="pt-3 border-t-2 border-slate-800 space-y-2">
                  <Link
                    href="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full p-3 neo-btn neo-btn-pink font-black text-xs uppercase flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 stroke-[2.5]" />
                    <span>Create Free Account</span>
                  </Link>

                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full p-3 neo-btn neo-btn-white font-black text-xs uppercase flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Log In</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
