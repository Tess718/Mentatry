import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Plus, KeyRound } from "lucide-react";
import { DashboardQuizGrid, DashboardQuizItem } from "@/components/dashboard-quiz-grid";
import { DashboardGridSkeleton } from "@/components/dashboard-skeletons";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Quizzes",
  description: "Manage your generated quizzes, host live rooms, and view analytics.",
};

export default async function QuizzesDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const userFirstName = session.user.firstName || "Quizmaster";

  // Fetch all quizzes user owns or has access to — only select fields the dashboard needs
  const accessRecords = await prisma.quizAccess.findMany({
    where: { userId },
    include: {
      quiz: {
        include: {
          _count: {
            select: { questions: true },
          },
          attempts: {
            where: { userId },
            orderBy: { completedAt: "desc" },
            select: {
              id: true,
              score: true,
            },
          },
        },
      },
    },
    orderBy: {
      quiz: { createdAt: "desc" },
    },
  });

  const quizItems: DashboardQuizItem[] = accessRecords.map(({ role, quiz }) => {
    const isOwner = role === "OWNER" || quiz.ownerId === userId;
    const questionCount = quiz._count.questions;
    const attempts = quiz.attempts;
    const hasAttempts = attempts.length > 0;

    let bestScore = 0;
    if (hasAttempts) {
      bestScore = Math.max(...attempts.map((a) => a.score));
    }
    const latestAttempt = hasAttempts ? attempts[0] : null;

    return {
      id: quiz.id,
      title: quiz.title,
      sourceType: quiz.sourceType,
      difficulty: quiz.difficulty,
      status: quiz.status,
      timeLimitMinutes: quiz.timeLimitMinutes,
      joinCode: quiz.joinCode,
      createdAt: quiz.createdAt.toISOString(),
      isOwner,
      questionCount,
      attemptsCount: attempts.length,
      bestScore,
      latestAttemptScore: latestAttempt ? latestAttempt.score : null,
      latestAttemptId: latestAttempt ? latestAttempt.id : null,
    };
  });

  return (
    <div className="space-y-8 py-4">
      {/* Dashboard Top Hero Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 neo-box p-6 sm:p-8 bg-amber-300 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-black tracking-tight leading-tight">
            WELCOME BACK, {userFirstName}!
          </h1>
          <p className="text-slate-900 font-bold text-sm sm:text-base">
            Create AI quizzes, join classroom rooms, and monitor live test performance.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <Link href="/quizzes/new" className="neo-btn neo-btn-lime text-sm sm:text-sm px-4 py-3 sm:py-2.5 whitespace-nowrap">
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>CREATE NEW QUIZ</span>
          </Link>
          <Link href="/quizzes/join" className="neo-btn neo-btn-white text-sm sm:text-sm px-4 py-3 sm:py-2.5 whitespace-nowrap">
            <KeyRound className="w-4 h-4 stroke-[3]" />
            <span>JOIN WITH CODE</span>
          </Link>
        </div>
      </div>

      {/* Main Interactive Grid & Stat Metrics wrapped in Suspense boundary for streaming */}
      <Suspense fallback={<DashboardGridSkeleton />}>
        <DashboardQuizGrid quizzes={quizItems} userFirstName={userFirstName} />
      </Suspense>
    </div>
  );
}
