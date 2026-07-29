import { QuizTakerSkeleton } from "@/components/dashboard-skeletons";

export default function TakeQuizLoading() {
  return (
    <div className="max-w-7xl w-full mx-auto p-4 sm:p-8">
      <QuizTakerSkeleton />
    </div>
  );
}
