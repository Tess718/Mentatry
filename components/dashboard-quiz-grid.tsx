"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CopyJoinCodeButton } from "@/components/copy-join-code-button";
import { DeleteQuizButton } from "@/components/delete-quiz-button";
import { HostLiveButton } from "@/components/host-live-button";
import { ToggleVisibilityButton } from "@/components/toggle-visibility-button";
import {
  Play,
  BarChart3,
  Trophy,
  History,
  Layers,
  Sparkles,
  Filter,
  BookOpen,
  Timer,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export interface DashboardQuizItem {
  id: string;
  title: string;
  sourceType: "TOPIC" | "TEXT" | "MANUAL";
  difficulty: string;
  status: string;
  timeLimitMinutes: number | null;
  joinCode: string | null;
  createdAt: string;
  isOwner: boolean;
  questionCount: number;
  attemptsCount: number;
  bestScore: number;
  latestAttemptScore: number | null;
  latestAttemptId: string | null;
  isDailyQuiz: boolean;
  isPublic: boolean;
}

const PAGE_SIZE = 9;

export function DashboardQuizGrid({
  quizzes,
  userFirstName,
}: {
  quizzes: DashboardQuizItem[];
  userFirstName: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read view state from URL search parameters
  const tabParam = (searchParams.get("tab") || "all").toLowerCase();
  const activeTab: "ALL" | "OWNER" | "JOINED" =
    tabParam === "owner" ? "OWNER" : tabParam === "joined" ? "JOINED" : "ALL";

  const rawPage = parseInt(searchParams.get("page") || "1", 10);
  const currentPage = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  // Derived metric statistics across full user library (0ms, cached in memory)
  const totalCreated = useMemo(() => quizzes.filter((q) => q.isOwner).length, [quizzes]);
  const totalJoined = useMemo(() => quizzes.filter((q) => !q.isOwner).length, [quizzes]);
  const totalAttempts = useMemo(() => quizzes.reduce((sum, q) => sum + q.attemptsCount, 0), [quizzes]);

  const avgAccuracy = useMemo(() => {
    let totalScoreSum = 0;
    let totalQuestionsEvaluated = 0;
    quizzes.forEach((q) => {
      if (q.latestAttemptScore !== null && q.questionCount > 0) {
        totalScoreSum += q.bestScore;
        totalQuestionsEvaluated += q.questionCount;
      }
    });
    return totalQuestionsEvaluated > 0 ? Math.round((totalScoreSum / totalQuestionsEvaluated) * 100) : 0;
  }, [quizzes]);

  // Derive visible quizzes based on URL active tab parameter instantly (0ms)
  const filteredQuizzes = useMemo(() => {
    switch (activeTab) {
      case "OWNER":
        return quizzes.filter((q) => q.isOwner);
      case "JOINED":
        return quizzes.filter((q) => !q.isOwner);
      default:
        return quizzes;
    }
  }, [quizzes, activeTab]);

  // Derive paginated slice (0ms, instant page flips)
  const totalPages = Math.ceil(filteredQuizzes.length / PAGE_SIZE) || 1;
  const activePage = Math.min(currentPage, totalPages);
  const paginatedQuizzes = useMemo(() => {
    return filteredQuizzes.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);
  }, [filteredQuizzes, activePage]);

  // Synchronize view state with URL parameters for bookmarking and back/forward navigation
  const updateUrl = (newTab: "ALL" | "OWNER" | "JOINED", newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newTab === "ALL") {
      params.delete("tab");
    } else {
      params.set("tab", newTab.toLowerCase());
    }

    if (newPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", newPage.toString());
    }

    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
  };

  const handleFilterChange = (newFilter: "ALL" | "OWNER" | "JOINED") => {
    updateUrl(newFilter, 1);
  };

  const handlePageChange = (targetPage: number) => {
    updateUrl(activeTab, targetPage);
  };

  return (
    <div className="space-y-8">
      {/* 4 Metric Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1: Total Active Quizzes */}
        <div className="neo-box-yellow rounded-2xl p-5 space-y-2 hover:-translate-y-1 transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-black">Total Quizzes</span>
            <div className="w-8 h-8 bg-white border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Layers className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-black">{quizzes.length}</div>
          <p className="text-[11px] font-bold text-slate-900">In your library</p>
        </div>

        {/* Metric 2: Created By Me */}
        <div className="neo-box-lime rounded-2xl p-5 space-y-2 hover:-translate-y-1 transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-black">Created by Me</span>
            <div className="w-8 h-8 bg-white border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-black">{totalCreated}</div>
          <p className="text-[11px] font-bold text-slate-900">AI & Manual Quizzes</p>
        </div>

        {/* Metric 3: Total Attempts */}
        <div className="neo-box-pink rounded-2xl p-5 space-y-2 hover:-translate-y-1 transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-black">Attempts Taken</span>
            <div className="w-8 h-8 bg-white border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <History className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-black">{totalAttempts}</div>
          <p className="text-[11px] font-bold text-slate-900">Completed test runs</p>
        </div>

        {/* Metric 4: Best Accuracy */}
        <div className="neo-box-cyan rounded-2xl p-5 space-y-2 hover:-translate-y-1 transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-black">Best Accuracy</span>
            <div className="w-8 h-8 bg-white border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Trophy className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-black">
            {totalAttempts > 0 ? `${avgAccuracy}%` : "N/A"}
          </div>
          <p className="text-[11px] font-bold text-slate-900">Average high score</p>
        </div>
      </div>

      {/* Filter Tabs Bar & Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-amber-400 stroke-[2.5]" />
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">Your Quiz Library</h2>
        </div>

        {/* Filter Buttons (Synced to URL Search Params with instant 0ms derivation) */}
        <div className="flex items-center gap-2 bg-slate-900 border-2 border-black p-1 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <button
            onClick={() => handleFilterChange("ALL")}
            className={`px-3 py-1.5 text-xs font-black uppercase rounded-lg transition-all cursor-pointer ${
              activeTab === "ALL"
                ? "bg-amber-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All ({quizzes.length})
          </button>
          <button
            onClick={() => handleFilterChange("OWNER")}
            className={`px-3 py-1.5 text-xs font-black uppercase rounded-lg transition-all cursor-pointer ${
              activeTab === "OWNER"
                ? "bg-lime-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Created ({totalCreated})
          </button>
          <button
            onClick={() => handleFilterChange("JOINED")}
            className={`px-3 py-1.5 text-xs font-black uppercase rounded-lg transition-all cursor-pointer ${
              activeTab === "JOINED"
                ? "bg-cyan-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Joined ({totalJoined})
          </button>
        </div>
      </div>

      {/* Quiz Card Grid */}
      {filteredQuizzes.length === 0 ? (
        <div className="py-12 neo-box bg-slate-900 border-3 border-black text-center p-8 space-y-4 rounded-3xl max-w-lg mx-auto">
          <div className="w-14 h-14 bg-amber-400 border-2 border-black rounded-2xl flex items-center justify-center mx-auto text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <Filter className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h3 className="text-xl font-black uppercase text-white tracking-tight">No Quizzes Found</h3>
          <p className="text-xs font-bold text-slate-400 max-w-sm mx-auto">
            {activeTab === "OWNER"
              ? "You haven't generated or created any quizzes yet. Try creating your first AI quiz!"
              : activeTab === "JOINED"
              ? "You haven't joined any quizzes with a code yet."
              : `Hey ${userFirstName}, generate your first AI quiz or join a room with a code!`}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link href="/quizzes/new" className="neo-btn neo-btn-pink text-sm">
              Generate AI Quiz
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedQuizzes.map((quiz) => {
              const hasAttempts = quiz.attemptsCount > 0;

              return (
                <div
                  key={quiz.id}
                  className="neo-box bg-white p-6 rounded-2xl flex flex-col justify-between space-y-5 hover:-translate-y-1 transition-transform shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div className="space-y-3">
                    {/* Top Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`neo-badge ${
                          quiz.difficulty === "easy"
                            ? "bg-lime-300 text-black"
                            : quiz.difficulty === "medium"
                            ? "bg-yellow-300 text-black"
                            : "bg-pink-300 text-black"
                        }`}
                      >
                        {quiz.difficulty}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`neo-badge ${
                            quiz.isOwner ? "bg-black text-white" : "bg-indigo-600 text-white"
                          }`}
                        >
                          {quiz.isOwner ? "OWNER" : "TAKER"}
                        </span>
                        {quiz.status === "DRAFT" && (
                          <span className="neo-badge bg-red-400 text-white">DRAFT</span>
                        )}
                      </div>
                    </div>

                    {/* Quiz Title */}
                    <h3 className="text-xl font-black uppercase text-black leading-snug line-clamp-2">
                      {quiz.title}
                    </h3>

                    {/* Metadata line */}
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700">
                      <span className="bg-slate-100 border-2 border-black px-2 py-0.5 rounded font-mono">
                        {quiz.questionCount} Questions
                      </span>
                      <span className="bg-slate-100 border-2 border-black px-2 py-0.5 rounded font-mono">
                        {quiz.sourceType}
                      </span>
                      {quiz.timeLimitMinutes && (
                        <span className="bg-amber-100 text-amber-900 border-2 border-amber-900 px-2 py-0.5 rounded font-mono flex items-center gap-1">
                          <Timer className="w-3 h-3" />
                          {quiz.timeLimitMinutes}m
                        </span>
                      )}
                    </div>

                    {/* Sharing & Access Bar (Join Code + Visibility on the same line) */}
                    {quiz.status === "PUBLISHED" && !quiz.isDailyQuiz && (
                      <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                        {quiz.joinCode ? (
                          <CopyJoinCodeButton joinCode={quiz.joinCode} />
                        ) : (
                          <div />
                        )}
                        {quiz.isOwner && (
                          <ToggleVisibilityButton quizId={quiz.id} initialIsPublic={quiz.isPublic} />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Past Attempt Stats */}
                  <div className="border-t-2 border-slate-200 pt-3 space-y-2 text-xs font-semibold">
                    {hasAttempts ? (
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 border-2 border-black rounded-xl text-slate-900">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-amber-500 shrink-0 stroke-[2.5]" />
                          <div>
                            <div className="text-[10px] uppercase text-slate-500 font-black">Best Score</div>
                            <div className="font-extrabold text-sm text-black">
                              {quiz.bestScore} / {quiz.questionCount}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <History className="w-4 h-4 text-indigo-500 shrink-0 stroke-[2.5]" />
                          <div>
                            <div className="text-[10px] uppercase text-slate-500 font-black">Latest</div>
                            <div className="font-extrabold text-sm text-black">
                              {quiz.latestAttemptScore} / {quiz.questionCount}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-50 border-2 border-amber-300 p-2.5 rounded-xl text-center text-amber-900 font-bold text-xs">
                        No attempts recorded yet
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="space-y-2 pt-2">
                    {/* Row 1: Primary Actions */}
                    {quiz.status === "DRAFT" ? (
                      <Link
                        href={`/quizzes/${quiz.id}/edit`}
                        className="neo-btn bg-slate-200 text-black border-2 border-black text-xs py-2.5 px-4 w-full flex items-center justify-center gap-2"
                      >
                        <span>CONTINUE EDITING</span>
                      </Link>
                    ) : (
                      <div className="flex gap-2">
                        <Link
                          href={`/quizzes/${quiz.id}/take`}
                          className="neo-btn neo-btn-lime text-xs py-2.5 px-4 flex-1 flex items-center justify-center gap-2"
                        >
                          <Play className="w-4 h-4 fill-black stroke-[2]" />
                          <span>TAKE</span>
                        </Link>
                        {quiz.isOwner && <HostLiveButton quizId={quiz.id} />}
                      </div>
                    )}

                    {/* Row 2: Secondary Actions (Results, Insights, Delete) */}
                    {quiz.isOwner && !hasAttempts && (
                      <div>
                        <DeleteQuizButton quizId={quiz.id} quizTitle={quiz.title} fullWidth />
                      </div>
                    )}

                    {hasAttempts && (
                      <div className="flex items-center gap-2">
                        {quiz.latestAttemptId && (
                          <Link
                            href={`/quizzes/${quiz.id}/results/${quiz.latestAttemptId}`}
                            className="neo-btn neo-btn-white text-xs py-2 px-3 flex-1 text-center font-black uppercase"
                            title="View Attempt Results"
                          >
                            Results
                          </Link>
                        )}

                        {quiz.isOwner && (
                          <>
                            <Link
                              href={`/quizzes/${quiz.id}/insights`}
                              className="neo-btn neo-btn-pink text-xs py-2 px-3"
                              title="Owner Insights"
                            >
                              <BarChart3 className="w-3.5 h-3.5 stroke-[3]" />
                            </Link>
                            <DeleteQuizButton quizId={quiz.id} quizTitle={quiz.title} />
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls (Derived instantly in 0ms with search params sync) */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6 border-t-2 border-slate-800">
              {/* Previous Page */}
              <button
                type="button"
                onClick={() => handlePageChange(Math.max(1, activePage - 1))}
                disabled={activePage <= 1}
                className={`neo-btn py-2 px-3 text-xs font-black uppercase flex items-center gap-1 cursor-pointer ${
                  activePage <= 1
                    ? "pointer-events-none opacity-40 bg-slate-800 text-slate-400 border-slate-700"
                    : "neo-btn-white"
                }`}
              >
                <ChevronLeft className="w-4 h-4 stroke-[3]" />
                <span>Prev</span>
              </button>

              {/* Page Indicators */}
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-300">
                <span className="bg-slate-900 border-2 border-black px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-white">
                  Page <strong className="text-amber-400">{activePage}</strong> of {totalPages}
                </span>
              </div>

              {/* Next Page */}
              <button
                type="button"
                onClick={() => handlePageChange(Math.min(totalPages, activePage + 1))}
                disabled={activePage >= totalPages}
                className={`neo-btn py-2 px-3 text-xs font-black uppercase flex items-center gap-1 cursor-pointer ${
                  activePage >= totalPages
                    ? "pointer-events-none opacity-40 bg-slate-800 text-slate-400 border-slate-700"
                    : "neo-btn-white"
                }`}
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
