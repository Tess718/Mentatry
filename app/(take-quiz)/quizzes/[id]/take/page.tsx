import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { QuizTaker } from "@/components/quiz-taker";
import { redis } from "@/lib/redis";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TakeQuizPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id: quizId } = await params;

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!quiz || quiz.questions.length === 0) {
    notFound();
  }

  const sanitizedQuestions = quiz.questions.map((q) => ({
    id: q.id,
    text: q.text,
    options: q.options,
    order: q.order,
  }));

  // Track start time securely on the server
  if (quiz.timeLimitMinutes && redis) {
    const key = `solo:${session.user.id}:${quiz.id}`;
    // nx: true ensures we don't overwrite if they just refreshed the page
    await redis.set(key, Date.now(), { nx: true, ex: 60 * 60 * 24 });
  }

  return (
    <div className="max-w-7xl w-full mx-auto p-4 sm:p-8">
      <QuizTaker
        quizId={quiz.id}
        quizTitle={quiz.title}
        difficulty={quiz.difficulty}
        timeLimitMinutes={quiz.timeLimitMinutes}
        questions={sanitizedQuestions}
      />
    </div>
  );
}
