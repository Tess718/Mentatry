import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { CopyJoinCodeButton } from "@/components/copy-join-code-button";
import Avatar from "@/components/ui/avatar";
import { BarChart3, Users, Award, AlertTriangle, ArrowLeft, ShieldAlert } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function QuizOwnerInsightsPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const { id: quizId } = await params;

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { order: "asc" },
      },
      attempts: {
        include: {
          user: { select: { email: true, firstName: true, lastName: true } },
          answers: true,
        },
      },
    },
  });

  if (!quiz) {
    notFound();
  }

  // Authorization Check: Must be OWNER
  const isOwner = quiz.ownerId === userId;
  if (!isOwner) {
    return (
      <div className="max-w-md mx-auto py-12">
        <div className="neo-box p-8 bg-pink-100 border-red-600 text-center space-y-4">
          <div className="inline-flex p-3 bg-red-600 text-white">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black uppercase text-red-700">Access Denied</h1>
          <p className="text-sm font-semibold text-slate-800">
            Insights are restricted strictly to the quiz owner.
          </p>
          <Link href="/quizzes" className="neo-btn neo-btn-black text-xs py-2 px-4 inline-block">
            Return to My Quizzes
          </Link>
        </div>
      </div>
    );
  }

  // Aggregate Metrics Computation
  const totalAttempts = quiz.attempts.length;
  const uniqueTakers = new Set(quiz.attempts.map((a) => a.userId)).size;

  let averageScore = 0;
  let averagePercentage = 0;
  if (totalAttempts > 0) {
    const sumScores = quiz.attempts.reduce((acc, curr) => acc + curr.score, 0);
    averageScore = Math.round((sumScores / totalAttempts) * 10) / 10;
    averagePercentage = Math.round((averageScore / quiz.questions.length) * 100);
  }

  // Per-Question Miss Rate Analysis
  const questionStats = quiz.questions.map((q) => {
    let totalAnswered = 0;
    let missedCount = 0;

    quiz.attempts.forEach((attempt) => {
      const ans = attempt.answers.find((a) => a.questionId === q.id);
      if (ans) {
        totalAnswered++;
        if (!ans.isCorrect) {
          missedCount++;
        }
      }
    });

    const missRate = totalAnswered > 0 ? Math.round((missedCount / totalAnswered) * 100) : 0;

    return {
      question: q,
      totalAnswered,
      missedCount,
      missRate,
    };
  });

  const sortedByDifficulty = [...questionStats].sort((a, b) => b.missRate - a.missRate);

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link href="/quizzes" className="neo-btn neo-btn-white text-xs py-2 px-3 self-start">
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>Back to Quizzes</span>
        </Link>

        {quiz.joinCode && <CopyJoinCodeButton joinCode={quiz.joinCode} />}
      </div>

      {/* Header Banner */}
      <div className="neo-box p-8 bg-cyan-300 text-black space-y-2">
        <div className="inline-flex items-center gap-2 neo-badge bg-black text-white px-3 py-1 text-xs">
          <BarChart3 className="w-4 h-4 text-cyan-300" /> Owner Analytics & Insights
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight">{quiz.title}</h1>
        <p className="text-sm font-semibold text-slate-900">
          Aggregate performance statistics across all student attempt records.
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="neo-box p-6 bg-white space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-500">Total Attempts</span>
            <Award className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-3xl font-black text-black">{totalAttempts}</div>
          <p className="text-xs font-semibold text-slate-600">{uniqueTakers} unique student takers</p>
        </div>

        <div className="neo-box p-6 bg-white space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-500">Average Score</span>
            <BarChart3 className="w-5 h-5 text-cyan-600" />
          </div>
          <div className="text-3xl font-black text-black">
            {averageScore} <span className="text-base text-slate-500">/ {quiz.questions.length}</span>
          </div>
          <p className="text-xs font-semibold text-slate-600">{averagePercentage}% overall accuracy</p>
        </div>

        <div className="neo-box p-6 bg-white space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-500">Classroom Code</span>
            <Users className="w-5 h-5 text-pink-600" />
          </div>
          <div className="text-2xl font-black text-black font-mono tracking-wider">
            {quiz.joinCode || "NONE"}
          </div>
          <p className="text-xs font-semibold text-slate-600">Share code for student access</p>
        </div>
      </div>

      {/* Per-Question Miss Rate Breakdown */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">Question Miss Rate Analysis</h2>
          <p className="text-sm font-semibold text-slate-300">
            Questions ordered by highest miss rate to identify topic gaps.
          </p>
        </div>

        {totalAttempts === 0 ? (
          <div className="neo-box p-8 bg-white text-center text-slate-600 font-semibold italic">
            No user attempts submitted yet. Share the join code to start collecting student performance insights.
          </div>
        ) : (
          <div className="space-y-4">
            {sortedByDifficulty.map((stat) => {
              const isHighMiss = stat.missRate >= 50;

              return (
                <div
                  key={stat.question.id}
                  className={`neo-box p-6 bg-white space-y-4 ${
                    isHighMiss ? "border-l-8 border-l-pink-500" : "border-l-8 border-l-lime-500"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="neo-badge bg-black text-white">Question #{stat.question.order}</span>

                    <span
                      className={`neo-badge ${
                        isHighMiss ? "bg-pink-300 text-black" : "bg-lime-300 text-black"
                      }`}
                    >
                      {stat.missRate}% Miss Rate
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                    {stat.question.text}
                  </h3>

                  {/* Miss Rate Visual Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600">
                        Missed {stat.missedCount} out of {stat.totalAnswered} times
                      </span>
                      {isHighMiss && (
                        <span className="text-pink-600 font-black flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> High Difficulty Question
                        </span>
                      )}
                    </div>
                    <div className="w-full h-3 border-2 border-black bg-slate-100 p-0.5">
                      <div
                        className={`h-full border-r border-black ${
                          isHighMiss ? "bg-pink-500" : "bg-lime-400"
                        }`}
                        style={{ width: `${stat.missRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Student Attempts List */}
      {totalAttempts > 0 && (
        <div className="neo-box p-6 bg-white space-y-4">
          <h3 className="text-xl font-black uppercase text-black">Recent Student Attempts</h3>
          <div className="divide-y-2 divide-slate-100">
            {quiz.attempts.map((att) => {
              const name = att.user.firstName
                ? `${att.user.firstName} ${att.user.lastName || ""}`
                : att.user.email;

              return (
                <div key={att.id} className="py-3 flex items-center justify-between gap-4 text-sm font-semibold">
                  <div className="flex items-center gap-3">
                    <Avatar seed={att.user.email} size={36} />
                    <div>
                      <div className="font-extrabold text-black">{name}</div>
                      <div className="text-xs text-slate-500">
                        {new Date(att.completedAt).toLocaleDateString()} at{" "}
                        {new Date(att.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>

                  <div className="neo-badge bg-yellow-300 text-black">
                    {att.score} / {quiz.questions.length} ({Math.round((att.score / quiz.questions.length) * 100)}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
