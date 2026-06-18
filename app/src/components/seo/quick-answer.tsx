import React from "react";
import { Sparkles } from "lucide-react";

type QuickAnswerProps = {
  question: string;
  answer: string;
};

export const QuickAnswer = ({ question, answer }: QuickAnswerProps) => {
  return (
    <div className="my-8 rounded-2xl bg-blue-600/10 border border-blue-500/20 p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-20">
        <Sparkles size={48} className="text-blue-500" />
      </div>
      <div className="relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg mb-4">
          Quick Answer
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{question}</h3>
        <p className="text-gray-300 md:text-lg leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};
