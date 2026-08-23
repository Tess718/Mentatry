"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateQuizAction } from "@/app/actions/quizzes-edit"; 
import { Loader2, Plus, Trash2, CheckCircle2, Globe, Lock } from "lucide-react";
import { TIME_LIMIT_OPTIONS } from "@/lib/constants";

// Defining types explicitly based on schema
interface Question {
  id?: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string | null;
}

interface Quiz {
  id: string;
  title: string;
  difficulty: string;
  timeLimitMinutes: number | null;
  status: string;
  isPublic?: boolean;
  questions: Question[];
}

export function QuizEditor({ initialQuiz }: { initialQuiz: Quiz }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [title, setTitle] = useState(initialQuiz.title);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(initialQuiz.difficulty as "easy" | "medium" | "hard");
  const [timeLimit, setTimeLimit] = useState(initialQuiz.timeLimitMinutes || 0);
  const [isPublic, setIsPublic] = useState(initialQuiz.isPublic ?? false);
  const [questions, setQuestions] = useState<Question[]>(
    initialQuiz.questions.length > 0
      ? initialQuiz.questions
      : [{ text: "", options: ["", "", "", ""], correctIndex: 0, explanation: "" }]
  );

  const updateQuestion = <K extends keyof Question>(index: number, field: K, value: Question[K]) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const newOptions = [...updated[qIndex].options];
      newOptions[optIndex] = value;
      updated[qIndex].options = newOptions;
      return updated;
    });
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { text: "", options: ["", "", "", ""], correctIndex: 0, explanation: "" },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveAndPublish = async () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await updateQuizAction({
        quizId: initialQuiz.id,
        title,
        difficulty,
        timeLimitMinutes: timeLimit || null,
        isPublic,
        questions,
        publish: true,
      });

      if (res.error) {
        setErrorMsg(res.error);
        return;
      }

      // Success — push navigates to a fresh server render, no need for refresh()
      router.push("/quizzes");
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-lg border border-neutral-200 shadow-sm sticky top-[76px] z-20">
        <div>
          <h2 className="text-2xl font-bebas tracking-wide text-neutral-900">Review & Publish Quiz</h2>
          <p className="text-sm text-neutral-500">Ensure the questions look correct before making it available.</p>
        </div>
        <button onClick={handleSaveAndPublish} disabled={isPending} className="neo-btn neo-btn-cyan w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-50">
          {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
          Publish Quiz
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">
          {errorMsg}
        </div>
      )}

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 bg-white p-4 sm:p-6 rounded-lg border border-neutral-200 shadow-sm">
          <div className="space-y-2 md:col-span-2 flex flex-col">
            <label className="text-sm font-bold uppercase text-black">Quiz Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="neo-input" />
          </div>
          <div className="space-y-2 flex flex-col">
            <label className="text-sm font-bold uppercase text-black">Difficulty</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as "easy" | "medium" | "hard")} className="neo-input bg-white text-slate-900">
              <option value="easy" className="bg-white text-slate-900">Easy</option>
              <option value="medium" className="bg-white text-slate-900">Medium</option>
              <option value="hard" className="bg-white text-slate-900">Hard</option>
            </select>
          </div>
          <div className="space-y-2 flex flex-col">
            <label className="text-sm font-bold uppercase text-black">Time Limit (Optional)</label>
            <select value={timeLimit.toString()} onChange={(e) => setTimeLimit(parseInt(e.target.value, 10))} className="neo-input bg-white text-slate-900">
              {TIME_LIMIT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-white text-slate-900">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Visibility Selector */}
          <div className="space-y-2 md:col-span-2 flex flex-col pt-2 border-t border-slate-200">
            <label className="text-sm font-bold uppercase text-black flex items-center gap-1.5">
              <span>Quiz Visibility</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`p-3.5 rounded-xl border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${
                  !isPublic
                    ? "bg-amber-50 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ring-2 ring-amber-400"
                    : "bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div className={`p-2 rounded-lg border-2 border-black shrink-0 ${!isPublic ? 'bg-amber-400 text-black' : 'bg-slate-200 text-slate-600'}`}>
                  <Lock className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-xs font-black text-black uppercase">Private (Default)</div>
                  <div className="text-[11px] font-semibold text-slate-600 mt-0.5">
                    Accessible only via Join Code & Live Rooms. Hidden from Explore.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`p-3.5 rounded-xl border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${
                  isPublic
                    ? "bg-emerald-50 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ring-2 ring-emerald-500"
                    : "bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div className={`p-2 rounded-lg border-2 border-black shrink-0 ${isPublic ? 'bg-emerald-400 text-black' : 'bg-slate-200 text-slate-600'}`}>
                  <Globe className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-xs font-black text-black uppercase">Public on Explore</div>
                  <div className="text-[11px] font-semibold text-slate-600 mt-0.5">
                    Listed in the public community feed for all players to discover.
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bebas text-neutral-900">Questions</h3>
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="p-4 sm:p-6 bg-white border border-neutral-200 rounded-lg shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-grow flex flex-col">
                  <label className="text-sm font-bold uppercase text-black">Question {qIndex + 1}</label>
                  <textarea
                    placeholder="Enter your question"
                    value={q.text}
                    onChange={(e) => updateQuestion(qIndex, "text", e.target.value)}
                    rows={3}
                    className="neo-input w-full resize-y min-h-[100px] sm:min-h-[80px]"
                  />
                </div>
                {questions.length > 1 && (
                  <button type="button" onClick={() => removeQuestion(qIndex)} className="text-red-500 hover:bg-red-50 p-2 border-2 border-transparent hover:border-red-500 rounded-lg mt-6 transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold uppercase text-black block mb-2">Options</label>
                {q.options.map((opt, optIndex) => (
                  <div key={optIndex} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={q.correctIndex === optIndex}
                      onChange={() => updateQuestion(qIndex, "correctIndex", optIndex)}
                      className="w-5 h-5 accent-indigo-600"
                    />
                    <input
                      placeholder={`Option ${optIndex + 1}`}
                      value={opt}
                      onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                      className={`neo-input w-full ${q.correctIndex === optIndex ? "border-indigo-600 bg-indigo-50" : ""}`}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-2 border-t border-neutral-100 flex flex-col mt-4">
                <label className="text-sm font-bold uppercase text-slate-500">Explanation (Optional)</label>
                <textarea
                  placeholder="Explain why the correct answer is correct..."
                  value={q.explanation || ""}
                  onChange={(e) => updateQuestion(qIndex, "explanation", e.target.value)}
                  rows={3}
                  className="neo-input w-full bg-slate-50 resize-y min-h-[100px] sm:min-h-[80px]"
                />
              </div>
            </div>
          ))}

          <button type="button" onClick={addQuestion} className="w-full neo-box border-dashed border-4 border-slate-300 py-8 text-slate-800 hover:text-black hover:border-black font-bold flex items-center justify-center transition-all bg-transparent">
            <Plus className="w-5 h-5 mr-2 stroke-[3]" />
            ADD QUESTION
          </button>
        </div>
      </div>
    </div>
  );
}
