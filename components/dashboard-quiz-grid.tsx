"use client";

import { useState } from "react";
import Link from "next/link";
import { CopyJoinCodeButton } from "@/components/copy-join-code-button";
import { DeleteQuizButton } from "@/components/delete-quiz-button";
import { HostLiveButton } from "@/components/host-live-button";
import { Play, BarChart3, Trophy, History, Layers, Sparkles, Filter, CheckCircle2, UserCheck, BookOpen, Timer } from "lucide-react";

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
}

export function DashboardQuizGrid({
  quizzes,
  userFirstName,
}: {
  quizzes: DashboardQuizItem[];
  userFirstName: string;
}) {
  const [filter, setFilter] = useState<"ALL" | "OWNER" | "JOINED">("ALL");

  const filteredQuizzes = quizzes.filter((q) => {
    if (filter === "OWNER") return q.isOwner;
    if (filter === "JOINED") return !q.isOwner;
    return true;
  });

  const totalCreated = quizzes.filter((q) => q.isOwner).length;
  const totalJoined = quizzes.filter((q) => !q.isOwner).length;
  const totalAttempts = quizzes.reduce((sum, q) => sum + q.attemptsCount, 0);
  
  // Calculate overall average accuracy percentage across all completed attempts
  let totalScoreSum = 0;
  let totalQuestionsEvaluated = 0;
  quizzes.forEach((q) => {
    if (q.latestAttemptScore !== null && q.questionCount > 0) {
      totalScoreSum += q.bestScore;
      totalQuestionsEvaluated += q.questionCount;
    }
  });
  const avgAccuracy = totalQuestionsEvaluated > 0 ? Math.round((totalScoreSum / totalQuestionsEvaluated) * 100) : 0;

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

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 bg-slate-900 border-2 border-black p-1 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 text-xs font-black uppercase rounded-lg transition-all ${
              filter === "ALL"
                ? "bg-amber-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All ({quizzes.length})
          </button>
          <button
            onClick={() => setFilter("OWNER")}
            className={`px-3 py-1.5 text-xs font-black uppercase rounded-lg transition-all ${
              filter === "OWNER"
                ? "bg-lime-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Created ({totalCreated})
          </button>
          <button
            onClick={() => setFilter("JOINED")}
            className={`px-3 py-1.5 text-xs font-black uppercase rounded-lg transition-all ${
              filter === "JOINED"
                ? "bg-pink-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Joined ({totalJoined})
          </button>
        </div>
      </div>

      {/* Quizzes List Grid */}
      {filteredQuizzes.length === 0 ? (
        <div className="neo-box p-12 text-center bg-white space-y-4 max-w-lg mx-auto rounded-2xl">
          <div className="inline-flex p-4 bg-cyan-200 border-2 border-black rounded-xl">
            <Layers className="w-10 h-10 text-black" />
          </div>
          <h2 className="text-2xl font-black uppercase text-black">No Quizzes Found</h2>
          <p className="text-sm font-semibold text-slate-600">
            {filter === "OWNER"
              ? "You haven't generated or created any quizzes yet. Try creating your first AI quiz!"
              : filter === "JOINED"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => {
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

                  {/* Join Code Display */}
                  {quiz.joinCode && quiz.status === "PUBLISHED" && (
                    <div className="pt-1">
                      <CopyJoinCodeButton joinCode={quiz.joinCode} />
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
                  {(hasAttempts || quiz.isOwner) && (
                    <div className="flex items-center gap-2">
                      {hasAttempts && quiz.latestAttemptId && (
                        <Link
                          href={`/quizzes/${quiz.id}/results/${quiz.latestAttemptId}`}
                          className="neo-btn neo-btn-white text-xs py-2 px-3 flex-1 text-center"
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
      )}
    </div>
  );
}
