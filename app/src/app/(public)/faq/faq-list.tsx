"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type FaqItem = {
  question: string;
  answer: string;
};

export const FaqList = ({ faqs }: { faqs: FaqItem[] }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden transition-all"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left focus:outline-none"
            aria-expanded={openIndex === index}
          >
            <span className="font-semibold text-gray-900 dark:text-white text-base">
              {faq.question}
            </span>
            <span className="text-gray-400 flex-shrink-0">
              {openIndex === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </span>
          </button>
          
          <div
            className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
              openIndex === index ? "max-h-96 pb-4 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {faq.answer}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
