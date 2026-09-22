"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How does the AI quiz generator work?",
    answer:
      "Mentatry uses advanced AI models to generate quizzes instantly. Simply enter any topic name (e.g., 'Cellular Respiration' or 'World War II') or paste raw lecture notes. The AI parses the subject, crafts accurate multiple-choice questions, identifies the correct answer, and writes detailed explanations for each option.",
  },
  {
    question: "Do students need an account to join a quiz?",
    answer:
      "Quiz takers can quickly join any classroom room using a 6-character Join Code. If they are signed in, their score and full question-by-question review will be saved to their personal history dashboard.",
  },
  {
    question: "Can I create quizzes manually without AI?",
    answer:
      "Absolutely! You can use our Manual Quiz Creator to write custom questions, add your own option choices, select the correct answer, and provide your own custom explanation.",
  },
  {
    question: "What analytics do quiz owners get?",
    answer:
      "Quiz owners get a dedicated Real-Time Insights Dashboard featuring total attempt counts, average classroom score, student accuracy percentages, and a Per-Question Miss Rate Breakdown to quickly pinpoint topic gaps.",
  },
  {
    question: "Is Mentatry free to use?",
    answer:
      "Yes! Mentatry is free for educators, students, and self-directed learners.",
  },
  {
    question: "Can I customize AI-generated questions?",
    answer:
      "Yes, absolutely. You have complete editorial control over every quiz. You can review and edit question wording, modify answer choices, write custom explanations, adjust timers, and add or remove questions at any time.",
  },
];

export function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const renderFAQItem = (faq: FAQItem, idx: number) => {
    const isOpen = openIndex === idx;

    return (
      <div
        key={idx}
        className="neo-box bg-white text-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-3 border-black transition-all"
      >
        <button
          onClick={() => toggle(idx)}
          className="w-full p-5 text-left flex items-center justify-between gap-4 font-black uppercase text-base sm:text-lg hover:bg-amber-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-amber-500 shrink-0 stroke-[2.5]" />
            <span>{faq.question}</span>
          </div>
          <ChevronDown
            className={`w-5 h-5 shrink-0 stroke-[3] transition-transform duration-200 ${
              isOpen ? "rotate-180 text-pink-600" : "text-black"
            }`}
          />
        </button>

        {isOpen && (
          <div className="p-5 pt-0 border-t-2 border-slate-200 bg-slate-50 text-slate-800 font-semibold text-sm leading-relaxed animate-in fade-in duration-150">
            {faq.answer}
          </div>
        )}
      </div>
    );
  };

  const col1 = faqs.slice(0, 3);
  const col2 = faqs.slice(3, 6);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start w-full">
      <div className="space-y-4 sm:space-y-6">
        {col1.map((faq, index) => renderFAQItem(faq, index))}
      </div>
      <div className="space-y-4 sm:space-y-6">
        {col2.map((faq, index) => renderFAQItem(faq, index + 3))}
      </div>
    </div>
  );
}
