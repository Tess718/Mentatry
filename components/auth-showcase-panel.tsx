"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

interface AuthShowcasePanelProps {
  mode?: "login" | "signup";
}

export function AuthShowcasePanel({ mode = "signup" }: AuthShowcasePanelProps) {
  const isLogin = mode === "login";

  return (
    <div className="w-full h-full min-h-[540px] lg:min-h-[620px] bg-[#38bdf8] border-3 border-black rounded-2xl sm:rounded-[28px] shadow-[5px_5px_0px_0px_#000] p-6 sm:p-8 lg:p-9 flex flex-col justify-between overflow-hidden relative select-none">
      {/* Subtle Grid Accent Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage: "radial-gradient(#000000 1.5px, transparent 1.5px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Top Header & Value Proposition */}
      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-start">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 bg-amber-300 border-3 border-black shadow-[3px_3px_0px_0px_#000] rounded-xl px-3.5 py-2 hover:-translate-y-0.5 transition-transform"
          >
            <Image
              src="/mentatry_logo.png"
              alt="Mentatry Logo"
              width={28}
              height={28}
              className="w-7 h-7 object-contain"
            />
            <span className="font-black text-black text-sm tracking-wider uppercase">
              Mentatry
            </span>
          </Link>
        </div>

        <div className="space-y-3 pt-1">
          <h2 className="text-3xl sm:text-4xl lg:text-4xl xl:text-5xl font-black uppercase tracking-tight text-black leading-none">
            {isLogin ? (
              <>
                READY TO BOOST <br />
                <span className="bg-amber-300 px-2 py-0.5 border-2 border-black shadow-[3px_3px_0px_0px_#000] inline-block mt-1">
                  YOUR STREAK?
                </span>
              </>
            ) : (
              <>
                TURN ANY TOPIC <br />
                INTO AN{" "}
                <span className="bg-lime-300 px-2 py-0.5 border-2 border-black shadow-[3px_3px_0px_0px_#000] inline-block mt-1">
                  INTERACTIVE
                </span>{" "}
                QUIZ.
              </>
            )}
          </h2>

          <p className="text-slate-800 font-bold text-sm sm:text-base leading-snug max-w-md">
            {isLogin
              ? "Sign in to monitor live rooms, review analytics, and climb the daily leaderboard."
              : "Generate verified quizzes from lecture notes or topics in seconds, and host real-time multiplayer rooms."}
          </p>
        </div>
      </div>

      {/* Bottom Visual Stacked Lozenges & Stickers (Matching Reference Image) */}
      <div className="relative z-10 pt-10 pb-2">
        <div className="relative flex flex-col items-center justify-end w-full">
          {/* Top Layer: Smiley Badge + Tilted Lozenge */}
          <div className="w-full flex items-end justify-between px-2 sm:px-6 mb-[-12px] z-30">
            {/* Brand Yellow Smiley Sticker */}
            <motion.div
              initial={{ opacity: 0, y: -220, rotate: -35 }}
              animate={{ opacity: 1, y: 0, rotate: -6 }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 15,
                delay: 0.1,
              }}
              whileHover={{ rotate: 0, scale: 1.08, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#facc15] border-3 border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-center cursor-pointer select-none"
              title="Keep Learning :)"
            >
              <svg
                viewBox="0 0 40 40"
                className="w-8 h-8 sm:w-9 sm:h-9 stroke-black fill-none stroke-[3.5] stroke-linecap-round stroke-linejoin-round"
              >
                <circle cx="14" cy="15" r="2.5" fill="black" stroke="none" />
                <circle cx="26" cy="15" r="2.5" fill="black" stroke="none" />
                <path d="M 12 23 Q 20 31 28 23" />
              </svg>
            </motion.div>

            {/* Brand Pink Tilted Pill */}
            <motion.div
              initial={{ opacity: 0, y: -240, rotate: -25 }}
              animate={{ opacity: 1, y: 0, rotate: 10 }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 15,
                delay: 0.22,
              }}
              whileHover={{ rotate: 0, scale: 1.05, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#f472b6] text-black border-3 border-black shadow-[4px_4px_0px_0px_#000] rounded-full px-5 sm:px-7 py-2.5 sm:py-3 font-black text-xs sm:text-sm tracking-wider uppercase cursor-pointer select-none"
            >
              AI-POWERED
            </motion.div>
          </div>

          {/* Middle Layer: Brand Lime Horizontal Lozenge */}
          <div className="w-full z-20 my-1 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: -260, rotate: 4 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 210,
                damping: 16,
                delay: 0.35,
              }}
              whileHover={{ y: -3, scale: 1.02, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.98 }}
              className="w-full max-w-md bg-[#a3e635] text-black border-3 border-black shadow-[5px_5px_0px_0px_#000] rounded-full py-3 sm:py-3.5 px-6 text-center font-black text-sm sm:text-base tracking-wider uppercase cursor-pointer select-none"
            >
              INTERACTIVE QUIZZES
            </motion.div>
          </div>

          {/* Bottom Layer: Brand Pink Angled Connector + Brand Yellow Horizontal Lozenge */}
          <div className="w-full flex items-center justify-between gap-3 z-10 mt-1">
            {/* Brand Pink Angled & Pill */}
            <motion.div
              initial={{ opacity: 0, y: -270, rotate: 25 }}
              animate={{ opacity: 1, y: 0, rotate: -12 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.48,
              }}
              whileHover={{ rotate: 0, scale: 1.08, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.95 }}
              className="w-14 sm:w-16 h-20 sm:h-22 bg-[#f472b6] text-black border-3 border-black shadow-[4px_4px_0px_0px_#000] rounded-3xl flex items-center justify-center font-black text-2xl sm:text-3xl rotate-[-12deg] hover:rotate-0 transition-transform cursor-pointer select-none shrink-0"
            >
              &
            </motion.div>

            {/* Brand Yellow Bottom Lozenge */}
            <motion.div
              initial={{ opacity: 0, y: -280, rotate: -6 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 16,
                delay: 0.60,
              }}
              whileHover={{ y: -3, scale: 1.02, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-[#facc15] text-black border-3 border-black shadow-[5px_5px_0px_0px_#000] rounded-full py-3.5 sm:py-4 px-6 text-center font-black text-sm sm:text-base tracking-wider uppercase cursor-pointer select-none"
            >
              LIVE CLASSROOMS
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
