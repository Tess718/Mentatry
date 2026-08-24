import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Trophy, ArrowRight, Sparkles, CheckCircle2, RotateCcw, Share2, Timer } from "lucide-react";
import { auth } from "@/auth";

interface PageProps {
  params: Promise<{ attemptId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { attemptId } = await params;
  const session = await auth();
  const viewerId = session?.user?.id;

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: { select: { title: true, status: true, ownerId: true, isDailyQuiz: true, dailyDate: true } },
      user: { select: { firstName: true } },
    },
  });

  if (!attempt) {
    return {
      title: "Quiz Result | Mentatry",
    };
  }

  const { quiz } = attempt;
  const isOwnerOrTaker = !!viewerId && (attempt.userId === viewerId || quiz.ownerId === viewerId);
  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const isFutureDaily = quiz.isDailyQuiz && quiz.dailyDate && quiz.dailyDate.getTime() > todayUTC.getTime();

  // Security: Prevent metadata leak for unpublished or future daily quizzes if not owner/taker
  if (!isOwnerOrTaker && (quiz.status !== "PUBLISHED" || isFutureDaily)) {
    return {
      title: "Quiz Result | Mentatry",
    };
  }

  const name = attempt.user?.firstName || "A player";
  const percentage = attempt.totalQuestions > 0 
    ? Math.round((attempt.score / attempt.totalQuestions) * 100) 
    : 0;

  const title = `${name} scored ${percentage}% on "${attempt.quiz.title}" | Mentatry`;
  const description = `Can you beat ${name}'s score of ${attempt.score}/${attempt.totalQuestions}? Take the quiz now!`;
  const ogImageUrl = `/api/og/result/${attemptId}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function SharedResultPage({ params }: PageProps) {
  const { attemptId } = await params;
  const session = await auth();

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: {
        select: {
          id: true,
          title: true,
          status: true,
          ownerId: true,
          isDailyQuiz: true,
          dailyDate: true,
          difficulty: true,
          timeLimitMinutes: true,
        },
      },
      user: {
        select: {
          firstName: true,
          email: true,
        },
      },
    },
  });

  if (!attempt) {
    notFound();
  }

  const { quiz, user } = attempt;
  const viewerId = session?.user?.id;
  const isOwnerOrTaker = !!viewerId && (attempt.userId === viewerId || quiz.ownerId === viewerId);

  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const isFutureDaily = quiz.isDailyQuiz && quiz.dailyDate && quiz.dailyDate.getTime() > todayUTC.getTime();

  // Security: Enforce access control on shared results for draft/unpublished and future daily quizzes
  if (!isOwnerOrTaker && (quiz.status !== "PUBLISHED" || isFutureDaily)) {
    notFound();
  }
  const percentage = attempt.totalQuestions > 0 
    ? Math.round((attempt.score / attempt.totalQuestions) * 100) 
    : 0;
  const playerName = user?.firstName || user?.email?.split("@")[0] || "A challenger";

  const isPerfectScore = percentage === 100;
  const isPassing = percentage >= 70;

  const playUrl = quiz.isDailyQuiz ? "/daily" : `/quizzes/${quiz.id}/take`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Navbar */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-4">
        <Link
          href="/"
          className="flex items-center gap-2 bg-amber-400 text-black px-3.5 py-1.5 font-black tracking-wider border-3 border-black shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-0.5 transition-transform rounded-xl"
        >
          <Image
            src="/mentatry_logo.png"
            alt="Mentatry Logo"
            width={28}
            height={28}
            className="w-6 h-6 object-contain shrink-0"
            priority
          />
          <span className="font-bebas tracking-widest text-2xl">
            MENTATRY
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <Link href="/quizzes" className="neo-btn neo-btn-white text-xs py-2 px-3.5">
              Dashboard
            </Link>
          ) : (
            <Link href="/login" className="neo-btn neo-btn-white text-xs py-2 px-3.5">
              Log In
            </Link>
          )}
        </div>
      </header>

      {/* Main Challenge Card Container */}
      <main className="max-w-3xl w-full mx-auto my-auto py-8 space-y-8">
        {/* Challenger Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 neo-badge bg-lime-300 text-black text-xs px-3.5 py-1">
            <Sparkles className="w-3.5 h-3.5" /> Quiz Challenge
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Can you beat <span className="text-amber-400">{playerName}&apos;s</span> score?
          </h1>
          <p className="text-slate-400 font-semibold text-sm sm:text-base max-w-lg mx-auto">
            {playerName} just scored {percentage}% on <span className="text-white font-extrabold">&ldquo;{quiz.title}&rdquo;</span>. Test your knowledge and see how you rank!
          </p>
        </div>

        {/* Dynamic Card Preview / Score Summary Card */}
        <div className={`neo-box p-6 sm:p-8 text-black space-y-6 ${
          isPerfectScore ? "bg-lime-300" : isPassing ? "bg-yellow-300" : "bg-orange-200"
        }`}>
          {/* Card Top */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-3 border-black pb-4">
            <div className="flex items-center gap-2">
              <span className="neo-badge bg-black text-white text-xs uppercase font-black">
                {quiz.isDailyQuiz ? "🏆 Daily Quiz" : "⚡ Solo Quiz"}
              </span>
              <span className="neo-badge bg-white text-black text-xs uppercase font-black">
                {quiz.difficulty}
              </span>
            </div>

            <div className="text-xs font-black uppercase text-slate-800">
              Completed by <span className="font-extrabold text-black">{playerName}</span>
            </div>
          </div>

          {/* Card Middle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 py-2">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight">
                {quiz.title}
              </h2>
              <div className="flex items-center gap-4 text-xs font-black text-slate-800">
                <span>📊 {attempt.totalQuestions} Questions</span>
                {quiz.timeLimitMinutes && (
                  <span className="flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5" /> {quiz.timeLimitMinutes} min limit
                  </span>
                )}
              </div>
            </div>

            {/* Score Pill */}
            <div className="neo-box bg-white p-5 text-center shrink-0 min-w-36 self-stretch sm:self-auto flex flex-col justify-center">
              <div className="text-[10px] font-black uppercase text-slate-500">Score to Beat</div>
              <div className="text-3xl font-black text-black">
                {attempt.score} <span className="text-lg text-slate-500 font-bold">/ {attempt.totalQuestions}</span>
              </div>
              <div className="neo-badge bg-lime-300 text-black text-xs font-black mx-auto mt-1 px-2 py-0.5">
                {percentage}%
              </div>
            </div>
          </div>

          {/* Action Button inside Card */}
          <div className="pt-2">
            <Link
              href={playUrl}
              className="neo-btn neo-btn-black w-full text-center text-base py-4 font-black uppercase tracking-wide flex items-center justify-center gap-3 shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]"
            >
              <span>Accept Challenge & Play</span>
              <ArrowRight className="w-5 h-5 stroke-[3]" />
            </Link>
          </div>
        </div>

        {/* Secondary Info / Explore Links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-bold text-slate-400">
          <span>✨ Free to play • No app download required</span>
          <span className="hidden sm:inline">•</span>
          <Link href="/" className="hover:text-white underline transition-colors">
            Learn more about Mentatry
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center text-xs font-bold text-slate-600 py-4">
        Mentatry — AI Powered Interactive Quizzes & Live Games
      </footer>
    </div>
  );
}
