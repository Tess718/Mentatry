"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Sparkles,
  Zap,
  KeyRound,
  BarChart3,
  CheckCircle2,
  Users,
  Trophy,
} from "lucide-react";

interface StepCard {
  stepNumber: string;
  headline: string;
  body: string;
  bgColor: string;
  visualization: React.ReactNode;
}

const RESTING_ROTATIONS = [-8, -2.6, 2.6, 8];
const INITIAL_STACK_OFFSETS = [170, 60, -60, -170];

export function FannedStepsShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-60px" });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [activeMobileIndex, setActiveMobileIndex] = useState(0);
  const [screenWidth, setScreenWidth] = useState<number>(1200);

  useEffect(() => {
    const updateWidth = () => setScreenWidth(window.innerWidth);
    updateWidth();
    window.addEventListener("resize", updateWidth, { passive: true });
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Mentatry Core Brand Palette: Cyan (#38bdf8), Lime (#a3e635), Yellow (#facc15), Pink (#f472b6)
  const steps: StepCard[] = [
    {
      stepNumber: "STEP 01",
      headline: "Type Any Topic Or Notes",
      body: "Type a subject, upload class materials, or paste raw study notes directly to kick off instant synthesis.",
      bgColor: "#38bdf8", // Mentatry Brand Cyan
      visualization: (
        <div className="w-full bg-white border-2 border-black rounded-xl p-3 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between h-[152px] select-none">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <span className="flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] font-black uppercase text-sky-900">
              <Sparkles className="w-3.5 h-3.5 text-sky-600 fill-sky-500 shrink-0" />
              AI QUIZ ENGINE
            </span>
            <span className="font-mono text-[9px] bg-sky-100 text-sky-900 px-1.5 py-0.5 font-bold uppercase rounded border border-sky-300">
              READY
            </span>
          </div>

          {/* Simulated Input Field */}
          <div className="bg-slate-50 border border-black/30 rounded-lg p-2 space-y-0.5">
            <div className="flex items-center justify-between text-[9px] font-mono font-bold text-slate-500 uppercase">
              <span>TARGET SUBJECT</span>
              <span className="text-sky-700 font-black">AI DETECTED</span>
            </div>
            <div className="font-black text-xs text-black truncate flex items-center gap-1">
              <span>Cellular Respiration & ATP</span>
              <span className="w-1 h-3.5 bg-sky-500 animate-pulse inline-block" />
            </div>
          </div>

          {/* Tags footer */}
          <div className="flex items-center justify-between text-[9px] font-mono font-bold text-slate-600 pt-1 border-t border-slate-100">
            <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
              10 MCQs
            </span>
            <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
              Medium
            </span>
            <span className="text-sky-800 font-black flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5 fill-sky-600 text-sky-600 shrink-0" />
              AUTO-SOLVE
            </span>
          </div>
        </div>
      ),
    },
    {
      stepNumber: "STEP 02",
      headline: "Instant AI Quiz Crafting",
      body: "AI synthesizes balanced multiple-choice questions, tricky distractors, and verified rationale in seconds.",
      bgColor: "#a3e635", // Mentatry Brand Lime
      visualization: (
        <div className="w-full bg-white border-2 border-black rounded-xl p-3 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between h-[152px] select-none">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <span className="flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] font-black uppercase text-lime-950">
              <Zap className="w-3.5 h-3.5 text-lime-700 fill-lime-500 shrink-0" />
              QUESTION 01 OF 10
            </span>
            <span className="font-mono text-[9px] bg-emerald-100 text-emerald-900 px-1.5 py-0.5 font-black uppercase rounded border border-emerald-300">
              VERIFIED
            </span>
          </div>

          {/* Question Text */}
          <div className="text-[11px] font-black text-black leading-snug line-clamp-2">
            Where does the Krebs cycle take place in eukaryotes?
          </div>

          {/* MCQ Options */}
          <div className="space-y-1">
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-500 px-2 py-1 rounded text-[10px] font-bold text-emerald-950">
              <span className="truncate">A) Mitochondrial matrix</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 ml-1" />
            </div>
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 px-2 py-1 rounded text-[10px] font-medium text-slate-600">
              <span className="truncate">B) Outer membrane</span>
              <span className="w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0 ml-1" />
            </div>
          </div>
        </div>
      ),
    },
    {
      stepNumber: "STEP 03",
      headline: "Share Live Room Code",
      body: "Broadcast your 6-character room code for frictionless one-click entry on phones, tablets, or laptops.",
      bgColor: "#facc15", // Mentatry Brand Yellow
      visualization: (
        <div className="w-full bg-white border-2 border-black rounded-xl p-3 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between h-[152px] select-none">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <span className="flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] font-black uppercase text-amber-950">
              <KeyRound className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              LIVE ROOM LOBBY
            </span>
            <span className="flex items-center gap-1 font-mono text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.5 font-black uppercase rounded border border-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />{" "}
              SYNCED
            </span>
          </div>

          {/* Room Join Code Display */}
          <div className="text-center py-1 bg-amber-50 border border-amber-300 rounded-lg">
            <span className="font-mono text-[9px] uppercase tracking-widest text-amber-800 font-bold block">
              ROOM PASSCODE
            </span>
            <div className="bg-amber-400 text-black font-mono font-black text-lg py-0.5 tracking-widest border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mx-2">
              #MNT-742
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-[10px] font-mono border-t border-slate-100 pt-1 text-slate-700">
            <span className="flex items-center gap-1 font-bold">
              <Users className="w-3 h-3 text-amber-700 shrink-0" /> 18 Players
            </span>
            <span className="font-black text-amber-950 text-[9px] uppercase">
              NO LOGIN NEEDED
            </span>
          </div>
        </div>
      ),
    },
    {
      stepNumber: "STEP 04",
      headline: "Real-Time Score Insights",
      body: "Track live accuracy heatmaps, item miss rate diagnostics, and student mastery without manual grading.",
      bgColor: "#f472b6", // Mentatry Brand Pink
      visualization: (
        <div className="w-full bg-white border-2 border-black rounded-xl p-3 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between h-[152px] select-none">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <span className="flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] font-black uppercase text-pink-950">
              <BarChart3 className="w-3.5 h-3.5 text-pink-700 shrink-0" />
              LIVE DIAGNOSTICS
            </span>
            <span className="font-mono text-[9px] bg-pink-100 text-pink-950 px-1.5 py-0.5 font-black uppercase rounded border border-pink-300">
              91.2% MASTERY
            </span>
          </div>

          {/* Progress Bars */}
          <div className="space-y-1.5 py-0.5">
            <div className="space-y-0.5">
              <div className="flex justify-between font-mono text-[9px] font-bold">
                <span>Q1 (Glycolysis)</span>
                <span className="text-emerald-700 font-black">98% Pass</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded border border-black overflow-hidden">
                <div className="bg-emerald-500 h-full w-[98%]" />
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="flex justify-between font-mono text-[9px] font-bold">
                <span>Q2 (Krebs Cycle)</span>
                <span className="text-amber-700 font-black">86% Pass</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded border border-black overflow-hidden">
                <div className="bg-amber-400 h-full w-[86%]" />
              </div>
            </div>
          </div>

          {/* Top Rank Winner */}
          <div className="flex items-center justify-between text-[10px] font-mono border-t border-slate-100 pt-1 text-slate-800">
            <span className="flex items-center gap-1 font-bold text-pink-950">
              <Trophy className="w-3 h-3 text-amber-500 shrink-0" /> #1 Maya
              (2,450 XP)
            </span>
            <span className="text-emerald-700 font-black text-[9px]">
              AUTO-GRADED
            </span>
          </div>
        </div>
      ),
    },
  ];

  // Desktop hover physics: clean 112px separation on hovered card
  const getDesktopCardStyle = (index: number) => {
    const restingRotate = RESTING_ROTATIONS[index];

    // Resting state: not hovered
    if (hoveredIndex === null) {
      return {
        x: 0,
        y: 0,
        rotate: restingRotate,
        scale: 1,
        zIndex: (index + 1) * 10,
      };
    }

    // Currently hovered card: straightens out (0°), lifts slightly, highest z-index
    if (hoveredIndex === index) {
      return {
        x: 0,
        y: -10,
        rotate: 0,
        scale: 1.02,
        zIndex: 50,
      };
    }

    // Clearance shift scaled to viewport width:
    // iPad (md: 768px-1023px) uses 74px, large laptops (1024px-1279px) use 100px, xl desktop uses 112px.
    const isLeft = index < hoveredIndex;
    const shift = screenWidth < 1024 ? 74 : screenWidth < 1280 ? 100 : 112;

    return {
      x: isLeft ? -shift : shift,
      y: 0,
      rotate: restingRotate,
      scale: 1,
      zIndex: (index + 1) * 10,
    };
  };

  // Mobile stacked deck physics: front card full, background cards peeking on right edge
  const getMobileCardStyle = (index: number) => {
    const offset = (index - activeMobileIndex + 4) % 4;

    if (offset === 0) {
      // Front active card
      return {
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1,
        zIndex: 40,
        opacity: 1,
      };
    }

    // Cards stacked behind peeking out to the right (like file tabs in the reference image)
    const xOffset = offset * 18; // 18px, 36px, 54px peeking right
    const rotation = offset * 1.5; // subtle fanned flare at the top-right
    const zIndex = 40 - offset * 10; // 30, 20, 10

    return {
      x: xOffset,
      y: 0,
      rotate: rotation,
      scale: 1 - offset * 0.015,
      zIndex,
      opacity: 1,
    };
  };

  return (
    <div ref={containerRef} className="w-full">
      {/* ========================================================
          MOBILE VIEW (< 768px): Stacked Deck with Peeking Right Edges
          ======================================================== */}
      <div className="flex md:hidden flex-col items-center justify-center w-full px-4 overflow-visible select-none">
        {/* Relative Stack Container - offset slightly left to balance the right peeking cards */}
        <div className="relative w-[265px] sm:w-[285px] h-[390px] sm:h-[410px] -translate-x-4 my-2">
          {steps.map((step, index) => {
            const style = getMobileCardStyle(index);
            const offset = (index - activeMobileIndex + 4) % 4;
            const isFront = offset === 0;

            return (
              <motion.div
                key={index}
                animate={{
                  x: style.x,
                  y: style.y,
                  rotate: style.rotate,
                  scale: style.scale,
                  zIndex: style.zIndex,
                  opacity: style.opacity,
                }}
                transition={{
                  duration: 0.32,
                  ease: [0.25, 1, 0.5, 1],
                }}
                drag={isFront ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                onDragEnd={(_, info) => {
                  const swipeThreshold = 40;
                  const velocityThreshold = 180;
                  if (
                    info.offset.x < -swipeThreshold ||
                    info.velocity.x < -velocityThreshold
                  ) {
                    // Swiped left -> show next card
                    setActiveMobileIndex((prev) => (prev + 1) % 4);
                  } else if (
                    info.offset.x > swipeThreshold ||
                    info.velocity.x > velocityThreshold
                  ) {
                    // Swiped right -> show previous card
                    setActiveMobileIndex((prev) => (prev - 1 + 4) % 4);
                  }
                }}
                onClick={() => {
                  if (!isFront) {
                    setActiveMobileIndex(index);
                  }
                }}
                style={{
                  backgroundColor: step.bgColor,
                  zIndex: style.zIndex,
                  touchAction: "pan-y",
                }}
                className={`absolute inset-0 cursor-grab active:cursor-grabbing w-[265px] sm:w-[285px] h-[390px] sm:h-[410px] rounded-[22px] border-3 border-black p-4 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] touch-pan-y ${
                  !isFront ? "pointer-events-auto" : ""
                }`}
              >
                {/* 1. Header: Step Tag */}
                <div className="flex items-center w-full">
                  <div className="inline-flex items-center bg-black text-white px-2.5 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                    <span className="font-mono text-[11px] font-black uppercase tracking-wider">
                      {step.stepNumber}
                    </span>
                  </div>
                </div>

                {/* 2. Platform UI Visualization */}
                <div className="w-full flex-1 flex items-center justify-center my-2 pointer-events-none">
                  {step.visualization}
                </div>

                {/* 3. Headline & Description */}
                <div className="space-y-1 text-left pt-1 pointer-events-none">
                  <h3 className="font-black text-base uppercase tracking-tight text-black leading-tight line-clamp-2">
                    {step.headline}
                  </h3>
                  <p className="text-[11px] font-bold text-black/85 leading-relaxed line-clamp-3">
                    {step.body}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          DESKTOP VIEW (>= 768px): Full Horizontal Fanned Deck with Hover Spread
          ======================================================== */}
      <div className="hidden md:flex w-full justify-center items-center overflow-x-auto lg:overflow-visible select-none py-4 px-2 sm:px-4">
        <div className="flex items-center justify-center w-full max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const cardStyle = getDesktopCardStyle(index);
            const isHovered = hoveredIndex === index;

            return (
              <motion.div
                key={index}
                initial={{
                  opacity: 0,
                  y: 45,
                  rotate: 0,
                  x: INITIAL_STACK_OFFSETS[index], // Start near-flat and tightly stacked in center
                  scale: 0.94,
                }}
                animate={
                  isInView
                    ? {
                        opacity: 1,
                        x: cardStyle.x,
                        y: cardStyle.y,
                        rotate: cardStyle.rotate,
                        scale: cardStyle.scale,
                        zIndex: cardStyle.zIndex,
                      }
                    : {
                        opacity: 0,
                        y: 45,
                        rotate: 0,
                        x: INITIAL_STACK_OFFSETS[index],
                        scale: 0.94,
                      }
                }
                onAnimationComplete={() => {
                  if (index === steps.length - 1 && !hasEntered) {
                    setHasEntered(true);
                  }
                }}
                transition={
                  !hasEntered
                    ? {
                        duration: 0.6,
                        ease: [0.22, 1, 0.36, 1],
                        delay: index * 0.1, // Staggered 100ms apart on entrance
                      }
                    : {
                        duration: 0.28,
                        ease: [0.25, 1, 0.5, 1], // Fluid ease-out over ~250-300ms on hover/unhover
                        delay: 0,
                      }
                }
                style={{
                  backgroundColor: step.bgColor,
                  zIndex: cardStyle.zIndex,
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() =>
                  setHoveredIndex(hoveredIndex === index ? null : index)
                }
                className={`relative cursor-pointer shrink-0 w-[215px] lg:w-[270px] xl:w-[295px] h-[345px] lg:h-[395px] xl:h-[415px] rounded-2xl sm:rounded-[22px] border-3 border-black p-3.5 lg:p-4.5 xl:p-5 flex flex-col justify-between transition-shadow duration-200 ${
                  isHovered
                    ? "shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]"
                    : "shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
                } ${index > 0 ? "-ml-[56px] lg:-ml-[76px] xl:-ml-[86px]" : ""}`}
              >
                {/* 1. Header: Step Tag */}
                <div className="flex items-center w-full">
                  <div className="inline-flex items-center bg-black text-white px-2.5 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                    <span className="font-mono text-[10px] lg:text-[11px] font-black uppercase tracking-wider">
                      {step.stepNumber}
                    </span>
                  </div>
                </div>

                {/* 2. Platform UI Visualization */}
                <div className="w-full flex-1 flex items-center justify-center my-1.5 lg:my-2">
                  {step.visualization}
                </div>

                {/* 3. Headline & Description */}
                <div className="space-y-1 text-left pt-1">
                  <h3 className="font-black text-sm lg:text-base xl:text-lg uppercase tracking-tight text-black leading-tight line-clamp-2">
                    {step.headline}
                  </h3>
                  <p className="text-[10px] lg:text-[11px] xl:text-xs font-bold text-black/85 leading-relaxed line-clamp-3">
                    {step.body}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
