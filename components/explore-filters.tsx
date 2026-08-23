"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, SlidersHorizontal, Sparkles, Flame } from "lucide-react";

export function ExploreFilters({
  totalCount,
}: {
  totalCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQuery = searchParams.get("q") || "";
  const currentDifficulty = searchParams.get("difficulty") || "all";
  const currentSort = searchParams.get("sort") || "popular";

  const [searchTerm, setSearchTerm] = useState(currentQuery);

  // Debounced search query update
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== currentQuery) {
        updateParams({ q: searchTerm || null, page: null });
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [searchTerm, currentQuery]);

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || (key === "difficulty" && value === "all") || (key === "sort" && value === "popular")) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const clearSearch = () => {
    setSearchTerm("");
    updateParams({ q: null, page: null });
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-3xl mx-auto">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search quizzes by topic, keyword, or title (e.g. JavaScript, Space, Biology)..."
            className="w-full bg-slate-900 text-white placeholder-slate-500 text-sm sm:text-base font-bold py-3.5 pl-12 pr-10 border-3 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:border-amber-400 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3.5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter and Sort Controls Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b-2 border-slate-800 pb-6">
        {/* Difficulty Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-black uppercase text-slate-400 mr-1 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Difficulty:
          </span>

          {[
            { id: "all", label: "All", badgeClass: "bg-slate-800 text-white hover:bg-slate-700", activeClass: "bg-white text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" },
            { id: "easy", label: "Easy", badgeClass: "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700", activeClass: "bg-lime-300 text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" },
            { id: "medium", label: "Medium", badgeClass: "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700", activeClass: "bg-yellow-300 text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" },
            { id: "hard", label: "Hard", badgeClass: "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700", activeClass: "bg-pink-400 text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" },
          ].map((tab) => {
            const isActive = currentDifficulty === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => updateParams({ difficulty: tab.id, page: null })}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold uppercase transition-all ${
                  isActive ? tab.activeClass : tab.badgeClass
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Sort Controls & Counter */}
        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
          {/* Result Count */}
          <span className="text-xs font-bold text-slate-400">
            {totalCount} {totalCount === 1 ? "quiz" : "quizzes"} found
          </span>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 bg-slate-900 border-2 border-black rounded-xl p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {[
              { id: "popular", label: "Popular", icon: Flame, color: "text-amber-400" },
              { id: "newest", label: "Newest", icon: Sparkles, color: "text-lime-400" },
            ].map((sortOption) => {
              const isSelected = currentSort === sortOption.id;
              const Icon = sortOption.icon;
              return (
                <button
                  key={sortOption.id}
                  onClick={() => updateParams({ sort: sortOption.id, page: null })}
                  className={`flex items-center gap-1.5 text-xs font-black uppercase px-2.5 py-1 rounded-lg transition-all ${
                    isSelected
                      ? "bg-amber-400 text-black border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : sortOption.color}`} />
                  <span className="hidden sm:inline">{sortOption.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
