"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Search, X, Compass } from "lucide-react";

interface ExploreHeroProps {
  totalCount: number;
}

export function ExploreHero({ totalCount }: ExploreHeroProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQuery = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(currentQuery);

  // Debounced search query update
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== currentQuery) {
        const params = new URLSearchParams(searchParams.toString());
        if (searchTerm.trim()) {
          params.set("q", searchTerm.trim());
        } else {
          params.delete("q");
        }
        params.delete("page");
        startTransition(() => {
          router.push(`${pathname}?${params.toString()}`, { scroll: false });
        });
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [searchTerm, currentQuery, pathname, router, searchParams]);

  // Keep local searchTerm in sync if URL changes
  useEffect(() => {
    setSearchTerm(currentQuery);
  }, [currentQuery]);

  const clearSearch = () => {
    setSearchTerm("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const scrollToFilters = () => {
    const filtersElement = document.getElementById("quiz-filters");
    if (filtersElement) {
      filtersElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full">
      {/* Master Neo-Brutalist Split Container */}
      <motion.div
        initial={{ opacity: 0, y: 22, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full bg-white border-3 sm:border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col lg:flex-row items-stretch select-none"
      >
        {/* ========================================================
            LEFT COLUMN (58%): Editorial, Stitched Badge & Search
            ======================================================== */}
        <div className="p-6 sm:p-10 lg:p-12 lg:w-[58%] flex flex-col justify-between space-y-6 bg-white text-black">
          {/* Top Status Tag */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 20, delay: 0.08 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-300 border-2 border-black rounded-lg text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Sparkles className="w-3.5 h-3.5 fill-black" />
              <span>Public Quiz Library</span>
            </div>
          </motion.div>

          {/* Primary Headline with Brand Stitched Tag */}
          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-black leading-none">
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.12 }}
                className="inline-block"
              >
                EXPLORE
              </motion.span>
              <br />
              <motion.span
                initial={{ opacity: 0, scale: 0.75, rotate: 6 }}
                animate={{ opacity: 1, scale: 1, rotate: -1.5 }}
                transition={{ type: "spring", stiffness: 350, damping: 18, delay: 0.2 }}
                whileHover={{ rotate: 1, scale: 1.05 }}
                className="stitched-tag stitched-tag-cyan my-1.5 inline-block cursor-default"
              >
                COMMUNITY
              </motion.span>{" "}
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.22 }}
                className="inline-block"
              >
                QUIZZES
              </motion.span>
            </h1>

            {/* Platform Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.26 }}
              className="text-sm sm:text-base font-bold text-slate-700 leading-relaxed max-w-lg"
            >
              Discover interactive quizzes created by students, educators, and
              curious learners worldwide. Search below or filter by topic.
            </motion.p>
          </div>

          {/* Integrated Search Input directly inside Hero */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.32 }}
            className="pt-1"
          >
            <div className="relative flex items-center bg-slate-50 border-3 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-within:shadow-[6px_6px_0px_0px_#facc15] focus-within:border-black transition-all">
              <div className="pl-4 pr-2 text-slate-500 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by topic, keyword, or title (e.g. Biology, Space, JavaScript)..."
                className="w-full bg-transparent text-black placeholder-slate-500 text-sm sm:text-base font-bold py-3.5 pr-10 focus:outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3.5 p-1 rounded-lg text-slate-500 hover:text-black hover:bg-slate-200 transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4 stroke-[3]" />
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* ========================================================
            RIGHT COLUMN (42%): Mentatry Cyan Panel with Tilted Card
            ======================================================== */}
        <div className="lg:w-[42%] bg-[#38bdf8] border-t-4 lg:border-t-0 lg:border-l-4 border-black p-8 sm:p-12 flex items-center justify-center relative overflow-hidden min-h-[280px] sm:min-h-[340px]">
          {/* Subtle Grid Pattern Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-15"
            style={{
              backgroundImage:
                "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Tilted Yellow Neo-Brutalist Statement Card (Drop & Slap Elastic Bounce) */}
          <motion.div
            initial={{ opacity: 0, y: -60, rotate: 8, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, rotate: -2.5, scale: 1 }}
            whileHover={{
              rotate: 0,
              scale: 1.04,
              boxShadow: "14px 14px 0px 0px rgba(0,0,0,1)",
            }}
            whileTap={{ scale: 0.98, rotate: -1 }}
            transition={{
              type: "spring",
              stiffness: 240,
              damping: 16,
              delay: 0.22,
            }}
            className="w-full max-w-[280px] sm:max-w-[320px] aspect-[4/3] bg-[#facc15] border-3 sm:border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-5 sm:p-6 flex flex-col justify-between items-center text-center cursor-pointer select-none relative z-10"
            onClick={scrollToFilters}
          >
            {/* Card Header Micro-Tag */}
            <div className="w-full flex items-center justify-between border-b-2 border-black pb-2 text-xs font-black uppercase text-black">
              <span className="flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                <span>Community Spotlight</span>
              </span>
            </div>

            {/* Central Quiz Counter */}
            <div className="py-2 text-center space-y-0.5">
              <div className="text-5xl sm:text-6xl font-black text-black tracking-tight leading-none">
                {totalCount}
              </div>
              <div className="text-xs sm:text-sm font-black uppercase text-black/80 tracking-wide">
                Public Quizzes
              </div>
            </div>

            {/* Card Footer Status Badge */}
            <div className="w-full pt-2 border-t-2 border-black flex items-center justify-between text-xs font-bold text-black">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>Solo & Live Rooms</span>
              </span>
              <span className="font-black text-black flex items-center gap-0.5">
                Jump In ↗
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
