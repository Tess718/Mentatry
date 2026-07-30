import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Trophy, CheckCircle, XCircle, RotateCcw, LayoutDashboard, HelpCircle } from "lucide-react";
import { AchievementToast } from "@/components/achievement-toast";

interface PageProps {
  params: Promise<{ id: string; attemptId: string }>;
}

export default async function QuizResultsPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id: quizId, attemptId } = await params;

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: {
        include: {
          questions: {
            orderBy: { order: "asc" },
          },
        },
      },
      user: {
        select: { firstName: true, email: true }
      },
      answers: true,
    },
  });

  if (!attempt || attempt.quizId !== quizId) {
    notFound();
  }

  const isTaker = attempt.userId === session.user.id;
  const isOwner = attempt.quiz.ownerId === session.user.id;

  if (!isTaker && !isOwner) {
    return (
      <div className="max-w-md mx-auto py-12">
        <div className="neo-box p-8 bg-pink-100 border-red-600 text-center space-y-4">
          <h1 className="text-2xl font-black uppercase text-red-700">Access Denied</h1>
          <p className="text-sm font-semibold text-slate-800">
            You do not have permission to view this attempt record.
          </p>
          <Link href="/quizzes" className="neo-btn neo-btn-black text-xs py-2 px-4 inline-block">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const quiz = attempt.quiz;
  const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);
  const takerName = attempt.user.firstName || attempt.user.email.split("@")[0];

  let backLink = "/quizzes";
  let backText = "Back to My Quizzes";

  if (!isTaker && isOwner) {
    if (attempt.roomId) {
      backLink = `/rooms/${attempt.roomId}/summary`;
      backText = "Back to Room Summary";
    } else {
      backLink = `/quizzes/${quizId}/insights`;
      backText = "Back to Insights";
    }
  }

  // Map answers by questionId for fast lookup
  const answersMap = new Map(attempt.answers.map((a) => [a.questionId, a]));

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      <AchievementToast />
      
      {/* Score Header Card */}
      <div className="neo-box p-8 bg-yellow-300 text-black flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 neo-badge bg-black text-white px-3 py-1 text-xs">
            <Trophy className="w-4 h-4 text-yellow-400" /> Score Breakdown
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">{quiz.title}</h1>
          <p className="text-sm font-bold text-slate-900">
            {!isTaker && <span className="mr-2 text-indigo-700">Participant: {takerName} •</span>}
            Completed on {new Date(attempt.completedAt).toLocaleDateString()} at{" "}
            {new Date(attempt.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>

        {/* Score Circle Badge */}
        <div className="neo-box bg-white p-6 text-center shrink-0 min-w-44 space-y-1">
          <div className="text-xs font-black uppercase text-slate-500">{isTaker ? "Your Score" : "Score"}</div>
          <div className="text-4xl font-black text-black">
            {attempt.score} <span className="text-xl text-slate-500 font-bold">/ {attempt.totalQuestions}</span>
          </div>
          <div className="inline-block neo-badge bg-lime-300 text-black px-2.5 py-0.5 text-sm font-black">
            {percentage}%
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href={backLink} className="neo-btn neo-btn-white text-sm">
          <LayoutDashboard className="w-4 h-4 stroke-[3]" />
          <span>{backText}</span>
        </Link>

        {isTaker && (
          <Link href={`/quizzes/${quizId}/take`} className="neo-btn neo-btn-lime text-sm">
            <RotateCcw className="w-4 h-4 stroke-[3]" />
            <span>Retake Quiz</span>
          </Link>
        )}
      </div>

      {/* Per-Question Detailed Review */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2 text-white">
          <span>Question-by-Question Review</span>
        </h2>

        {quiz.questions.map((question, idx) => {
          const userAns = answersMap.get(question.id);
          const selectedIdx = userAns?.selectedIndex ?? -1;
          const isCorrect = userAns?.isCorrect ?? false;

          return (
            <div
              key={question.id}
              className={`neo-box p-6 bg-white space-y-4 ${
                isCorrect ? "border-l-8 border-l-lime-500" : "border-l-8 border-l-pink-500"
              }`}
            >
              {/* Question Banner */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="neo-badge bg-black text-white">Question #{idx + 1}</span>
                {isCorrect ? (
                  <span className="neo-badge bg-lime-300 text-black flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Correct
                  </span>
                ) : (
                  <span className="neo-badge bg-pink-300 text-black flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Incorrect
                  </span>
                )}
              </div>

              {/* Question Text */}
              <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
                {question.text}
              </h3>

              {/* Options Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {question.options.map((optText, optIdx) => {
                  const isSelected = selectedIdx === optIdx;
                  const isCorrectOption = question.correctIndex === optIdx;

                  let optionStyle = "bg-slate-50 border-2 border-black text-slate-900";
                  if (isCorrectOption) {
                    optionStyle = "bg-lime-200 border-3 border-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]";
                  } else if (isSelected && !isCorrect) {
                    optionStyle = "bg-pink-200 border-3 border-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]";
                  }

                  return (
                    <div key={optIdx} className={`p-3 text-sm flex items-start gap-2.5 ${optionStyle}`}>
                      <span className="w-6 h-6 flex items-center justify-center font-black text-xs border border-black bg-white shrink-0">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <div className="flex-1 leading-snug text-slate-900">
                        <span>{optText}</span>
                        {isSelected && (
                          <span className="ml-2 text-[10px] uppercase font-black px-1.5 py-0.5 bg-black text-white inline-block">
                            {isTaker ? "Your Pick" : "Their Pick"}
                          </span>
                        )}
                        {isCorrectOption && (
                          <span className="ml-2 text-[10px] uppercase font-black px-1.5 py-0.5 bg-lime-600 text-white inline-block">
                            Correct Answer
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation Box */}
              {question.explanation && (
                <div className="bg-cyan-50 border-2 border-black p-3.5 text-xs text-slate-800 space-y-1">
                  <div className="font-extrabold uppercase text-cyan-900 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-cyan-700" /> Explanation
                  </div>
                  <p className="font-medium leading-relaxed">{question.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
