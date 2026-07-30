"use client";

import Link from "next/link";
import Avatar from "@/components/ui/avatar";
import { ChevronRight } from "lucide-react";

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

export function StudentAttemptsList({ attempts, questions }: StudentAttemptsListProps) {
  if (attempts.length === 0) {
    return (
      <div className="neo-box p-8 bg-white text-center text-slate-600 font-semibold italic">
        No participant attempts available yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {attempts.map((att) => {
        const name = att.user.firstName
          ? `${att.user.firstName} ${att.user.lastName || ""}`
          : att.user.email;
        
        const percentage = Math.round((att.score / questions.length) * 100) || 0;

        let backParams = "?from=insights";
        if (att.roomId) {
          backParams = `?from=room&roomId=${att.roomId}`;
        }

        return (
          <Link 
            key={att.id} 
            href={`/quizzes/${att.quizId}/results/${att.id}${backParams}`}
            className="block neo-box bg-white overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <Avatar seed={att.user.email} size={40} />
                <div>
                  <div className="font-extrabold text-black text-base">{name}</div>
                  <div className="text-xs font-semibold text-slate-500">
                    {att.completedAt ? (
                      <>
                        {new Date(att.completedAt).toLocaleDateString()} at{" "}
                        {new Date(att.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </>
                    ) : (
                      "Incomplete"
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="neo-badge bg-yellow-300 text-black text-sm">
                  {att.score} / {questions.length} ({percentage}%)
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
