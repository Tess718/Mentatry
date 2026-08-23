import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Plus, KeyRound } from "lucide-react";
import {
  DashboardQuizGrid,
  DashboardQuizItem,
  DashboardStats,
  DashboardPagination,
} from "@/components/dashboard-quiz-grid";
import { DashboardGridSkeleton } from "@/components/dashboard-skeletons";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Quizzes",
  description: "Manage your generated quizzes, host live rooms, and view analytics.",
};

const PAGE_SIZE = 9;

interface PageProps {
  searchParams: Promise<{
    tab?: string;
    page?: string;
  }>;
}

export default async function QuizzesDashboardPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const userId = session.user.id;
  const userFirstName = session.user.firstName || "Quizmaster";

  return (
    <div className="space-y-8 py-4">
      {/* Dashboard Top Hero Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 neo-box p-6 sm:p-8 bg-amber-300 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black">
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
        <AsyncQuizGrid
          userId={userId}
          userFirstName={userFirstName}
          tab={params.tab}
          page={params.page}
        />
      </Suspense>
    </div>
  );
}

async function AsyncQuizGrid({
  userId,
  userFirstName,
  tab,
  page,
}: {
  userId: string;
  userFirstName: string;
  tab?: string;
  page?: string;
}) {
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);

  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setUTCDate(startOfTomorrow.getUTCDate() + 1);

  // Parse active tab and page
  const currentTab = (tab || "all").toLowerCase();
  const activeTab: "ALL" | "OWNER" | "JOINED" =
    currentTab === "owner" ? "OWNER" : currentTab === "joined" ? "JOINED" : "ALL";

  const rawPage = parseInt(page || "1", 10);
  const currentPage = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  // Build database query filters based on active tab
  const libraryWhere: any = {
    userId,
    quiz: {
      OR: [
        { isDailyQuiz: false },
        { isDailyQuiz: true, dailyDate: { gte: startOfToday, lt: startOfTomorrow } },
      ],
    },
  };

  const baseWhere: any = {
    ...libraryWhere,
  };

  if (activeTab === "OWNER") {
    baseWhere.role = "OWNER";
  } else if (activeTab === "JOINED") {
    baseWhere.role = { not: "OWNER" };
  }

  // Execute queries in parallel: lightweight counts for stats + exact 9 paginated rows
  const [
    totalQuizzesCount,
    totalCreatedCount,
    totalJoinedCount,
    filteredCount,
    completedAttempts,
    accessRecords,
  ] = await Promise.all([
    // 1. Total Quizzes in library
    prisma.quizAccess.count({ where: libraryWhere }),

    // 2. Created by user
    prisma.quizAccess.count({ where: { ...libraryWhere, role: "OWNER" } }),

    // 3. Joined by user
    prisma.quizAccess.count({ where: { ...libraryWhere, role: { not: "OWNER" } } }),

    // 4. Filtered count for active tab (for totalPages calculation)
    prisma.quizAccess.count({ where: baseWhere }),

    // 5. Aggregate completed attempts for overall accuracy
    prisma.attempt.findMany({
      where: { userId, completedAt: { not: null } },
      select: {
        score: true,
        quiz: {
          select: {
            _count: { select: { questions: true } },
          },
        },
      },
    }),

    // 6. Paginated 9 rows for the current view
    prisma.quizAccess.findMany({
      where: baseWhere,
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        quiz: {
          include: {
            _count: {
              select: { questions: true },
            },
            attempts: {
              where: { userId, completedAt: { not: null } },
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
    }),
  ]);

  // Compute lifetime accuracy percentage across all completed attempts
  let totalScoreSum = 0;
  let totalQuestionsEvaluated = 0;
  completedAttempts.forEach((a) => {
    totalScoreSum += a.score;
    totalQuestionsEvaluated += a.quiz._count.questions;
  });
  const avgAccuracy =
    totalQuestionsEvaluated > 0
      ? Math.round((totalScoreSum / totalQuestionsEvaluated) * 100)
      : 0;

  const totalPages = Math.ceil(filteredCount / PAGE_SIZE) || 1;

  const stats: DashboardStats = {
    totalQuizzes: totalQuizzesCount,
    totalCreated: totalCreatedCount,
    totalJoined: totalJoinedCount,
    totalAttempts: completedAttempts.length,
    avgAccuracy,
  };

  const pagination: DashboardPagination = {
    currentPage: Math.min(currentPage, totalPages),
    totalPages,
    activeTab,
  };

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
      isDailyQuiz: quiz.isDailyQuiz,
      isPublic: quiz.isPublic,
      questionCount,
      attemptsCount: attempts.length,
      bestScore,
      latestAttemptScore: latestAttempt ? latestAttempt.score : null,
      latestAttemptId: latestAttempt ? latestAttempt.id : null,
    };
  });

  return (
    <DashboardQuizGrid
      quizzes={quizItems}
      userFirstName={userFirstName}
      stats={stats}
      pagination={pagination}
    />
  );
}
