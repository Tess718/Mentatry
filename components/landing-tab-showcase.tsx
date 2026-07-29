"use client";

import { useState } from "react";
import { Sparkles, KeyRound, BarChart3, CheckCircle2, ArrowUpRight, Zap, Users, ShieldCheck } from "lucide-react";

export function LandingTabShowcase() {
  const [activeTab, setActiveTab] = useState<"ai" | "join" | "insights">("join");

  return (
    <div className="space-y-6">
      {/* Tab Navigation Buttons */}
      <div className="flex items-center justify-center gap-1.5 md:gap-3 border-b-4 border-black pb-2">
        <button
          onClick={() => setActiveTab("ai")}
          className={`px-3 md:px-5 py-2 md:py-3 font-extrabold text-[11px] md:text-base uppercase tracking-wider transition-all rounded-t-xl border-3 border-b-0 border-black ${
            activeTab === "ai"
              ? "bg-amber-300 text-black shadow-[3px_-3px_0px_0px_rgba(0,0,0,1)] -translate-y-1"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" /> AI Generator
          </span>
        </button>

        <button
          onClick={() => setActiveTab("join")}
          className={`px-3 md:px-5 py-2 md:py-3 font-extrabold text-[11px] md:text-base uppercase tracking-wider transition-all rounded-t-xl border-3 border-b-0 border-black ${
            activeTab === "join"
              ? "bg-indigo-400 text-black shadow-[3px_-3px_0px_0px_rgba(0,0,0,1)] -translate-y-1"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 md:w-4 md:h-4" /> Join Codes
          </span>
        </button>

        <button
          onClick={() => setActiveTab("insights")}
          className={`px-3 md:px-5 py-2 md:py-3 font-extrabold text-[11px] md:text-base uppercase tracking-wider transition-all rounded-t-xl border-3 border-b-0 border-black ${
            activeTab === "insights"
              ? "bg-pink-400 text-black shadow-[3px_-3px_0px_0px_rgba(0,0,0,1)] -translate-y-1"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 md:w-4 md:h-4" /> Analytics
          </span>
        </button>
      </div>

      {/* Main Tab Content Card */}
      <div className="relative border-4 border-black bg-amber-300 rounded-3xl p-6 sm:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        {/* Floating "TOTALLY FREE!" Tag Badge */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 rotate-6 z-10">
          <div className="bg-pink-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider px-3 py-1.5 border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1">
            <Zap className="w-4 h-4 fill-yellow-300 text-yellow-300" /> TOTALLY FREE!
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Description Column */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-3xl sm:text-4xl font-black uppercase text-black leading-tight">
              {activeTab === "ai" && "Create Quizzes From Any Topic."}
              {activeTab === "join" && "Instant Room Code Access."}
              {activeTab === "insights" && "Real-Time Score Analytics."}
            </h3>

            <p className="text-slate-900 font-bold text-sm sm:text-base leading-relaxed">
              {activeTab === "ai" &&
                "Type a single topic like 'Photosynthesis' or paste your lecture notes. Our AI engine builds formatted multiple-choice questions with answer explanations instantly."}
              {activeTab === "join" &&
                "No complicated links or student account setup required. Share a simple 6-character join code and let your students take quizzes anywhere, anytime."}
              {activeTab === "insights" &&
                "Monitor individual student accuracy, average completion time, and question-by-question breakdown with automatic instant grading."}
            </p>

            <ul className="space-y-2 pt-2 text-slate-900 font-black text-xs sm:text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-black fill-lime-400" />
                {activeTab === "ai" && "Instant 4-option multiple choice generation"}
                {activeTab === "join" && "Short 6-character unique room codes"}
                {activeTab === "insights" && "Automated instant grading & explanations"}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-black fill-lime-400" />
                {activeTab === "ai" && "Customize or build questions manually anytime"}
                {activeTab === "join" && "Supports mobile, tablet, and desktop"}
                {activeTab === "insights" && "Track class accuracy & top-performing students"}
              </li>
            </ul>
          </div>

          {/* Right Live Preview Box */}
          <div className="lg:col-span-7">
            <div className="bg-white border-3 border-black rounded-2xl p-4 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
              {/* Mock Window Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400 border border-black" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400 border border-black" />
                  <div className="w-3 h-3 rounded-full bg-green-400 border border-black" />
                  <span className="ml-2 font-mono font-bold text-xs text-slate-600">
                    Mentatry Live Preview
                  </span>
                </div>
                <div className="bg-slate-100 border border-slate-300 text-slate-700 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                  {activeTab === "ai" ? "AI GENERATED" : activeTab === "join" ? "CODE: 884-912" : "ANALYTICS"}
                </div>
              </div>

              {/* Dynamic Mock UI Content based on activeTab */}
              {activeTab === "ai" && (
                <div className="space-y-3">
                  <div className="bg-yellow-100 border-2 border-black p-3 rounded-xl">
                    <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-200 px-2 py-0.5 rounded border border-amber-800 inline-block mb-1">
                      Generated Question #1
                    </span>
                    <p className="font-extrabold text-sm text-black">
                      Which organelle is known as the powerhouse of the cell?
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 border-2 border-black rounded-lg bg-emerald-100 font-bold text-xs flex items-center justify-between">
                      <span>A) Mitochondria</span>
                      <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded font-black">Correct</span>
                    </div>
                    <div className="p-2.5 border-2 border-slate-300 rounded-lg bg-slate-50 font-bold text-xs text-slate-500">
                      B) Ribosome
                    </div>
                    <div className="p-2.5 border-2 border-slate-300 rounded-lg bg-slate-50 font-bold text-xs text-slate-500">
                      C) Nucleus
                    </div>
                    <div className="p-2.5 border-2 border-slate-300 rounded-lg bg-slate-50 font-bold text-xs text-slate-500">
                      D) Golgi Apparatus
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "join" && (
                <div className="space-y-4 py-2 text-center">
                  <div className="inline-block bg-indigo-100 border-3 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-900 block mb-1">
                      Enter Join Code
                    </span>
                    <div className="font-mono text-3xl font-black text-indigo-600 tracking-widest bg-white border-2 border-black px-4 py-2 rounded-xl">
                      M E N T 8 9
                    </div>
                  </div>
                  <div className="flex justify-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-yellow-300 border-2 border-black flex items-center justify-center font-bold text-xs">
                      👩‍🎓
                    </div>
                    <div className="w-8 h-8 rounded-full bg-cyan-300 border-2 border-black flex items-center justify-center font-bold text-xs">
                      👨‍💻
                    </div>
                    <div className="w-8 h-8 rounded-full bg-pink-300 border-2 border-black flex items-center justify-center font-bold text-xs">
                      🧑‍🏫
                    </div>
                    <div className="w-8 h-8 rounded-full bg-lime-300 border-2 border-black flex items-center justify-center font-bold text-xs text-slate-800 font-mono">
                      +42
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "insights" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-cyan-100 border-2 border-black p-2.5 rounded-xl text-center">
                      <span className="text-[10px] font-black text-cyan-900 uppercase">Avg Score</span>
                      <div className="text-xl font-black text-black">88%</div>
                    </div>
                    <div className="bg-lime-100 border-2 border-black p-2.5 rounded-xl text-center">
                      <span className="text-[10px] font-black text-lime-900 uppercase">Attempts</span>
                      <div className="text-xl font-black text-black">124</div>
                    </div>
                    <div className="bg-pink-100 border-2 border-black p-2.5 rounded-xl text-center">
                      <span className="text-[10px] font-black text-pink-900 uppercase">Pass Rate</span>
                      <div className="text-xl font-black text-black">94%</div>
                    </div>
                  </div>
                  <div className="border-2 border-black bg-slate-900 text-white p-3 rounded-xl font-mono text-xs flex items-center justify-between">
                    <span className="text-lime-400">#1 Top Student</span>
                    <span className="font-bold text-yellow-300">Teslim L. (10/10)</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
