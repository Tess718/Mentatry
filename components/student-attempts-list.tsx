"use client";

import { useState } from "react";
import Avatar from "@/components/ui/avatar";
import { ChevronDown, ChevronUp, CheckCircle2, XCircle } from "lucide-react";

import { Prisma } from "@prisma/client";

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
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (attempts.length === 0) {
    return (
      <div className="neo-box p-8 bg-white text-center text-slate-600 font-semibold italic">
        No participant attempts available yet.
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {attempts.map((att) => {
        const name = att.user.firstName
          ? `${att.user.firstName} ${att.user.lastName || ""}`
          : att.user.email;
        
        const isExpanded = expandedId === att.id;
        const percentage = Math.round((att.score / questions.length) * 100) || 0;

        return (
          <div key={att.id} className="neo-box bg-white overflow-hidden transition-all">
            {/* Header / Accordion Trigger */}
            <div 
              onClick={() => toggleExpand(att.id)}
              className="p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <Avatar seed={att.user.email} size={40} />
                <div>
                  <div className="font-extrabold text-black text-base">{name}</div>
                  <div className="text-xs font-semibold text-slate-500">
                    {new Date(att.completedAt).toLocaleDateString()} at{" "}
                    {new Date(att.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="neo-badge bg-yellow-300 text-black text-sm">
                  {att.score} / {questions.length} ({percentage}%)
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </div>
            </div>

            {/* Expanded Answers View */}
            {isExpanded && (
              <div className="border-t-4 border-black p-4 sm:p-6 bg-slate-50 space-y-6">
                {questions.map((q) => {
                  const answer = att.answers.find(a => a.questionId === q.id);
                  const isCorrect = answer?.isCorrect || false;
                  const selectedText = answer ? q.options[answer.selectedIndex] : "No Answer";
                  const correctText = q.options[q.correctIndex];

                  return (
                    <div 
                      key={q.id} 
                      className={`neo-box p-4 bg-white border-l-8 ${isCorrect ? "border-l-lime-500" : "border-l-pink-500"}`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h4 className="text-sm font-extrabold text-slate-900">
                          {q.order}. {q.text}
                        </h4>
                        {isCorrect ? (
                          <div className="neo-badge bg-lime-300 text-black px-2 py-0.5 text-xs flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                          </div>
                        ) : (
                          <div className="neo-badge bg-pink-300 text-black px-2 py-0.5 text-xs flex items-center gap-1 shrink-0">
                            <XCircle className="w-3.5 h-3.5" /> Incorrect
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-1.5 pt-2 text-sm font-semibold">
                        <div className="flex items-start gap-2">
                          <span className="text-slate-500 min-w-[70px]">Selected:</span>
                          <span className={isCorrect ? "text-lime-700 font-bold" : "text-pink-600 font-bold"}>
                            {selectedText}
                          </span>
                        </div>
                        
                        {!isCorrect && (
                          <div className="flex items-start gap-2">
                            <span className="text-slate-500 min-w-[70px]">Answer:</span>
                            <span className="text-slate-900 font-bold">
                              {correctText}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
