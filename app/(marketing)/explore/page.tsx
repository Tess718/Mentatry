import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ExploreFilters } from "@/components/explore-filters";
import { ExploreQuizCard } from "@/components/explore-quiz-card";
import { PlusCircle, ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";
import {
  MotionHero,
  MotionSection,
  MotionStaggerContainer,
  MotionStaggerItem,
} from "@/components/motion/motion-wrappers";

export const metadata: Metadata = {
  title: "Explore Community Quizzes | Mentatry",
  description: "Browse, search, and play interactive community-created quizzes across coding, science, history, trivia, and more on Mentatry.",
};

const PAGE_SIZE = 12;

interface PageProps {
  searchParams: Promise<{
    q?: string;
    difficulty?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function ExplorePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = await auth();

  const query = params.q?.trim() || "";
  const difficulty = params.difficulty?.toLowerCase() || "all";
  const sort = params.sort?.toLowerCase() || "popular";
  const currentPage = Math.max(1, parseInt(params.page || "1", 10) || 1);

  // Build Prisma where clause: only show published quizzes marked as public
  const where: any = {
    status: "PUBLISHED",
    isPublic: true,
    isDailyQuiz: false,
  };

  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { sourceContent: { contains: query, mode: "insensitive" } },
    ];
  }

  if (difficulty && difficulty !== "all" && ["easy", "medium", "hard"].includes(difficulty)) {
    where.difficulty = difficulty;
  }

  // Build Prisma orderBy clause
  let orderBy: any = [{ createdAt: "desc" }];

  if (sort === "popular") {
    orderBy = [{ attempts: { _count: "desc" } }, { createdAt: "desc" }];
  } else if (sort === "newest") {
    orderBy = [{ createdAt: "desc" }];
  }

  const [totalCount, quizzes] = await Promise.all([
    prisma.quiz.count({ where }),
    prisma.quiz.findMany({
      where,
      orderBy,
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        difficulty: true,
        sourceType: true,
        sourceContent: true,
        timeLimitMinutes: true,
        joinCode: true,
        isDailyQuiz: true,
        createdAt: true,
        owner: {
          select: {
            firstName: true,
            email: true,
          },
        },
        _count: {
          select: {
            questions: true,
            attempts: true,
          },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

  // Pagination helper function
  const createPageUrl = (targetPage: number) => {
    const urlParams = new URLSearchParams();
    if (query) urlParams.set("q", query);
    if (difficulty !== "all") urlParams.set("difficulty", difficulty);
    if (sort !== "popular") urlParams.set("sort", sort);
    if (targetPage > 1) urlParams.set("page", targetPage.toString());
    const paramStr = urlParams.toString();
    return `/explore${paramStr ? `?${paramStr}` : ""}`;
  };

  return (
    <div className="py-8 space-y-10">
      {/* Header Banner */}
      <MotionHero className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-none">
          Explore Quizzes
        </h1>

        <p className="text-slate-400 font-bold text-sm sm:text-base max-w-xl mx-auto">
          Discover, play, and host interactive quizzes created by the Mentatry community. Pick a topic and test your skills!
        </p>
      </MotionHero>

      {/* Filter and Search Bar */}
      <MotionSection className="w-full">
        <ExploreFilters totalCount={totalCount} />
      </MotionSection>

      {/* Quiz Grid with Staggered Cascading Animation */}
      {quizzes.length > 0 ? (
        <MotionStaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.06}>
          {quizzes.map((quiz) => (
            <MotionStaggerItem key={quiz.id} className="h-full">
              <ExploreQuizCard
                quiz={quiz}
                isLoggedIn={!!session?.user}
                currentUserId={session?.user?.id}
              />
            </MotionStaggerItem>
          ))}
        </MotionStaggerContainer>
      ) : (
        /* Empty State */
        <MotionSection className="py-12 max-w-md mx-auto text-center space-y-6">
          <div className="neo-box p-8 bg-slate-900 border-3 border-black space-y-4 text-center">
            <div className="w-14 h-14 bg-amber-400 border-2 border-black rounded-2xl flex items-center justify-center mx-auto text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <HelpCircle className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h3 className="text-xl font-black uppercase text-white tracking-tight">No Quizzes Found</h3>
            <p className="text-xs font-bold text-slate-400 leading-relaxed">
              No published quizzes matched your search filters. Try clearing your search or create the first one!
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/explore" className="neo-btn neo-btn-white text-xs py-2 px-4 w-full sm:w-auto">
                Clear Filters
              </Link>
              <Link href="/quizzes/new" className="neo-btn neo-btn-lime text-xs py-2 px-4 w-full sm:w-auto flex items-center justify-center gap-1.5">
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Create Quiz</span>
              </Link>
            </div>
          </div>
        </MotionSection>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <MotionSection className="flex items-center justify-center gap-3 pt-6 border-t border-slate-800">
          {/* Previous Page */}
          <Link
            href={createPageUrl(currentPage - 1)}
            aria-disabled={currentPage <= 1}
            tabIndex={currentPage <= 1 ? -1 : undefined}
            className={`neo-btn py-2 px-3 text-xs font-black uppercase flex items-center gap-1 ${
              currentPage <= 1
                ? "pointer-events-none opacity-40 bg-slate-800 text-slate-400 border-slate-700"
                : "neo-btn-white"
            }`}
          >
            <ChevronLeft className="w-4 h-4 stroke-[3]" />
            <span>Prev</span>
          </Link>

          {/* Page Indicators */}
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-300">
            <span className="bg-slate-900 border-2 border-black px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              Page <strong className="text-amber-400">{currentPage}</strong> of {totalPages}
            </span>
          </div>

          {/* Next Page */}
          <Link
            href={createPageUrl(currentPage + 1)}
            aria-disabled={currentPage >= totalPages}
            tabIndex={currentPage >= totalPages ? -1 : undefined}
            className={`neo-btn py-2 px-3 text-xs font-black uppercase flex items-center gap-1 ${
              currentPage >= totalPages
                ? "pointer-events-none opacity-40 bg-slate-800 text-slate-400 border-slate-700"
                : "neo-btn-white"
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </Link>
        </MotionSection>
      )}
    </div>
  );
}
