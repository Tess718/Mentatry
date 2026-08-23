import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  ArrowRight,
  Brain,
  KeyRound,
  BarChart3,
  Rocket,
  GraduationCap,
  Zap,
  ArrowUpRight,
  CheckCircle2,
  Trophy,
  User,
  Users,
  Timer,
  Compass,
  Flame,
} from "lucide-react";
import { LandingTabShowcase } from "@/components/landing-tab-showcase";
import { LandingFAQ } from "@/components/landing-faq";
import { ExploreQuizCard } from "@/components/explore-quiz-card";
import {
  MotionSection,
  MotionHero,
  MotionStaggerContainer,
  MotionStaggerItem,
  MotionStitchedTag,
  MotionFloatingBadge,
  MotionCtaBox,
} from "@/components/motion/motion-wrappers";

export default async function HomePage() {
  const session = await auth();

  // Fetch top 3 trending public community quizzes for the homepage preview
  const featuredQuizzes = await prisma.quiz.findMany({
    where: {
      status: "PUBLISHED",
      isPublic: true,
      isDailyQuiz: false,
    },
    orderBy: [{ attempts: { _count: "desc" } }, { createdAt: "desc" }],
    take: 3,
    select: {
      id: true,
      title: true,
      difficulty: true,
      sourceType: true,
      sourceContent: true,
      timeLimitMinutes: true,
      joinCode: true,
      isDailyQuiz: true,
      createdAt: true,
      owner: {
        select: {
          firstName: true,
          email: true,
        },
      },
      _count: {
        select: {
          questions: true,
          attempts: true,
        },
      },
    },
  });

  return (
    <div className="space-y-24 py-6 sm:py-10 max-w-7xl mx-auto">
      {/* Hero Section */}
      <MotionHero className="relative text-center space-y-8 py-6 px-4">
        {/* Circular Stamp Element (Top Right floating) */}
        <div className="hidden md:flex absolute top-0 right-4 lg:right-12 items-center justify-center">
          <MotionFloatingBadge className="relative w-28 h-28 flex items-center justify-center cursor-pointer">
            <svg
              className="w-full h-full animate-spin-slow"
              viewBox="0 0 100 100"
            >
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
          </MotionFloatingBadge>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white leading-none max-w-4xl mx-auto">
          TURN ANY TOPIC INTO AN<br className="hidden sm:block" />
          <MotionStitchedTag
            initialRotate={-2}
            className="stitched-tag stitched-tag-cyan my-1 inline-block mt-4"
          >
            INTERACTIVE
          </MotionStitchedTag>{" "}
          QUIZ
        </h1>

        <p className="text-base sm:text-xl font-bold text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Generate interactive multiple-choice quizzes from any topic or raw
          notes in seconds. Share via short join codes & track live participant
          performance.
        </p>

        {/* Clean 2-Button Hero CTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 pt-2 w-full max-w-sm sm:max-w-none mx-auto">
          <Link
            href="/signup"
            className="neo-btn neo-btn-pink text-base sm:text-lg px-8 py-3.5 sm:py-4 w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <span>GET STARTED FREE</span>
            <ArrowRight className="w-5 h-5 stroke-[3]" />
          </Link>
          <Link
            href="/rooms/join"
            className="neo-btn neo-btn-white text-base sm:text-lg px-8 py-3.5 sm:py-4 w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <KeyRound className="w-5 h-5 stroke-[2.5]" />
            <span>JOIN LIVE ROOM</span>
          </Link>
        </div>
      </MotionHero>

      {/* Section 1: Features */}
      <MotionSection className="space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
            POWERFUL TOOLS TO ACCELERATE YOUR
            <br className="hidden sm:block" />
            <MotionStitchedTag
              initialRotate={1}
              className="stitched-tag stitched-tag-lime inline-block mt-4"
            >
              LEARNING
            </MotionStitchedTag>
          </h2>
          <p className="text-slate-400 font-semibold text-sm sm:text-base max-w-xl mx-auto">
            We provide powerful tools for both creators and self-directed
            learners to test and monitor knowledge effortlessly.
          </p>
        </div>

        {/* Desktop 2x2 Grid with Staggered Scroll Entrance */}
        <MotionStaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: AI Quiz Generator (Yellow) */}
          <MotionStaggerItem className="neo-box-yellow rounded-3xl p-8 space-y-6 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white border-3 border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Brain className="w-8 h-8 text-black stroke-[2.5]" />
              </div>
              <h3 className="text-2xl font-black uppercase text-black">
                AI Quiz Generator
              </h3>
              <p className="text-black font-bold text-sm leading-relaxed">
                Generate high-quality multiple-choice questions from any custom
                topic or pasted lecture notes with complete answer choices and
                detailed explanations.
              </p>
            </div>
            <div className="pt-4 border-t-2 border-black flex items-center justify-between font-black text-xs uppercase text-black">
              <span>Instant Generation</span>
              <Zap className="w-4 h-4 fill-black" />
            </div>
          </MotionStaggerItem>

          {/* Card 2: Join Code Rooms (Cyan) */}
          <MotionStaggerItem className="neo-box-cyan rounded-3xl p-8 space-y-6 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white border-3 border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black">
                <GraduationCap className="w-8 h-8 text-black stroke-[2.5]" />
              </div>
              <h3 className="text-2xl font-black uppercase text-black">
                Join Code Rooms
              </h3>
              <p className="text-black font-bold text-sm leading-relaxed">
                Share quizzes seamlessly using 6-character room codes. No
                complex setup for takers — jump straight into testing knowledge.
              </p>
            </div>
            <div className="pt-4 border-t-2 border-black flex items-center justify-between font-black text-xs uppercase text-black">
              <span>Instant Room Codes</span>
              <KeyRound className="w-4 h-4" />
            </div>
          </MotionStaggerItem>

          {/* Card 3: Real-Time Insights (Pink) */}
          <MotionStaggerItem className="neo-box-pink rounded-3xl p-8 space-y-6 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white border-3 border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black">
                <BarChart3 className="w-8 h-8 text-black stroke-[2.5]" />
              </div>
              <h3 className="text-2xl font-black uppercase text-black">
                Real-Time Insights
              </h3>
              <p className="text-black font-bold text-sm leading-relaxed">
                Detailed score analytics, accuracy metrics, and
                question-by-question breakdowns to help you track participant
                progress and identify study gaps.
              </p>
            </div>
            <div className="pt-4 border-t-2 border-black flex items-center justify-between font-black text-xs uppercase text-black">
              <span>Automatic Grading</span>
              <BarChart3 className="w-4 h-4" />
            </div>
          </MotionStaggerItem>

          {/* Card 4: Gamification & Rewards (Lime) */}
          <MotionStaggerItem className="neo-box-lime rounded-3xl p-8 space-y-6 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white border-3 border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black">
                <Trophy className="w-8 h-8 text-black stroke-[2.5]" />
              </div>
              <h3 className="text-2xl font-black uppercase text-black">
                Gamification & Rewards
              </h3>
              <p className="text-black font-bold text-sm leading-relaxed">
                Keep learners motivated with a built-in achievement system!
                Unlock exclusive badges, track daily streaks, and compete for
                perfect scores.
              </p>
            </div>
            <div className="pt-4 border-t-2 border-black flex items-center justify-between font-black text-xs uppercase text-black">
              <span>Earn Badges</span>
              <Trophy className="w-4 h-4" />
            </div>
          </MotionStaggerItem>
        </MotionStaggerContainer>
      </MotionSection>

      {/* Section 1.5: Featured Community Quizzes Preview */}
      {featuredQuizzes.length > 0 && (
        <MotionSection className="space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
              TRENDING COMMUNITY
              <br className="hidden sm:block" />
              <MotionStitchedTag
                initialRotate={-1}
                className="stitched-tag stitched-tag-yellow inline-block mt-4"
              >
                QUIZZES
              </MotionStitchedTag>
            </h2>
            <p className="text-slate-400 font-semibold text-sm sm:text-base max-w-xl mx-auto">
              Jump straight into popular public quizzes created by the community, or host one live for your friends and classroom.
            </p>
          </div>

          <MotionStaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.08}>
            {featuredQuizzes.map((quiz) => (
              <MotionStaggerItem key={quiz.id} className="h-full">
                <ExploreQuizCard
                  quiz={quiz}
                  isLoggedIn={!!session?.user}
                  currentUserId={session?.user?.id}
                />
              </MotionStaggerItem>
            ))}
          </MotionStaggerContainer>

          <div className="text-center pt-2">
            <Link
              href="/explore"
              className="neo-btn neo-btn-cyan text-sm sm:text-base py-3.5 px-6 sm:px-8 inline-flex items-center gap-2"
            >
              <Compass className="w-5 h-5 stroke-[2.5]" />
              <span>BROWSE ALL COMMUNITY QUIZZES</span>
              <ArrowRight className="w-5 h-5 stroke-[3]" />
            </Link>
          </div>
        </MotionSection>
      )}

      {/* Section 1.75: "THREE WAYS TO PLAY" */}
      <MotionSection className="space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
            THREE WAYS TO
            <br className="hidden sm:block" />
            <MotionStitchedTag
              initialRotate={2}
              className="stitched-tag stitched-tag-pink inline-block mt-4"
            >
              PLAY
            </MotionStitchedTag>
          </h2>
          <p className="text-slate-400 font-semibold text-sm sm:text-base max-w-xl mx-auto">
            Whether you&apos;re studying alone, hosting a live classroom, or
            competing globally.
          </p>
        </div>

        <MotionStaggerContainer className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Flow 1: Solo / Async */}
          <MotionStaggerItem className="neo-box bg-white p-8 rounded-3xl space-y-6 shadow-[8px_8px_0px_0px_rgba(250,204,21,1)] border-4 border-amber-400 flex flex-col h-full">
            <div className="w-16 h-16 bg-amber-300 border-3 border-black rounded-2xl flex items-center justify-center shrink-0">
              <User className="w-8 h-8 text-black stroke-[2.5]" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-black uppercase text-black mb-3">
                Solo Practice
              </h3>
              <p className="text-slate-700 font-bold leading-relaxed text-sm">
                Study at your own pace. Generate a quiz, take it instantly, and
                retake it as many times as you need. Perfect for personal
                revision, exam prep, and self-directed learning.
              </p>
            </div>
            <div className="pt-4 border-t-2 border-slate-100">
              <ul className="space-y-3 text-sm font-black uppercase tracking-wide text-slate-800">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-500" /> Go at your
                  own pace
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-500" /> Unlimited
                  retakes
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-500" /> Post-quiz
                  analytics
                </li>
              </ul>
            </div>
          </MotionStaggerItem>

          {/* Flow 2: Live Room */}
          <MotionStaggerItem className="neo-box bg-white p-8 rounded-3xl space-y-6 shadow-[8px_8px_0px_0px_rgba(163,230,53,1)] border-4 border-lime-400 flex flex-col h-full">
            <div className="w-16 h-16 bg-lime-400 border-3 border-black rounded-2xl flex items-center justify-center shrink-0">
              <Users className="w-8 h-8 text-black stroke-[2.5]" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-black uppercase text-black mb-3">
                Live Classrooms
              </h3>
              <p className="text-slate-700 font-bold leading-relaxed text-sm">
                Host a real-time multiplayer quiz. Participants join via a
                6-character code and answer questions in sync. Perfect for
                classrooms, workshops, and team-building.
              </p>
            </div>
            <div className="pt-4 border-t-2 border-slate-100">
              <ul className="space-y-3 text-sm font-black uppercase tracking-wide text-slate-800">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-lime-600" /> Host
                  controls the pace
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-lime-600" /> Live
                  leaderboard & scoring
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-lime-600" /> Up to 200
                  players
                </li>
              </ul>
            </div>
          </MotionStaggerItem>

          {/* Flow 3: Daily Challenge */}
          <MotionStaggerItem className="neo-box bg-white p-8 rounded-3xl space-y-6 shadow-[8px_8px_0px_0px_rgba(34,211,238,1)] border-4 border-cyan-400 flex flex-col h-full">
            <div className="w-16 h-16 bg-cyan-300 border-3 border-black rounded-2xl flex items-center justify-center shrink-0">
              <Timer className="w-8 h-8 text-black stroke-[2.5]" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-black uppercase text-black mb-3">
                Daily Challenge
              </h3>
              <p className="text-slate-700 font-bold leading-relaxed text-sm">
                Compete against the world in a fresh, AI-generated quiz every
                single day. Only your first attempt counts. Rank up on the
                global midnight leaderboard!
              </p>
            </div>
            <div className="pt-4 border-t-2 border-slate-100">
              <ul className="space-y-3 text-sm font-black uppercase tracking-wide text-slate-800">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-600" /> New quiz
                  every 24 hours
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-600" /> Global
                  midnight rankings
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-600" />{" "}
                  Tie-breakers on speed
                </li>
              </ul>
            </div>
          </MotionStaggerItem>
        </MotionStaggerContainer>
      </MotionSection>

      {/* Section 1.8: GUEST VS AUTHENTICATED MODE */}
      <MotionSection className="space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
            HOST ANY WAY YOU<br className="hidden sm:block" />
            <MotionStitchedTag
              initialRotate={-1}
              className="stitched-tag stitched-tag-cyan inline-block mt-4"
            >
              WANT
            </MotionStitchedTag>
          </h2>
          <p className="text-slate-400 font-semibold text-sm sm:text-base max-w-xl mx-auto">
            Choose between frictionless instant-join rooms for one-off events, or authenticated tracking for your permanent classroom.
          </p>
        </div>

        <MotionStaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Guest Mode */}
          <MotionStaggerItem className="neo-box rounded-3xl p-8 bg-slate-50 border-4 border-slate-300 space-y-6 flex flex-col h-full">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-cyan-200 border-2 border-black rounded-full flex items-center justify-center shrink-0">
                <Users className="w-7 h-7 text-black stroke-[2.5]" />
              </div>
              <h3 className="text-2xl font-black uppercase text-black">Guest Mode</h3>
            </div>
            <p className="text-sm font-bold text-slate-700 leading-relaxed flex-1">
              Perfect for quick icebreakers, workshops, or anonymous audiences. Participants just enter a 6-character code and a nickname to join instantly—zero account creation required.
            </p>
            <ul className="space-y-2 text-sm font-black uppercase tracking-wide text-slate-600 border-t-2 border-slate-200 pt-4">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-cyan-600" /> No sign-ups needed</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-cyan-600" /> Instant join links</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-cyan-600" /> Frictionless experience</li>
            </ul>
            
            {/* Visual representation: Guest Mode */}
            <div className="mt-6 pt-6 border-t-4 border-slate-200">
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-3 shadow-[4px_4px_0px_0px_rgba(203,213,225,1)] rotate-[-1deg] hover:rotate-0 transition-transform">
                <div className="flex gap-2">
                  <div className="flex-1 bg-slate-50 border-2 border-slate-200 h-10 rounded-xl flex items-center px-3 text-slate-400 font-bold text-[10px] sm:text-xs uppercase tracking-widest">Code</div>
                  <div className="flex-1 bg-slate-50 border-2 border-slate-200 h-10 rounded-xl flex items-center px-3 text-slate-400 font-bold text-[10px] sm:text-xs uppercase tracking-widest">Nickname</div>
                </div>
                <div className="bg-cyan-400 border-2 border-black h-10 rounded-xl flex items-center justify-center text-black font-black uppercase text-xs tracking-widest hover:bg-cyan-300 transition-colors cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Join Game</div>
              </div>
            </div>
          </MotionStaggerItem>

          {/* Authenticated Mode */}
          <MotionStaggerItem className="neo-box rounded-3xl p-8 bg-amber-50 border-4 border-amber-300 space-y-6 shadow-[6px_6px_0px_0px_rgba(251,191,36,1)] flex flex-col h-full">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-400 border-2 border-black rounded-full flex items-center justify-center shrink-0">
                <GraduationCap className="w-7 h-7 text-black stroke-[2.5]" />
              </div>
              <h3 className="text-2xl font-black uppercase text-black">Authenticated Mode</h3>
            </div>
            <p className="text-sm font-bold text-slate-700 leading-relaxed flex-1">
              Designed for dedicated classrooms and long-term tracking. Requires students to log in, allowing you to track their progress, accuracy, and growth across multiple quizzes over time.
            </p>
            <ul className="space-y-2 text-sm font-black uppercase tracking-wide text-slate-600 border-t-2 border-amber-200 pt-4">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-amber-600" /> Persistent scoring</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-amber-600" /> Historical tracking</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-amber-600" /> Earn achievements</li>
            </ul>
            
            {/* Visual representation: Authenticated Mode */}
            <div className="mt-6 pt-6 border-t-4 border-amber-200">
              <div className="bg-white border-2 border-amber-300 rounded-2xl p-4 space-y-4 shadow-[4px_4px_0px_0px_rgba(252,211,77,1)] rotate-[1deg] hover:rotate-0 transition-transform">
                <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-300 border-2 border-black rounded-full"></div>
                    <div>
                      <div className="h-3 w-16 bg-slate-800 rounded-sm mb-1.5"></div>
                      <div className="h-2 w-10 bg-slate-300 rounded-sm"></div>
                    </div>
                  </div>
                  <div className="bg-lime-400 border-2 border-black px-2 py-1 rounded-md text-[9px] font-black uppercase text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">Student</div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-amber-50 border-2 border-amber-200 h-12 rounded-xl flex flex-col justify-center px-3">
                    <div className="text-[9px] font-black uppercase text-amber-600 tracking-wider">Total Score</div>
                    <div className="font-black text-sm text-black">2,450</div>
                  </div>
                  <div className="flex-1 bg-orange-50 border-2 border-orange-200 h-12 rounded-xl flex flex-col justify-center px-3">
                    <div className="text-[9px] font-black uppercase text-orange-600 tracking-wider">Top Streak</div>
                    <div className="font-black text-sm flex gap-1 items-center text-black">
                      <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500 shrink-0" />
                      <span>5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </MotionStaggerItem>
        </MotionStaggerContainer>
      </MotionSection>

      {/* Section 2: "HOW IT WORKS" 4-Step Stepper */}
      <MotionSection className="space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
            HOW MENTATRY
            <br className="hidden sm:block" />
            <MotionStitchedTag
              initialRotate={-1}
              className="stitched-tag stitched-tag-yellow inline-block mt-4"
            >
              WORKS
            </MotionStitchedTag>
          </h2>
          <p className="text-slate-400 font-semibold text-sm sm:text-base max-w-xl mx-auto">
            From topic input to live classroom analytics in 4 simple steps.
          </p>
        </div>

        <MotionStaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
          {/* Step 1 */}
          <MotionStaggerItem className="neo-box p-6 bg-white text-black space-y-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(250,204,21,1)] h-full">
            <div className="w-10 h-10 bg-amber-300 border-2 border-black rounded-xl flex items-center justify-center font-black text-lg">
              01
            </div>
            <h3 className="text-xl font-black uppercase text-black">
              Enter Subject
            </h3>
            <p className="text-xs font-bold text-slate-700 leading-relaxed">
              Type any subject topic (e.g. &apos;Quantum Mechanics&apos;) or
              paste raw study notes directly.
            </p>
          </MotionStaggerItem>

          {/* Step 2 */}
          <MotionStaggerItem className="neo-box p-6 bg-white text-black space-y-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(163,230,53,1)] h-full">
            <div className="w-10 h-10 bg-lime-300 border-2 border-black rounded-xl flex items-center justify-center font-black text-lg">
              02
            </div>
            <h3 className="text-xl font-black uppercase text-black">
              AI Generation
            </h3>
            <p className="text-xs font-bold text-slate-700 leading-relaxed">
              AI crafts verified multiple-choice questions, options, and
              explanations instantly.
            </p>
          </MotionStaggerItem>

          {/* Step 3 */}
          <MotionStaggerItem className="neo-box p-6 bg-white text-black space-y-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(244,114,182,1)] h-full">
            <div className="w-10 h-10 bg-pink-300 border-2 border-black rounded-xl flex items-center justify-center font-black text-lg">
              03
            </div>
            <h3 className="text-xl font-black uppercase text-black">
              Share Code
            </h3>
            <p className="text-xs font-bold text-slate-700 leading-relaxed">
              Share the 6-character room code with quiz takers for one-click
              access on any device.
            </p>
          </MotionStaggerItem>

          {/* Step 4 */}
          <MotionStaggerItem className="neo-box p-6 bg-white text-black space-y-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(103,232,249,1)] h-full">
            <div className="w-10 h-10 bg-cyan-300 border-2 border-black rounded-xl flex items-center justify-center font-black text-lg">
              04
            </div>
            <h3 className="text-xl font-black uppercase text-black">
              Live Insights
            </h3>
            <p className="text-xs font-bold text-slate-700 leading-relaxed">
              View real-time score analytics, question miss rates, and
              individual attempt records.
            </p>
          </MotionStaggerItem>
        </MotionStaggerContainer>
      </MotionSection>

      {/* Section 3: "OUR PLATFORM IS EASY TO USE" Interactive Tab Showcase */}
      <MotionSection className="space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight leading-tight">
            BEAUTIFULLY{" "}
            <MotionStitchedTag
              initialRotate={-1}
              className="stitched-tag stitched-tag-cyan inline-block mx-2"
            >
              SIMPLE
            </MotionStitchedTag>
            <br className="hidden sm:block" /> YET INCREDIBLY POWERFUL
          </h2>
          <p className="text-slate-400 font-semibold text-sm sm:text-base max-w-xl mx-auto">
            Click through our interactive preview to experience how simple quiz
            creation and participation really is.
          </p>
        </div>

        {/* Dynamic Interactive Tab Showcase */}
        <LandingTabShowcase />
      </MotionSection>

      {/* Section 4: FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <MotionSection className="space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
            FREQUENTLY ASKED
            <br className="hidden sm:block" />
            <MotionStitchedTag
              initialRotate={1}
              className="stitched-tag stitched-tag-pink inline-block mt-4"
            >
              QUESTIONS
            </MotionStitchedTag>
          </h2>
          <p className="text-slate-400 font-semibold text-sm sm:text-base max-w-xl mx-auto">
            Everything you need to know about Mentatry AI quiz creation and
            classroom room codes.
          </p>
        </div>

        <LandingFAQ />
      </MotionSection>

      {/* Section 5: "LET'S UNLOCK YOUR POTENTIAL" CTA Box */}
      <MotionCtaBox className="relative neo-box bg-white rounded-3xl p-8 sm:p-14 text-black text-center space-y-6 overflow-hidden shadow-[12px_12px_0px_0px_rgba(250,204,21,1)]">
        <div className="inline-flex items-center gap-2 bg-slate-900 text-white font-black text-xs uppercase px-4 py-1.5 rounded-full border-2 border-black">
          <Rocket className="w-4 h-4 text-amber-300" /> READY TO GET STARTED?
        </div>

        <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-black">
          LET&apos;S UNLOCK YOUR{" "}
          <MotionStitchedTag
            initialRotate={2}
            className="stitched-tag stitched-tag-pink inline-block"
          >
            POTENTIAL
          </MotionStitchedTag>
        </h2>

        <p className="text-slate-800 font-extrabold text-base sm:text-lg max-w-2xl mx-auto">
          Join thousands of learners and educators creating engaging AI quizzes
          in seconds. Free forever for individuals.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 pt-4 w-full max-w-xs sm:max-w-none mx-auto">
          <Link
            href="/signup"
            className="neo-btn neo-btn-pink text-base sm:text-lg px-8 py-4 w-full sm:w-auto"
          >
            <span>CREATE FREE ACCOUNT</span>
            <ArrowRight className="w-5 h-5 stroke-[3]" />
          </Link>
          <Link
            href="/rooms/join"
            className="neo-btn neo-btn-lime text-base sm:text-lg px-8 py-4 w-full sm:w-auto"
          >
            <span>JOIN A QUIZ NOW</span>
          </Link>
        </div>
      </MotionCtaBox>
    </div>
  );
}
