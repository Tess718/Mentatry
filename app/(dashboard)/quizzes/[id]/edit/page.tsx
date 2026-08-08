import { Suspense } from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { QuizEditor } from "@/components/quiz-editor";

export default async function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  return (
    <div className="min-h-screen bg-neutral-50/50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Suspense fallback={<EditQuizSkeleton />}>
          <AsyncQuizEditor id={id} userId={session.user.id} />
        </Suspense>
      </main>
    </div>
  );
}

function EditQuizSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-48 bg-slate-200 rounded" />
      <div className="neo-box p-8 bg-white space-y-4">
        <div className="h-6 w-1/3 bg-slate-200 rounded" />
        <div className="h-10 w-full bg-slate-200 rounded" />
      </div>
      <div className="neo-box p-8 bg-white space-y-4">
        <div className="h-24 w-full bg-slate-200 rounded" />
        <div className="h-24 w-full bg-slate-200 rounded" />
      </div>
    </div>
  );
}

async function AsyncQuizEditor({ id, userId }: { id: string; userId: string }) {
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!quiz) {
    notFound();
  }

  if (quiz.ownerId !== userId) {
    redirect("/quizzes");
  }

  // Convert to plain object for the client component
  const plainQuiz = {
    id: quiz.id,
    title: quiz.title,
    difficulty: quiz.difficulty,
    timeLimitMinutes: quiz.timeLimitMinutes,
    status: quiz.status,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      text: q.text,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
    })),
  };

  return <QuizEditor initialQuiz={plainQuiz} />;
}
