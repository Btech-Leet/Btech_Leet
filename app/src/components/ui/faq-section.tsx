"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, Loader2 } from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface FAQSectionProps {
  pageUrl?: string; // Optional custom URL, defaults to current pathname
}

export function FAQSection({ pageUrl }: FAQSectionProps) {
  const pathname = usePathname();
  const activePath = pageUrl || pathname;

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    async function loadFaqs() {
      try {
        const res = await fetch(`/api/faqs?pageUrl=${encodeURIComponent(activePath)}`);
        if (res.ok) {
          const data = await res.json();
          setFaqs(data.data || []);
        }
      } catch (err) {
        console.error("Failed to load FAQs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFaqs();
  }, [activePath]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 size={24} className="animate-spin text-orange-500" />
      </div>
    );
  }

  if (faqs.length === 0) return null;

  // Generate FAQPage JSON-LD schema markup
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };

  return (
    <section className="py-24 relative overflow-hidden bg-slate-50 dark:bg-slate-950/50 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Questions</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Everything you need to know about BTech Lateral Entry and our platform.
          </p>
        </div>

        {/* Accordion List */}
        <div className="flex flex-col gap-3">
          {faqs.map((faq, idx) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`group bg-white dark:bg-slate-900/40 border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen 
                    ? "border-orange-500/30 dark:border-orange-500/20 shadow-lg shadow-orange-500/5" 
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full text-left p-5 md:p-6 cursor-pointer flex items-center justify-between gap-4"
                  aria-expanded={isOpen}
                >
                  <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {faq.question}
                  </h4>
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isOpen 
                      ? "bg-orange-500 text-white rotate-180" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}>
                    <ChevronDown size={16} />
                  </div>
                </button>
                
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? "max-h-[500px]" : "max-h-0"
                  }`}
                >
                  <div className="px-5 md:px-6 pb-5 md:pb-6 pt-0">
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Inject JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </div>
    </section>
  );
}
