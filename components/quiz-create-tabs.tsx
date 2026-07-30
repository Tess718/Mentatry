"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { generateQuizAction, createManualQuizAction } from "@/app/actions/quizzes";
import { Brain, FileText, PenTool, Sparkles, Plus, Trash2, AlertCircle, Loader2, Timer } from "lucide-react";
import { useAlertModal } from "@/components/ui/use-alert-modal";
import { TIME_LIMIT_OPTIONS } from "@/lib/constants";

interface ManualQuestionItem {
  text: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

/** Shared Time Limit Selector used in all 3 creation tabs */
function TimeLimitSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (val: number) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
        <Timer className="w-3.5 h-3.5" />
        Time Limit
      </label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="neo-input bg-white text-slate-900"
      >
        {TIME_LIMIT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-white text-slate-900">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

const FUN_LOADING_TEXTS = [
  "Teaching AI how to read...",
  "Consulting with ancient scholars...",
  "Flipping through the textbook...",
  "Brewing some coffee for the neural network...",
  "Sharpening virtual pencils...",
  "Cross-referencing the archives...",
  "Generating distractors that sound really smart...",
  "Double-checking the correct answers...",
  "Reticulating splines...",
  "Almost there, formatting the quiz...",
  "Arguing with Wikipedia editors...",
  "Summoning knowledge from the cloud...",
  "Fact-checking with invisible librarians...",
  "Making wrong answers *convincingly* wrong...",
  "Polishing tricky questions...",
  "Scanning footnotes nobody reads...",
  "Decoding complex concepts...",
  "Turning notes into brain teasers...",
  "Balancing difficulty levels...",
  "Adding a sprinkle of challenge...",
  "Rewriting questions for clarity...",
  "Translating ideas into quiz form...",
  "Consulting the algorithmic oracle...",
  "Sorting facts from fiction...",
  "Making sure the answers behave...",
  "Organizing thoughts into neat questions...",
  "Injecting a bit of academic chaos...",
  "Calibrating question difficulty...",
  "Reviewing everything one more time...",
  "Packing knowledge into questions...",
  "Simulating a very smart teacher...",
  "Converting confusion into clarity...",
  "Tuning the quiz engine...",
  "Ensuring fair but tricky options...",
  "Putting the final touches on your quiz...",
];

function FunLoader() {
  const [textIndex, setTextIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const textInterval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % FUN_LOADING_TEXTS.length);
    }, 2500);
    
    // Fake progress bar that slows down as it gets closer to 95%
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 50) return prev + Math.random() * 5;
        if (prev < 80) return prev + Math.random() * 2;
        if (prev < 95) return prev + Math.random() * 0.5;
        return prev;
      });
    }, 200);

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="w-full space-y-4 pt-4 border-t-4 border-slate-100">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 text-black animate-spin" />
          <span className="font-black uppercase tracking-widest text-slate-900 transition-all duration-300">
            {FUN_LOADING_TEXTS[textIndex]}
          </span>
        </div>
        <span className="font-black text-slate-500">{Math.floor(progress)}%</span>
      </div>
      
      <div className="w-full h-4 border-2 border-black bg-white p-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <div
          className="h-full bg-lime-400 border-r border-black transition-all duration-200"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}

