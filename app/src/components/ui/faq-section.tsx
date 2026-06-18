"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

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
      <div className="flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <span className="material-symbols-outlined animate-spin text-orange-500 text-[24px]">progress_activity</span>
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
    <section className="py-xxl bg-slate-50 dark:bg-slate-900 px-margin-mobile md:px-margin-desktop border-t border-slate-200 dark:border-slate-800 transition-colors duration-300" aria-labelledby="faq-heading">
      <div className="max-w-3xl mx-auto">
        
        {/* Title */}
        <div className="text-center mb-xl">
          <h2 id="faq-heading" className="text-headline-lg-mobile md:text-headline-lg font-headline-lg-mobile md:font-headline-lg text-slate-900 dark:text-white mb-sm transition-colors duration-300">
            Frequently Asked Questions
          </h2>
          <p className="text-body-md font-body-md text-slate-650 dark:text-slate-400 transition-colors duration-300">
            Everything you need to know about BTech Lateral Entry and our platform.
          </p>
        </div>

        {/* Accordion List */}
        <div className="flex flex-col gap-md">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-md transition-colors duration-300"
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full text-left font-bold text-slate-900 dark:text-white transition-colors cursor-pointer flex flex-col gap-xs"
                  aria-expanded={isOpen}
                >
                  <h4 className="text-body-lg font-body-lg font-semibold text-slate-900 dark:text-white w-full flex items-center justify-between transition-colors duration-300">
                    {faq.question}
                    <span
                      className={`material-symbols-outlined text-orange-500 shrink-0 transition-transform duration-300 ${
                        isOpen ? "transform rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    >
                      expand_more
                    </span>
                  </h4>
                </button>
                
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? "max-h-[500px] mt-xs" : "max-h-0"
                  }`}
                >
                  <p className="text-body-md font-body-md text-slate-655 dark:text-slate-400 transition-colors duration-300">
                    {faq.answer}
                  </p>
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
