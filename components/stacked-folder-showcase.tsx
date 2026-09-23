import {
  KeyRound,
  BarChart3,
  Trophy,
  CheckCircle2,
  Sparkles,
  Users,
  Flame,
} from "lucide-react";

interface FeatureCardData {
  id: string;
  tabLabel: string;
  tabShortLabel: string;
  category: string;
  title: string;
  description: string;
  tags: string[];
  bgColor: string;
  textColor: string;
  chipBorder: string;
  chipBg: string;
  frameBorderColor: string;
}

const FEATURES: FeatureCardData[] = [
  {
    id: "feature-01",
    tabLabel: "✦ 01 AI QUIZZES",
    tabShortLabel: "✦ 01",
    category: "AI QUIZ ENGINE",
    title: "AI Quiz Generator",
    description:
      "Generate high-precision multiple-choice questions from any custom topic or pasted lecture notes with verified answer choices and detailed rationale in seconds.",
    tags: ["TOPIC OR NOTES", "STEP EXPLANATIONS", "CUSTOM DIFFICULTY"],
    bgColor: "#38bdf8",
    textColor: "#000000",
    chipBorder: "border-black/30",
    chipBg: "bg-black/10 text-black",
    frameBorderColor: "#000000",
  },
  {
    id: "feature-02",
    tabLabel: "✦ 02 LIVE ROOMS",
    tabShortLabel: "✦ 02",
    category: "MULTIPLAYER ROOMS",
    title: "Join Code Rooms",
    description:
      "Share interactive competition lobbies instantly using 6-character room codes. Zero friction or login barriers for takers — jump straight into live knowledge arenas.",
    tags: ["6-CHAR ROOM CODES", "NO LOGIN NEEDED", "LIVE MULTIPLAYER"],
    bgColor: "#0d0f17",
    textColor: "#ffffff",
    chipBorder: "border-white/30",
    chipBg: "bg-white/10 text-white",
    frameBorderColor: "#ffffff",
  },
  {
    id: "feature-03",
    tabLabel: "✦ 03 INSIGHTS",
    tabShortLabel: "✦ 03",
    category: "PERFORMANCE ANALYTICS",
    title: "Real-Time Insights",
    description:
      "Automated scoring, participant accuracy rankings, and question-by-question miss rate breakdowns to pinpoint study gaps and misunderstandings without manual grading.",
    tags: ["AUTO-GRADING", "MISS-RATE ANALYSIS", "STUDENT ACCURACY"],
    bgColor: "#facc15",
    textColor: "#000000",
    chipBorder: "border-black/30",
    chipBg: "bg-black/10 text-black",
    frameBorderColor: "#000000",
  },
  {
    id: "feature-04",
    tabLabel: "✦ 04 REWARDS",
    tabShortLabel: "✦ 04",
    category: "STREAKS & ACHIEVEMENTS",
    title: "Gamification & Rewards",
    description:
      "Keep learners motivated with cognitive daily streak counters, collectible achievement badges, and global daily leaderboards designed to build lasting study habits.",
    tags: ["DAILY STREAKS", "UNLOCKABLE BADGES", "DAILY LEADERBOARD"],
    bgColor: "#ec4899",
    textColor: "#ffffff",
    chipBorder: "border-white/30",
    chipBg: "bg-white/10 text-white",
    frameBorderColor: "#000000",
  },
];

