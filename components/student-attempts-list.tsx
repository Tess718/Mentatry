"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Avatar from "@/components/ui/avatar";
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Search,
  X,
  Users,
  Trophy,
  History,
} from "lucide-react";
import { Prisma } from "@/prisma/generated/client";

type AttemptWithDetails = Prisma.AttemptGetPayload<{
  include: {
    user: { select: { email: true; firstName: true; lastName: true } };
    answers: true;
  };
}>;

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  order: number;
}

interface StudentAttemptsListProps {
  attempts: AttemptWithDetails[];
  questions: Question[];
}

interface ParticipantGroup {
  id: string;
  email: string;
  name: string;
  attempts: AttemptWithDetails[];
  bestScore: number;
  bestPercentage: number;
  latestScore: number;
  latestPercentage: number;
  latestCompletedAt: string | null;
  totalAttempts: number;
}

const PAGE_SIZE = 10;

export function StudentAttemptsList({ attempts, questions }: StudentAttemptsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "attempts">("newest");
  const [expandedParticipantId, setExpandedParticipantId] = useState<string | null>(null);

  // Group attempts by unique participant
  const participantGroups = useMemo(() => {
    const groupMap = new Map<string, AttemptWithDetails[]>();

    // Bucket attempts by user ID or user email
    attempts.forEach((att) => {
      const key = att.userId || att.user.email;
      const existing = groupMap.get(key) || [];
      existing.push(att);
      groupMap.set(key, existing);
    });

    const groups: ParticipantGroup[] = [];

    groupMap.forEach((userAttempts, key) => {
      // Sort attempts chronologically descending (newest first)
      const sorted = [...userAttempts].sort((a, b) => {
        const timeA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const timeB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return timeB - timeA;
      });

      const first = sorted[0];
      const name = first.user.firstName
        ? `${first.user.firstName} ${first.user.lastName || ""}`.trim()
        : first.user.email;

      const bestScore = Math.max(...sorted.map((a) => a.score));
      const bestPercentage = Math.round((bestScore / questions.length) * 100) || 0;
      const latestScore = first.score;
      const latestPercentage = Math.round((latestScore / questions.length) * 100) || 0;

      groups.push({
        id: key,
        email: first.user.email,
        name,
        attempts: sorted,
        bestScore,
        bestPercentage,
        latestScore,
        latestPercentage,
        latestCompletedAt: first.completedAt ? new Date(first.completedAt).toISOString() : null,
        totalAttempts: sorted.length,
      });
    });

    return groups;
  }, [attempts, questions.length]);

  // Filter & Sort participant groups
  const filteredParticipants = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    let result = participantGroups.filter((p) => {
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
    });

    // Apply sorting
    if (sortBy === "highest") {
      result = [...result].sort((a, b) => b.bestScore - a.bestScore);
    } else if (sortBy === "attempts") {
      result = [...result].sort((a, b) => b.totalAttempts - a.totalAttempts);
    } else {
      // newest
      result = [...result].sort((a, b) => {
        const timeA = a.latestCompletedAt ? new Date(a.latestCompletedAt).getTime() : 0;
        const timeB = b.latestCompletedAt ? new Date(b.latestCompletedAt).getTime() : 0;
        return timeB - timeA;
      });
    }

    return result;
  }, [participantGroups, searchQuery, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredParticipants.length / PAGE_SIZE) || 1;
  const activePage = Math.min(currentPage, totalPages);
  const paginatedParticipants = useMemo(() => {
    return filteredParticipants.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);
  }, [filteredParticipants, activePage]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort: "newest" | "highest" | "attempts") => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const toggleExpand = (id: string) => {
    setExpandedParticipantId((prev) => (prev === id ? null : id));
  };

  if (attempts.length === 0) {
    return (
      <div className="neo-box p-8 bg-white text-center text-slate-600 font-semibold italic rounded-2xl">
        No participant attempts available yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search participant by name or email..."
            className="w-full bg-white text-black font-bold text-xs pl-10 pr-9 py-2.5 rounded-xl border-2 border-black focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black cursor-pointer p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Controls & Counter */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900 border-2 border-black p-1 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <button
              type="button"
              onClick={() => handleSortChange("newest")}
              className={`px-2.5 py-1 text-[11px] font-black uppercase rounded-lg transition-all cursor-pointer ${
                sortBy === "newest"
                  ? "bg-amber-300 text-black border border-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Recent
            </button>
            <button
              type="button"
              onClick={() => handleSortChange("highest")}
              className={`px-2.5 py-1 text-[11px] font-black uppercase rounded-lg transition-all cursor-pointer ${
                sortBy === "highest"
                  ? "bg-lime-300 text-black border border-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Best Score
            </button>
            <button
              type="button"
              onClick={() => handleSortChange("attempts")}
              className={`px-2.5 py-1 text-[11px] font-black uppercase rounded-lg transition-all cursor-pointer ${
                sortBy === "attempts"
                  ? "bg-cyan-300 text-black border border-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Most Runs
            </button>
          </div>

          <span className="text-xs font-black text-slate-400 whitespace-nowrap">
            {filteredParticipants.length} {filteredParticipants.length === 1 ? "participant" : "participants"}
          </span>
        </div>
      </div>

      {/* Participants Grouped List */}
      {filteredParticipants.length === 0 ? (
        <div className="neo-box p-8 bg-slate-900 border-2 border-black text-center space-y-3 rounded-2xl">
          <div className="w-12 h-12 bg-amber-400 border-2 border-black rounded-xl flex items-center justify-center mx-auto text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Users className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h4 className="text-base font-black uppercase text-white">No Matching Participants</h4>
          <p className="text-xs font-bold text-slate-400">
            No participants found matching &ldquo;{searchQuery}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => handleSearchChange("")}
            className="neo-btn neo-btn-white text-xs py-1.5 px-3 inline-block cursor-pointer mt-1"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedParticipants.map((participant) => {
            const isExpanded = expandedParticipantId === participant.id;
            const hasMultiple = participant.totalAttempts > 1;
            const singleAttempt = participant.attempts[0];

            let singleAttemptBackParams = "?from=insights";
            if (singleAttempt?.roomId) {
              singleAttemptBackParams = `?from=room&roomId=${singleAttempt.roomId}`;
            }

            return (
              <div
                key={participant.id}
                className="neo-box bg-white overflow-hidden rounded-2xl transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                {/* Participant Card Header */}
                <div
                  onClick={() => (hasMultiple ? toggleExpand(participant.id) : null)}
                  className={`p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 transition-colors ${
                    hasMultiple ? "cursor-pointer hover:bg-slate-50" : ""
                  }`}
                >
                  {/* Left: Avatar & Info */}
                  <div className="flex items-center gap-3.5">
                    <Avatar seed={participant.email} size={42} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-black text-base leading-snug">
                          {participant.name}
                        </span>
                        {hasMultiple && (
                          <span className="neo-badge bg-amber-300 text-black text-[10px] font-black px-2 py-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                            {participant.totalAttempts} Runs
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-500">
                        {participant.latestCompletedAt ? (
                          <>
                            Last active{" "}
                            {new Date(participant.latestCompletedAt).toLocaleDateString()} at{" "}
                            {new Date(participant.latestCompletedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </>
                        ) : (
                          "Incomplete"
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Scores & Actions */}
                  <div className="flex flex-col items-end gap-1">
                    {/* Top Row: Best Score Badge + Dropdown Indicator / Action Button */}
                    <div className="flex items-center gap-2">
                      <div
                        className={`neo-badge text-xs font-black px-3 py-1 ${
                          participant.bestPercentage >= 80
                            ? "bg-lime-300 text-black"
                            : participant.bestPercentage >= 50
                            ? "bg-yellow-300 text-black"
                            : "bg-pink-300 text-black"
                        }`}
                      >
                        {hasMultiple ? "Best: " : "Score: "}
                        {participant.bestScore}/{questions.length} ({participant.bestPercentage}%)
                      </div>

                      {hasMultiple ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(participant.id);
                          }}
                          className={`w-7 h-7 rounded-lg border-2 border-black flex items-center justify-center transition-transform cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                            isExpanded ? "bg-amber-300 rotate-180" : "bg-slate-100 hover:bg-slate-200"
                          }`}
                          title={isExpanded ? "Collapse History" : "Expand Attempts"}
                        >
                          <ChevronDown className="w-4 h-4 text-black stroke-[3]" />
                        </button>
                      ) : (
                        <Link
                          href={`/quizzes/${singleAttempt.quizId}/results/${singleAttempt.id}${singleAttemptBackParams}`}
                          className="neo-btn neo-btn-white text-xs py-1 px-2.5 flex items-center gap-1"
                        >
                          <span>Review</span>
                          <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                        </Link>
                      )}
                    </div>

                    {/* Bottom Row: Latest Score Subtext */}
                    {hasMultiple && (
                      <span className="text-[10px] font-black text-slate-500 pr-9">
                        Latest: {participant.latestScore}/{questions.length} ({participant.latestPercentage}%)
                      </span>
                    )}
                  </div>
                </div>

                {/* Expandable Attempt History Drawer */}
                {hasMultiple && isExpanded && (
                  <div className="bg-slate-50 border-t-2 border-slate-200 p-3 sm:p-4 space-y-2">
                    <div className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5 px-2 mb-2">
                      <History className="w-3.5 h-3.5 text-slate-600" />
                      <span>All Attempt Runs ({participant.totalAttempts})</span>
                    </div>

                    <div className="space-y-2">
                      {participant.attempts.map((att, idx) => {
                        const runNumber = participant.totalAttempts - idx;
                        const isLatest = idx === 0;
                        const pct = Math.round((att.score / questions.length) * 100) || 0;

                        let backParams = "?from=insights";
                        if (att.roomId) {
                          backParams = `?from=room&roomId=${att.roomId}`;
                        }

                        return (
                          <Link
                            key={att.id}
                            href={`/quizzes/${att.quizId}/results/${att.id}${backParams}`}
                            className="block bg-white p-3 sm:p-3.5 rounded-xl border-2 border-black hover:border-amber-500 hover:bg-amber-50/50 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <span className="w-6 h-6 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-xs">
                                  #{runNumber}
                                </span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-xs text-black">
                                      Attempt #{runNumber}
                                    </span>
                                    {isLatest && (
                                      <span className="bg-cyan-300 text-black border border-black text-[9px] font-black uppercase px-1.5 py-0.2 rounded shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                                        Latest
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] font-bold text-slate-500">
                                    {att.completedAt ? (
                                      <>
                                        {new Date(att.completedAt).toLocaleDateString()} at{" "}
                                        {new Date(att.completedAt).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </>
                                    ) : (
                                      "Incomplete"
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <div
                                  className={`neo-badge text-[11px] font-black px-2.5 py-0.5 ${
                                    pct >= 80
                                      ? "bg-lime-300 text-black"
                                      : pct >= 50
                                      ? "bg-yellow-300 text-black"
                                      : "bg-pink-300 text-black"
                                  }`}
                                >
                                  {att.score}/{questions.length} ({pct}%)
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400 stroke-[3]" />
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4 border-t-2 border-slate-800">
          {/* Previous Page */}
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={activePage <= 1}
            className={`neo-btn py-1.5 px-3 text-xs font-black uppercase flex items-center gap-1 cursor-pointer ${
              activePage <= 1
                ? "pointer-events-none opacity-40 bg-slate-800 text-slate-400 border-slate-700"
                : "neo-btn-white"
            }`}
          >
            <ChevronLeft className="w-4 h-4 stroke-[3]" />
            <span>Prev</span>
          </button>

          {/* Page Indicator */}
          <div className="text-xs font-black text-slate-300">
            <span className="bg-slate-900 border-2 border-black px-3 py-1 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-white">
              Page <strong className="text-amber-400">{activePage}</strong> of {totalPages}
            </span>
          </div>

          {/* Next Page */}
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={activePage >= totalPages}
            className={`neo-btn py-1.5 px-3 text-xs font-black uppercase flex items-center gap-1 cursor-pointer ${
              activePage >= totalPages
                ? "pointer-events-none opacity-40 bg-slate-800 text-slate-400 border-slate-700"
                : "neo-btn-white"
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      )}
    </div>
  );
}
