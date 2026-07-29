import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { QuizCreateTabs } from "@/components/quiz-create-tabs";

export default async function NewQuizPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-black uppercase tracking-tight text-white">Create New Quiz</h1>
        <p className="text-sm font-semibold text-slate-300">
          Generate an instant AI quiz or build custom questions manually
        </p>
      </div>

      <QuizCreateTabs />
    </div>
  );
}