export function StackedFolderShowcase() {
  return (
    <div className="relative w-full" style={{ overflow: "visible" }}>
      {FEATURES.map((feature, index) => {
        return (
          <div
            key={feature.id}
            className="w-full folder-card-fixed"
            style={{
              position: "sticky",
              top: "120px",
              zIndex: 10 * (index + 1),
            }}
          >
            {/* The Solid Hard-Edged Card with 45° Tab Clip-Path */}
            <div
              className={`w-full relative folder-card-${index} folder-card-fixed rounded-none shadow-none border-0 transition-none`}
              style={{
                backgroundColor: feature.bgColor,
                color: feature.textColor,
              }}
            >
              {/* Tab Header Label (Positioned directly inside tab trapezoid) */}
              <div
                className={`absolute top-0 folder-tab-pos-${index} flex items-center justify-center font-mono font-bold uppercase tracking-widest text-[12px] sm:text-[13px] lg:text-[15px] select-none pointer-events-none`}
                style={{
                  color: feature.textColor,
                }}
              >
                <span className="hidden sm:inline">{feature.tabLabel}</span>
                <span className="sm:hidden">{feature.tabShortLabel}</span>
              </div>

              {/* Card Body Content */}
              <div className="pt-[54px] sm:pt-[66px] lg:pt-[78px] pb-8 sm:pb-10 px-6 sm:px-10 lg:px-14 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
                {/* Left Column: Metadata, Title, Description, Tags, Action */}
                <div className="lg:col-span-7 flex flex-col justify-center space-y-4 sm:space-y-5">
                  {/* Category Pill Tag with a Dot */}
                  <div className="flex items-center gap-2 font-mono text-xs sm:text-sm uppercase tracking-widest font-bold opacity-85">
                    <span className="w-2 h-2 rounded-full bg-current inline-block" />
                    <span>{feature.category}</span>
                  </div>

                  {/* Big Bold Title */}
                  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-none">
                    {feature.title}
                  </h3>

                  {/* Short Description */}
                  <p className="text-sm sm:text-base lg:text-lg font-medium leading-relaxed max-w-xl opacity-90">
                    {feature.description}
                  </p>

                  {/* Small Tag Chips on the Left */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {feature.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-1 border ${feature.chipBorder} ${feature.chipBg}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Column: Framed Feature Visual */}
                <div className="lg:col-span-5 flex justify-center items-center">
                  <div
                    className="relative w-full max-w-[380px] lg:max-w-[420px] aspect-[4/3] bg-white border-[5px] sm:border-[6px] shadow-none overflow-hidden select-none flex flex-col"
                    style={{ borderColor: feature.frameBorderColor }}
                  >
                    {/* Rich Framed UI Mockup Interior */}
                    {index === 0 && (
                      <div className="p-4 sm:p-5 flex flex-col justify-between h-full bg-[#f8fafc] text-black">
                        <div className="flex items-center justify-between border-b-2 border-black pb-2">
                          <span className="flex items-center gap-1.5 font-mono text-xs font-black uppercase text-black">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-600 fill-cyan-600" />
                            AI QUIZ ENGINE
                          </span>
                          <span className="font-mono text-[10px] bg-cyan-100 text-cyan-900 px-2 py-0.5 font-bold uppercase border border-cyan-400">
                            PROMPT READY
                          </span>
                        </div>

                        <div className="space-y-2 py-2">
                          <div className="bg-white border-2 border-black p-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <span className="font-mono text-[10px] font-bold text-slate-500 uppercase block">
                              Target Topic:
                            </span>
                            <span className="font-extrabold text-xs sm:text-sm text-black">
                              Quantum Mechanics & Entanglement
                            </span>
                          </div>

                          <div className="bg-cyan-50 border-2 border-black p-2.5 space-y-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] font-black uppercase text-cyan-950">
                                Q1. ENTANGLEMENT STATE
                              </span>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                            <div className="text-[11px] font-bold text-slate-800">
                              B) Instant non-local correlation
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-300 text-[10px] font-mono font-bold text-slate-600">
                          <span>10 MCQs Generated</span>
                          <span className="text-emerald-700 font-black">
                            EXPLANATIONS READY
                          </span>
                        </div>
                      </div>
                    )}

                    {index === 1 && (
                      <div className="p-4 sm:p-5 flex flex-col justify-between h-full bg-[#0a0d14] text-white">
                        <div className="flex items-center justify-between border-b-2 border-slate-700 pb-2">
                          <span className="flex items-center gap-1.5 font-mono text-xs font-black uppercase text-amber-400">
                            <KeyRound className="w-3.5 h-3.5" />
                            LIVE ROOM LOBBY
                          </span>
                          <span className="flex items-center gap-1 font-mono text-[10px] bg-red-950 text-red-400 px-2 py-0.5 font-bold uppercase border border-red-700 animate-pulse">
                            ● SYNCED
                          </span>
                        </div>

                        <div className="text-center py-2 space-y-1">
                          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                            ROOM PASSCODE
                          </span>
                          <div className="bg-amber-400 text-black font-mono font-black text-xl sm:text-2xl py-1.5 tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)]">
                            K7M2P9
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-mono border-t border-slate-800 pt-2 text-slate-300">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-cyan-400" /> 16
                            Players
                          </span>
                          <span className="bg-cyan-950 text-cyan-300 font-bold px-2 py-0.5 text-[10px] uppercase border border-cyan-700">
                            NO LOGIN REQUIRED
                          </span>
                        </div>
                      </div>
                    )}

                    {index === 2 && (
                      <div className="p-4 sm:p-5 flex flex-col justify-between h-full bg-[#faf5ea] text-black">
                        <div className="flex items-center justify-between border-b-2 border-black pb-2">
                          <span className="flex items-center gap-1.5 font-mono text-xs font-black uppercase text-black">
                            <BarChart3 className="w-3.5 h-3.5 text-black" />
                            DIAGNOSTICS
                          </span>
                          <span className="font-mono text-[10px] bg-emerald-300 text-black px-2 py-0.5 font-black uppercase border border-black">
                            91.2% ACCURACY
                          </span>
                        </div>

                        <div className="space-y-2 py-2">
                          <div className="space-y-1">
                            <div className="flex justify-between font-mono text-[10px] font-bold">
                              <span>Q1 (Core Axioms)</span>
                              <span>98% Pass</span>
                            </div>
                            <div className="w-full bg-white h-2.5 border border-black">
                              <div className="bg-emerald-500 h-full w-[98%]" />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between font-mono text-[10px] font-bold">
                              <span>Q2 (Formulas)</span>
                              <span>86% Pass</span>
                            </div>
                            <div className="w-full bg-white h-2.5 border border-black">
                              <div className="bg-amber-400 h-full w-[86%]" />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between font-mono text-[10px] font-bold">
                              <span>Q3 (Edge Cases)</span>
                              <span className="text-red-700 font-black">
                                42% (Review)
                              </span>
                            </div>
                            <div className="w-full bg-white h-2.5 border border-black">
                              <div className="bg-red-500 h-full w-[42%]" />
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-black pt-1 flex items-center justify-between text-[10px] font-mono font-bold text-black">
                          <span>Instant grading</span>
                          <span>Per-Question Stats ↗</span>
                        </div>
                      </div>
                    )}

                    {index === 3 && (
                      <div className="p-4 sm:p-5 flex flex-col justify-between h-full bg-[#fdf2f8] text-black">
                        <div className="flex items-center justify-between border-b-2 border-black pb-2">
                          <span className="flex items-center gap-1.5 font-mono text-xs font-black uppercase text-black">
                            <Trophy className="w-3.5 h-3.5 text-pink-600 fill-pink-600" />
                            REWARDS ENGINE
                          </span>
                          <span className="font-mono text-[10px] bg-pink-300 text-black px-2 py-0.5 font-black uppercase border border-black">
                            BADGE UNLOCKED
                          </span>
                        </div>

                        <div className="bg-white border-2 border-black p-3 text-center space-y-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                          <div className="flex items-center justify-center gap-1.5 text-amber-500 font-black text-sm uppercase">
                            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                            <span>18 DAY STREAK</span>
                          </div>
                          <p className="font-mono text-[11px] font-bold text-slate-700">
                            UNLOCKED: "SPEED DEMON"
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-black text-[10px] font-mono font-bold text-black">
                          <span>Daily Streak Kept 🔥</span>
                          <span className="font-black">RANK #1 🏆</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {/* Brief beat so the completed 4-card stack stays pinned for a moment before scrolling away */}
      <div
        style={{ height: "14vh", pointerEvents: "none" }}
        aria-hidden="true"
      />
    </div>
  );
}