export function QuizCreateTabs() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"TOPIC" | "TEXT" | "MANUAL">("TOPIC");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- Form State: Topic ---
  const [topic, setTopic] = useState("");
  const [topicCount, setTopicCount] = useState<number>(5);
  const [topicDifficulty, setTopicDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [topicTimeLimit, setTopicTimeLimit] = useState<number>(0);
  const [topicSkipReview, setTopicSkipReview] = useState(false);

  // --- Form State: Text ---
  const [text, setText] = useState("");
  const [textCount, setTextCount] = useState<number>(5);
  const [textDifficulty, setTextDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [textTimeLimit, setTextTimeLimit] = useState<number>(0);
  const [textSkipReview, setTextSkipReview] = useState(false);

  // --- Form State: Manual ---
  const [manualTitle, setManualTitle] = useState("");
  const [manualDifficulty, setManualDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [manualTimeLimit, setManualTimeLimit] = useState<number>(0);
  const [questions, setQuestions] = useState<ManualQuestionItem[]>([
    {
      text: "",
      options: ["", "", "", ""],
      correctIndex: 0,
      explanation: "",
    },
  ]);

  // --- Submit Topic Quiz ---
  const handleTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    startTransition(async () => {
      const res = await generateQuizAction({
        sourceType: "TOPIC",
        topic,
        questionCount: topicCount,
        difficulty: topicDifficulty,
        timeLimitMinutes: topicTimeLimit || null,
        skipReview: topicSkipReview,
      });

      if (res.error) {
        if (res.fallbackToManual && res.prefill) {
          setErrorMsg(res.error);
          setManualTitle(res.prefill.title);
          setManualDifficulty(res.prefill.difficulty);
          setActiveTab("MANUAL");
        } else {
          setErrorMsg(res.error);
        }
      } else if (res.quizId) {
        if (topicSkipReview) {
          router.push(`/quizzes/${res.quizId}/take`);
        } else {
          router.push(`/quizzes/${res.quizId}/edit`);
        }
      }
    });
  };

  // --- Submit Text Quiz ---
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    startTransition(async () => {
      const res = await generateQuizAction({
        sourceType: "TEXT",
        text,
        questionCount: textCount,
        difficulty: textDifficulty,
        timeLimitMinutes: textTimeLimit || null,
        skipReview: textSkipReview,
      });

      if (res.error) {
        if (res.fallbackToManual && res.prefill) {
          setErrorMsg(res.error);
          setManualTitle(res.prefill.title);
          setManualDifficulty(res.prefill.difficulty);
          setActiveTab("MANUAL");
        } else {
          setErrorMsg(res.error);
        }
      } else if (res.quizId) {
        if (textSkipReview) {
          router.push(`/quizzes/${res.quizId}/take`);
        } else {
          router.push(`/quizzes/${res.quizId}/edit`);
        }
      }
    });
  };

  // --- Manual Question Handlers ---
  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { text: "", options: ["", "", "", ""], correctIndex: 0, explanation: "" },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuestionText = (index: number, text: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[index].text = text;
      return copy;
    });
  };

  const updateOptionText = (qIndex: number, optIndex: number, val: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const opts = [...copy[qIndex].options] as [string, string, string, string];
      opts[optIndex] = val;
      copy[qIndex].options = opts;
      return copy;
    });
  };

  const updateCorrectIndex = (qIndex: number, correctIdx: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIndex].correctIndex = correctIdx;
      return copy;
    });
  };

  const updateExplanation = (qIndex: number, explanation: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIndex].explanation = explanation;
      return copy;
    });
  };

  // --- Submit Manual Quiz ---
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Frontend validation check
    if (!manualTitle.trim()) {
      setErrorMsg("Please enter a quiz title.");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].text.trim()) {
        setErrorMsg(`Question ${i + 1} text cannot be empty.`);
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!questions[i].options[j].trim()) {
          setErrorMsg(`Question ${i + 1}, Option ${j + 1} cannot be empty.`);
          return;
        }
      }
    }

    startTransition(async () => {
      const res = await createManualQuizAction({
        title: manualTitle,
        difficulty: manualDifficulty,
        timeLimitMinutes: manualTimeLimit || null,
        questions,
      });

      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.quizId) {
        router.push(`/quizzes/${res.quizId}/edit`);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b-4 border-black pb-2">
        <button
          onClick={() => setActiveTab("TOPIC")}
          className={`neo-btn text-xs sm:text-sm py-2 px-4 ${
            activeTab === "TOPIC" ? "neo-btn-yellow" : "neo-btn-white"
          }`}
        >
          <Brain className="w-4 h-4 stroke-[3]" />
          <span>From Topic</span>
        </button>

        <button
          onClick={() => setActiveTab("TEXT")}
          className={`neo-btn text-xs sm:text-sm py-2 px-4 ${
            activeTab === "TEXT" ? "neo-btn-cyan" : "neo-btn-white"
          }`}
        >
          <FileText className="w-4 h-4 stroke-[3]" />
          <span>From Pasted Text</span>
        </button>

        <button
          onClick={() => setActiveTab("MANUAL")}
          className={`neo-btn text-xs sm:text-sm py-2 px-4 ${
            activeTab === "MANUAL" ? "neo-btn-pink" : "neo-btn-white"
          }`}
        >
          <PenTool className="w-4 h-4 stroke-[3]" />
          <span>Manual Creation</span>
        </button>
      </div>

      {/* Error / Fallback Alert Banner */}
      {errorMsg && (
        <div className="neo-box bg-pink-100 border-red-600 p-4 text-red-800 text-sm font-bold flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
          <div>
            <div className="font-extrabold uppercase">Notice</div>
            <div>{errorMsg}</div>
          </div>
        </div>
      )}

      {/* --- TAB A: TOPIC --- */}
      {activeTab === "TOPIC" && (
        <form onSubmit={handleTopicSubmit} className="neo-box p-6 bg-white text-slate-900 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-black uppercase text-black flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              Generate Quiz From Topic
            </h2>
            <p className="text-sm font-medium text-slate-600">
              Enter any subject or topic (e.g. &quot;Quantum Physics&quot;, &quot;World War II&quot;, &quot;JavaScript Promises&quot;) and AI will generate structured questions.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-black uppercase text-slate-900">Topic Name</label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Machine Learning Fundamentals"
                className="neo-input text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-black uppercase text-slate-900">Question Count</label>
                <select
                  value={topicCount}
                  onChange={(e) => setTopicCount(Number(e.target.value))}
                  className="neo-input bg-white text-slate-900"
                >
                  <option value={5} className="bg-white text-slate-900">5 Questions</option>
                  <option value={10} className="bg-white text-slate-900">10 Questions</option>
                  <option value={15} className="bg-white text-slate-900">15 Questions</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black uppercase text-slate-900">Difficulty</label>
                <select
                  value={topicDifficulty}
                  onChange={(e) => setTopicDifficulty(e.target.value as "easy" | "medium" | "hard")}
                  className="neo-input bg-white text-slate-900"
                >
                  <option value="easy" className="bg-white text-slate-900">Easy</option>
                  <option value="medium" className="bg-white text-slate-900">Medium</option>
                  <option value="hard" className="bg-white text-slate-900">Hard</option>
                </select>
              </div>

              <TimeLimitSelector value={topicTimeLimit} onChange={setTopicTimeLimit} />
            </div>
          </div>

          <div className="flex items-center gap-2 pb-2">
            <input
              type="checkbox"
              id="topic-skip-review"
              checked={topicSkipReview}
              onChange={(e) => setTopicSkipReview(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-slate-900 text-yellow-500 focus:ring-yellow-500 cursor-pointer"
            />
            <label htmlFor="topic-skip-review" className="text-sm font-bold text-slate-900 cursor-pointer select-none">
              Skip review, I'm taking this myself
            </label>
          </div>

          {isPending ? (
            <FunLoader />
          ) : (
            <button
              type="submit"
              disabled={!topic.trim()}
              className="neo-btn neo-btn-yellow w-full py-3 text-base flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Generate AI Quiz</span>
            </button>
          )}
        </form>
      )}

      {/* --- TAB B: TEXT --- */}
      {activeTab === "TEXT" && (
        <form onSubmit={handleTextSubmit} className="neo-box p-6 bg-white text-slate-900 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-black uppercase text-black flex items-center gap-2">
              <FileText className="w-6 h-6 text-cyan-500" />
              Generate Quiz From Text
            </h2>
            <p className="text-sm font-medium text-slate-600">
              Paste study material, article text, or raw lecture notes below (minimum 20 characters) for AI extraction.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-black uppercase text-slate-900">Source Content / Lecture Notes</label>
              <textarea
                required
                rows={6}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your source text here..."
                className="neo-input font-medium text-sm text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-black uppercase text-slate-900">Question Count</label>
                <select
                  value={textCount}
                  onChange={(e) => setTextCount(Number(e.target.value))}
                  className="neo-input bg-white text-slate-900"
                >
                  <option value={5} className="bg-white text-slate-900">5 Questions</option>
                  <option value={10} className="bg-white text-slate-900">10 Questions</option>
                  <option value={15} className="bg-white text-slate-900">15 Questions</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black uppercase text-slate-900">Difficulty</label>
                <select
                  value={textDifficulty}
                  onChange={(e) => setTextDifficulty(e.target.value as "easy" | "medium" | "hard")}
                  className="neo-input bg-white text-slate-900"
                >
                  <option value="easy" className="bg-white text-slate-900">Easy</option>
                  <option value="medium" className="bg-white text-slate-900">Medium</option>
                  <option value="hard" className="bg-white text-slate-900">Hard</option>
                </select>
              </div>

              <TimeLimitSelector value={textTimeLimit} onChange={setTextTimeLimit} />
            </div>
          </div>

          <div className="flex items-center gap-2 pb-2">
            <input
              type="checkbox"
              id="text-skip-review"
              checked={textSkipReview}
              onChange={(e) => setTextSkipReview(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-slate-900 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
            />
            <label htmlFor="text-skip-review" className="text-sm font-bold text-slate-900 cursor-pointer select-none">
              Skip review, I'm taking this myself
            </label>
          </div>

          {isPending ? (
            <FunLoader />
          ) : (
            <button
              type="submit"
              disabled={text.trim().length < 20}
              className="neo-btn neo-btn-cyan w-full py-3 text-base flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Generate Quiz From Text</span>
            </button>
          )}
        </form>
      )}

      {/* --- TAB C: MANUAL CREATION --- */}
      {activeTab === "MANUAL" && (
        <form onSubmit={handleManualSubmit} className="neo-box p-6 bg-white text-slate-900 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-black uppercase text-black flex items-center gap-2">
              <PenTool className="w-6 h-6 text-pink-500" />
              Manual Quiz Builder
            </h2>
            <p className="text-sm font-medium text-slate-600">
              Build your own custom questions, options, and explanations manually without calling AI.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1 space-y-1">
              <label className="block text-xs font-black uppercase text-slate-900">Quiz Title</label>
              <input
                type="text"
                required
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="e.g. Midterm History Quiz"
                className="neo-input text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black uppercase text-slate-900">Difficulty</label>
              <select
                value={manualDifficulty}
                onChange={(e) => setManualDifficulty(e.target.value as "easy" | "medium" | "hard")}
                className="neo-input bg-white text-slate-900"
              >
                <option value="easy" className="bg-white text-slate-900">Easy</option>
                <option value="medium" className="bg-white text-slate-900">Medium</option>
                <option value="hard" className="bg-white text-slate-900">Hard</option>
              </select>
            </div>

            <TimeLimitSelector value={manualTimeLimit} onChange={setManualTimeLimit} />
          </div>

          {/* Dynamic Questions List */}
          <div className="space-y-6 pt-2">
            {questions.map((q, qIdx) => (
              <div key={qIdx} className="neo-box p-5 bg-slate-50 space-y-4 border-2 border-black">
                <div className="flex items-center justify-between">
                  <span className="neo-badge bg-black text-white">
                    Question #{qIdx + 1}
                  </span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIdx)}
                      className="text-red-600 hover:text-red-800 p-1 font-bold text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-black uppercase">Question Text</label>
                  <input
                    type="text"
                    required
                    value={q.text}
                    onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                    placeholder="Enter question text..."
                    className="neo-input"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase">
                    Options (Select radio button for the correct answer)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct_${qIdx}`}
                          checked={q.correctIndex === optIdx}
                          onChange={() => updateCorrectIndex(qIdx, optIdx)}
                          className="w-4 h-4 accent-black cursor-pointer"
                        />
                        <input
                          type="text"
                          required
                          value={opt}
                          onChange={(e) => updateOptionText(qIdx, optIdx, e.target.value)}
                          placeholder={`Option ${optIdx + 1}`}
                          className="neo-input text-sm py-1.5"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-black uppercase">Explanation (Optional)</label>
                  <input
                    type="text"
                    value={q.explanation}
                    onChange={(e) => updateExplanation(qIdx, e.target.value)}
                    placeholder="Explain why the selected option is correct..."
                    className="neo-input text-sm py-1.5"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={addQuestion}
              className="neo-btn neo-btn-white text-sm"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Another Question</span>
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="neo-btn neo-btn-pink py-3 px-8 text-base"
            >
              {isPending ? "Saving Quiz..." : "Save & Create Quiz"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
