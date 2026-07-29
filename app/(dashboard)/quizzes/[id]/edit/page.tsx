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

  if (quiz.ownerId !== session.user.id) {
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

  return (
    <div className="min-h-screen bg-neutral-50/50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <QuizEditor initialQuiz={plainQuiz} />
      </main>
    </div>
  );
}
