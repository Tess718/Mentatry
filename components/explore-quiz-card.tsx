import Link from "next/link";
import { Timer, Users, Play, Sparkles, HelpCircle, ArrowRight } from "lucide-react";
import { HostLiveButton } from "@/components/host-live-button";

export interface ExploreQuizItem {
  id: string;
  title: string;
  difficulty: string;
  sourceType: string;
  sourceContent?: string | null;
  timeLimitMinutes: number | null;
  joinCode?: string | null;
  isDailyQuiz: boolean;
  createdAt: Date;
  owner: {
    firstName: string | null;
    email: string;
  };
  _count: {
    questions: number;
    attempts: number;
  };
}

export function ExploreQuizCard({
  quiz,
  isLoggedIn,
  currentUserId,
}: {
  quiz: ExploreQuizItem;
  isLoggedIn: boolean;
  currentUserId?: string;
}) {
  const creatorName = quiz.owner.firstName || quiz.owner.email.split("@")[0] || "Community";
  const isOwner = currentUserId ? currentUserId === quiz.id : false;

  const difficultyBg =
    quiz.difficulty === "easy"
      ? "bg-lime-300 text-black"
      : quiz.difficulty === "medium"
      ? "bg-yellow-300 text-black"
      : "bg-pink-400 text-black";

  const cardBorderAccent =
    quiz.difficulty === "easy"
      ? "hover:border-lime-400"
      : quiz.difficulty === "medium"
      ? "hover:border-yellow-400"
      : "hover:border-pink-400";

  const playUrl = `/quizzes/${quiz.id}/take`;

  return (
    <div className="neo-box p-6 bg-white text-black border-3 border-black rounded-2xl flex flex-col justify-between space-y-6 transition-all duration-150 hover:-translate-y-1.5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      {/* Card Top: Badges & Stats */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`neo-badge ${difficultyBg} text-[11px] font-black uppercase px-2.5 py-0.5`}>
              {quiz.difficulty}
            </span>
            <span className="neo-badge bg-slate-100 text-black border border-black text-[11px] font-black uppercase px-2 py-0.5">
              {quiz._count.questions} Questions
            </span>
          </div>

          {quiz._count.attempts > 0 ? (
            <span className="text-[11px] font-black text-black flex items-center gap-1 bg-amber-200 border-2 border-black px-2 py-0.5 rounded-lg shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              🔥 {quiz._count.attempts} {quiz._count.attempts === 1 ? "Play" : "Plays"}
            </span>
          ) : (
            <span className="text-[11px] font-black text-black flex items-center gap-1 bg-lime-200 border-2 border-black px-2 py-0.5 rounded-lg shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              <Sparkles className="w-3 h-3 text-emerald-800" /> New
            </span>
          )}
        </div>

        {/* Title & Creator */}
        <div className="space-y-1.5">
          <h3 className="text-xl font-black text-black uppercase tracking-tight line-clamp-2 leading-tight">
            {quiz.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold text-slate-600">
            <span>By <strong className="text-black font-extrabold">{creatorName}</strong></span>
            <span>•</span>
            {quiz.timeLimitMinutes ? (
              <span className="flex items-center gap-1 text-slate-800">
                <Timer className="w-3.5 h-3.5" /> {quiz.timeLimitMinutes} mins
              </span>
            ) : (
              <span className="text-slate-500">No time limit</span>
            )}
          </div>
        </div>
      </div>

      {/* Card Bottom: Action Buttons */}
      <div className="space-y-2.5 pt-3 border-t-2 border-slate-200">
        <div className="flex items-center gap-2.5">
          {/* Main Play Button */}
          <Link
            href={playUrl}
            className="neo-btn neo-btn-lime text-xs py-2.5 px-4 font-black uppercase flex-1 flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <Play className="w-3.5 h-3.5 fill-black stroke-[2]" />
            <span>Play Solo</span>
          </Link>

          {/* Host Live Room (If user is logged in) */}
          {isLoggedIn ? (
            <HostLiveButton quizId={quiz.id} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
