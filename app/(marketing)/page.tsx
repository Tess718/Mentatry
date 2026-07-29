import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Brain,
  KeyRound,
  BarChart3,
  Rocket,
  GraduationCap,
  Zap,
  ArrowUpRight,
  HelpCircle,
  Layers,
  CheckCircle2,
  ListOrdered,
  Trophy,
} from "lucide-react";
import { LandingTabShowcase } from "@/components/landing-tab-showcase";
import { LandingFAQ } from "@/components/landing-faq";

export default function HomePage() {
  return (
    <div className="space-y-24 py-6 sm:py-10 max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="relative text-center space-y-8 py-6 px-4">
        {/* Circular Stamp Element (Top Right floating) */}
        <div className="hidden md:flex absolute top-0 right-4 lg:right-12 items-center justify-center">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full animate-spin-slow" viewBox="0 0 100 100">
              <path
                id="circlePath"
                d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
                fill="none"
              />
              <text className="text-[10px] font-black uppercase tracking-widest fill-amber-300">
                <textPath href="#circlePath">
                  • EXPERIENCE THE FUTURE • PERFECT LEARNING
                </textPath>
              </text>
            </svg>
            <div className="absolute w-10 h-10 bg-amber-400 border-2 border-black rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <ArrowUpRight className="w-5 h-5 text-black stroke-[3]" />
            </div>
          </div>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white leading-none max-w-4xl mx-auto">
          EXPERIENCE WITH NEW WAYS OF{" "}
          <span className="stitched-tag stitched-tag-cyan rotate-[-2deg] my-1 inline-block">
            PERFECT
          </span>{" "}
          LEARNING
        </h1>

        <p className="text-base sm:text-xl font-bold text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Generate interactive multiple-choice quizzes from any topic or raw notes in seconds. Share via short join codes & track live student performance.
        </p>

        {/* Hero CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link href="/signup" className="neo-btn neo-btn-pink text-base sm:text-lg px-8 py-4">
            <span>GET STARTED FREE</span>
            <ArrowRight className="w-5 h-5 stroke-[3]" />
          </Link>
          <Link href="/quizzes/join" className="neo-btn neo-btn-white text-base sm:text-lg px-8 py-4">
            <KeyRound className="w-5 h-5 stroke-[2.5]" />
            <span>ENTER JOIN CODE</span>
          </Link>
        </div>
      </section>

      {/* Section 1: "OUR SPECIAL FEATURES FOR YOUR EDUCATION" */}
      <section className="space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
            OUR SPECIAL FEATURES FOR YOUR{" "}
            <span className="stitched-tag stitched-tag-lime rotate-[1deg] inline-block">
              EDUCATION
            </span>
          </h2>
          <p className="text-slate-400 font-semibold text-sm sm:text-base max-w-xl mx-auto">
            We provide powerful tools for both teachers and self-directed learners to test and monitor knowledge effortlessly.
          </p>
        </div>

        {/* 4 Color Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Virtual AI Class / Generator (Yellow) */}
          <div className="neo-box-yellow rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between hover:-translate-y-2 transition-transform">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white border-3 border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Brain className="w-8 h-8 text-black stroke-[2.5]" />
              </div>
              <h3 className="text-2xl font-black uppercase text-black">
                AI Quiz Generator
              </h3>
              <p className="text-black font-bold text-sm leading-relaxed">
                Generate high-quality multiple-choice questions from any custom topic or pasted lecture notes with complete answer choices and detailed explanations.
              </p>
            </div>
            <div className="pt-4 border-t-2 border-black flex items-center justify-between font-black text-xs uppercase text-black">
              <span>Instant Generation</span>
              <Zap className="w-4 h-4 fill-black" />
            </div>
          </div>

          {/* Card 2: Classroom Join Codes (Blue / Periwinkle) */}
          <div className="neo-box-cyan rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between hover:-translate-y-2 transition-transform">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white border-3 border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black">
                <GraduationCap className="w-8 h-8 text-black stroke-[2.5]" />
              </div>
              <h3 className="text-2xl font-black uppercase text-black">
                Join Code Rooms
              </h3>
              <p className="text-black font-bold text-sm leading-relaxed">
                Share quizzes seamlessly using 6-character room codes. No complex setup for takers — jump straight into testing knowledge.
              </p>
            </div>
            <div className="pt-4 border-t-2 border-black flex items-center justify-between font-black text-xs uppercase text-black">
              <span>Instant Room Codes</span>
              <KeyRound className="w-4 h-4" />
            </div>
          </div>

          {/* Card 3: Student Monitoring & Analytics (Pink) */}
          <div className="neo-box-pink rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between hover:-translate-y-2 transition-transform">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white border-3 border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black">
                <BarChart3 className="w-8 h-8 text-black stroke-[2.5]" />
              </div>
              <h3 className="text-2xl font-black uppercase text-black">
                Real-Time Insights
              </h3>
              <p className="text-black font-bold text-sm leading-relaxed">
                Detailed score analytics, accuracy metrics, and question-by-question breakdowns to help you track student progress and identify study gaps.
              </p>
            </div>
            <div className="pt-4 border-t-2 border-black flex items-center justify-between font-black text-xs uppercase text-black">
              <span>Automatic Grading</span>
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>

          {/* Card 4: Gamification & Rewards (Lime) */}
          <div className="neo-box-lime rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between hover:-translate-y-2 transition-transform">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white border-3 border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black">
                <Trophy className="w-8 h-8 text-black stroke-[2.5]" />
              </div>
              <h3 className="text-2xl font-black uppercase text-black">
                Gamification & Rewards
              </h3>
              <p className="text-black font-bold text-sm leading-relaxed">
                Keep learners motivated with a built-in achievement system! Unlock exclusive badges, track daily streaks, and compete for perfect scores.
              </p>
            </div>
            <div className="pt-4 border-t-2 border-black flex items-center justify-between font-black text-xs uppercase text-black">
              <span>Earn Badges</span>
              <Trophy className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: "HOW IT WORKS" 4-Step Stepper */}
      <section className="space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-amber-300 text-black font-black text-xs uppercase px-3.5 py-1.5 rounded-md border-2 border-black">
            <ListOrdered className="w-4 h-4 stroke-[3]" /> SIMPLE STEP-BY-STEP PROCESS
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
            HOW MENTATRY{" "}
            <span className="stitched-tag stitched-tag-yellow rotate-[-1deg] inline-block">
              WORKS
            </span>
          </h2>
          <p className="text-slate-400 font-semibold text-sm sm:text-base max-w-xl mx-auto">
            From topic input to live classroom analytics in 4 simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="neo-box p-6 bg-white text-black space-y-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(250,204,21,1)]">
            <div className="w-10 h-10 bg-amber-300 border-2 border-black rounded-xl flex items-center justify-center font-black text-lg">
              01
            </div>
            <h3 className="text-xl font-black uppercase text-black">Enter Subject</h3>
            <p className="text-xs font-bold text-slate-700 leading-relaxed">
              Type any subject topic (e.g. &apos;Quantum Mechanics&apos;) or paste raw study notes directly.
            </p>
          </div>

          {/* Step 2 */}
          <div className="neo-box p-6 bg-white text-black space-y-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(163,230,53,1)]">
            <div className="w-10 h-10 bg-lime-300 border-2 border-black rounded-xl flex items-center justify-center font-black text-lg">
              02
            </div>
            <h3 className="text-xl font-black uppercase text-black">AI Generation</h3>
            <p className="text-xs font-bold text-slate-700 leading-relaxed">
              AI crafts verified multiple-choice questions, options, and explanations instantly.
            </p>
          </div>

          {/* Step 3 */}
          <div className="neo-box p-6 bg-white text-black space-y-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(244,114,182,1)]">
            <div className="w-10 h-10 bg-pink-300 border-2 border-black rounded-xl flex items-center justify-center font-black text-lg">
              03
            </div>
            <h3 className="text-xl font-black uppercase text-black">Share Code</h3>
            <p className="text-xs font-bold text-slate-700 leading-relaxed">
              Share the 6-character room code with students for one-click access on any device.
            </p>
          </div>

          {/* Step 4 */}
          <div className="neo-box p-6 bg-white text-black space-y-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(103,232,249,1)]">
            <div className="w-10 h-10 bg-cyan-300 border-2 border-black rounded-xl flex items-center justify-center font-black text-lg">
              04
            </div>
            <h3 className="text-xl font-black uppercase text-black">Live Insights</h3>
            <p className="text-xs font-bold text-slate-700 leading-relaxed">
              View real-time score analytics, question miss rates, and individual attempt records.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: "OUR PLATFORM IS EASY TO USE" Interactive Tab Showcase */}
      <section className="space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
            OUR PLATFORM IS{" "}
            <span className="stitched-tag stitched-tag-cyan rotate-[-1deg] inline-block">
              EASY
            </span>{" "}
            TO USE & USEFUL FOR THE FUTURE
          </h2>
          <p className="text-slate-400 font-semibold text-sm sm:text-base max-w-xl mx-auto">
            Click through our interactive preview to experience how simple quiz creation and participation really is.
          </p>
        </div>

        {/* Dynamic Interactive Tab Showcase */}
        <LandingTabShowcase />
      </section>

      {/* Section 4: FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section className="space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-pink-300 text-black font-black text-xs uppercase px-3.5 py-1.5 rounded-md border-2 border-black">
            <HelpCircle className="w-4 h-4 stroke-[3]" /> GOT QUESTIONS?
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
            FREQUENTLY ASKED{" "}
            <span className="stitched-tag stitched-tag-pink rotate-[1deg] inline-block">
              QUESTIONS
            </span>
          </h2>
          <p className="text-slate-400 font-semibold text-sm sm:text-base max-w-xl mx-auto">
            Everything you need to know about Mentatry AI quiz creation and classroom room codes.
          </p>
        </div>

        <LandingFAQ />
      </section>

      {/* Section 5: "LET'S UNLOCK YOUR POTENTIAL" CTA Box */}
      <section className="relative neo-box bg-white rounded-3xl p-8 sm:p-14 text-black text-center space-y-6 overflow-hidden shadow-[12px_12px_0px_0px_rgba(250,204,21,1)]">
        <div className="inline-flex items-center gap-2 bg-slate-900 text-white font-black text-xs uppercase px-4 py-1.5 rounded-full border-2 border-black">
          <Rocket className="w-4 h-4 text-amber-300" /> READY TO GET STARTED?
        </div>

        <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-black">
          LET&apos;S UNLOCK YOUR{" "}
          <span className="stitched-tag stitched-tag-pink rotate-[2deg] inline-block">
            POTENTIAL
          </span>
        </h2>

        <p className="text-slate-800 font-extrabold text-base sm:text-lg max-w-2xl mx-auto">
          Join thousands of learners and educators creating engaging AI quizzes in seconds. Free forever for individuals.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link href="/signup" className="neo-btn neo-btn-pink text-base sm:text-lg px-8 py-4">
            <span>CREATE FREE ACCOUNT</span>
            <ArrowRight className="w-5 h-5 stroke-[3]" />
          </Link>
          <Link href="/quizzes/join" className="neo-btn neo-btn-lime text-base sm:text-lg px-8 py-4">
            <span>JOIN A QUIZ NOW</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
