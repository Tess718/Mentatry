"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Brain, LayoutDashboard, PlusCircle, KeyRound, Home, LogOut, User, Menu, X, Sparkles, Trophy } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

export function Sidebar({
  user,
}: {
  user?: {
    id?: string;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close mobile drawer when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const displayName = user?.firstName || user?.email;

  const navLinks = user
    ? [
        { label: "My Dashboard", href: "/quizzes", icon: LayoutDashboard, color: "hover:bg-yellow-300 hover:text-black" },
        { label: "Achievements", href: "/achievements", icon: Trophy, color: "hover:bg-amber-300 hover:text-black" },
        { label: "Create Quiz", href: "/quizzes/new", icon: PlusCircle, color: "hover:bg-lime-300 hover:text-black" },
        { label: "Join Code", href: "/quizzes/join", icon: KeyRound, color: "hover:bg-pink-300 hover:text-black" },
      ]
    : [
        { label: "Join Code", href: "/quizzes/join", icon: KeyRound, color: "hover:bg-pink-300 hover:text-black" },
        { label: "Log In", href: "/login", icon: User, color: "hover:bg-cyan-300 hover:text-black" },
        { label: "Sign Up", href: "/signup", icon: Sparkles, color: "hover:bg-pink-300 hover:text-black" },
      ];

  return (
    <>
      {/* Mobile Top Bar Trigger (Visible on small screens) */}
      <div className="lg:hidden fixed top-3 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="neo-btn neo-btn-white p-2.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          aria-label="Toggle Sidebar Navigation"
        >
          {isOpen ? <X className="w-5 h-5 stroke-[3]" /> : <Menu className="w-5 h-5 stroke-[3]" />}
        </button>
      </div>

      {/* Backdrop overlay for mobile drawer */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        />
      )}

      {/* Sidebar Navigation Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-950 border-r-4 border-black p-5 flex flex-col justify-between transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          {/* Brand Logo Header */}
          <Link
            href="/"
            className="flex items-center gap-2.5 bg-amber-400 text-black px-3.5 py-2 font-black border-3 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rounded-xl"
          >
            <Image 
              src="/mentatry_logo.png" 
              alt="Mentatry Logo" 
              width={36} 
              height={36}
              className="w-6 h-6 object-contain shrink-0"
              priority
            />
            <span className="font-bebas tracking-widest text-2xl">MENTATRY</span>
          </Link>

          {/* Navigation Links List */}
          <nav className="space-y-2 pt-2">
            <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider px-2 pb-1">
              Navigation
            </div>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-extrabold text-sm uppercase transition-all border-2 ${
                    isActive
                      ? "bg-amber-400 text-black border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] translate-x-1"
                      : `bg-slate-900 text-slate-300 border-slate-800 ${link.color}`
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[2.5]" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Sign Out Footer */}
        <div className="border-t-2 border-slate-800 pt-4 space-y-3">
          {user ? (
            <form action={logoutAction}>
              <button
                type="submit"
                className="neo-btn neo-btn-pink w-full text-xs py-2 px-3 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4 stroke-[2.5]" />
                <span>Sign Out</span>
              </button>
            </form>
          ) : (
            <div className="space-y-2">
              <Link href="/login" className="neo-btn neo-btn-white w-full text-xs py-2">
                Log In
              </Link>
              <Link href="/signup" className="neo-btn neo-btn-pink w-full text-xs py-2">
                Create Free Account
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
