import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Sparkles, Eye, Calendar, BookOpen, Link as LinkIcon, HelpCircle } from "lucide-react";

export const dynamic = "force-dynamic";

interface BestAnswerPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: BestAnswerPageProps): Promise<Metadata> {
  const page = await prisma.bestAnswerPage.findUnique({
    where: { slug: params.slug },
  });

  if (!page) {
    return {
      title: "Answer Not Found | BTech LEET",
    };
  }

  return {
    title: page.metaTitle || `${page.title} | BTech LEET`,
    description: page.metaDesc || `Find detailed expert answers for ${page.title} on BTech LEET.`,
    keywords: page.keywords || [],
  };
}

export default async function BestAnswerDetail({ params }: BestAnswerPageProps) {
  const page = await prisma.bestAnswerPage.findUnique({
    where: { slug: params.slug },
  });

  if (!page || page.status !== "PUBLISHED") {
    notFound();
  }

  // Increment views asynchronously
  prisma.bestAnswerPage
    .update({
      where: { id: page.id },
      data: { views: { increment: 1 } },
    })
    .catch((err) => console.error("Failed to increment views:", err));

  // Parse FAQ
  const faqs = (page.faqSection as any) || [];
  // Parse Internal Links
  const internalLinks = (page.internalLinks as any) || [];

  // Generate FAQ JSON-LD Schema
  const faqSchemaJson = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq: any) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      {/* FAQ Schema Markup */}
      {faqSchemaJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchemaJson) }}
        />
      )}

      {/* Hero Header */}
      <section className="relative overflow-hidden py-16 sm:py-20 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20 border-b border-gray-100 dark:border-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-500/20">
            <Sparkles size={12} className="animate-pulse" /> Verified Answer
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
            {page.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-2">
            <span className="flex items-center gap-1">
              <Calendar size={13} /> {new Date(page.updatedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
              })}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={13} /> {page.views + 1} views
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Article Body */}
        <div className="lg:col-span-3 space-y-8">
          <article className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div 
              className="prose prose-sm sm:prose max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-img:rounded-xl text-gray-800 dark:text-gray-200"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </article>

          {/* FAQs Accordion */}
          {faqs.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="text-blue-500" size={20} /> Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {faqs.map((faq: any, idx: number) => (
                  <details
                    key={idx}
                    className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm transition-all duration-300 [&_summary::-webkit-details-marker]:hidden"
                  >
                    <summary className="flex items-center justify-between p-4 cursor-pointer focus:outline-none select-none">
                      <span className="text-sm font-bold text-gray-900 dark:text-white pr-4">
                        {faq.question}
                      </span>
                      <span className="transition duration-300 group-open:-rotate-180 flex-shrink-0 text-gray-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-4 pb-4 pt-1 border-t border-gray-50 dark:border-gray-850/50">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                        {faq.answer}
                      </p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Internal Links/Related Resources */}
          {internalLinks.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center gap-1.5">
                <LinkIcon size={14} className="text-blue-500" /> Related Links
              </h2>
              <ul className="space-y-3">
                {internalLinks.map((link: any, idx: number) => (
                  <li key={idx}>
                    <Link
                      href={link.url}
                      className="text-xs font-semibold text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 block transition-colors leading-tight"
                    >
                      → {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Help Box */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-md space-y-3">
            <BookOpen size={24} />
            <h3 className="font-bold text-sm">Need study materials?</h3>
            <p className="text-[11px] text-blue-100 leading-relaxed">
              Unlock our premium books, test series, and comprehensive lateral entry notes curated by experts.
            </p>
            <Link
              href="/books"
              className="inline-flex w-full justify-center items-center py-2 px-3 bg-white text-blue-700 hover:bg-blue-50 transition-colors rounded-xl text-xs font-bold shadow-sm"
            >
              Explore Books
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
