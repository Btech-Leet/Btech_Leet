import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PenTool, GraduationCap, Briefcase, BookOpen, Download, User } from "lucide-react";

export const dynamic = "force-dynamic";

interface AuthorDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: AuthorDetailPageProps): Promise<Metadata> {
  const author = await prisma.author.findUnique({
    where: { slug: params.slug },
  });

  if (!author) {
    return {
      title: "Author Not Found | BTech LEET",
    };
  }

  return {
    title: `${author.name} - Educator & Author | BTech LEET`,
    description: author.biography || `${author.name} is an educator and author specializing in B.Tech Lateral Entry Examination preparation.`,
  };
}

export default async function AuthorDetailPage({ params }: AuthorDetailPageProps) {
  const author = await prisma.author.findUnique({
    where: { slug: params.slug },
    include: {
      books: {
        where: { active: true },
        orderBy: [
          { featured: "desc" },
          { createdAt: "desc" },
        ],
      },
    },
  });

  if (!author || !author.active) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      {/* Hero Header */}
      <section className="relative overflow-hidden py-16 sm:py-20 bg-gradient-to-b from-emerald-50/50 to-transparent dark:from-emerald-950/20 border-b border-gray-100 dark:border-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            {/* Photo */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border-4 border-emerald-100 dark:border-emerald-900/50 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-md">
              {author.photo ? (
                <img src={author.photo} alt={author.name} className="w-full h-full object-cover" />
              ) : (
                <User className="text-emerald-500 w-16 h-16" />
              )}
            </div>

            {/* Title / Bio details */}
            <div className="space-y-4 flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                <PenTool size={12} /> Educator Profile
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                {author.name}
              </h1>
              {author.designation && (
                <p className="text-lg sm:text-xl text-emerald-600 dark:text-emerald-400 font-semibold">
                  {author.designation}
                </p>
              )}
              
              {author.experience && (
                <div className="inline-flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-left shadow-sm">
                  <Briefcase size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Experience & Expertise</span>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium mt-0.5">{author.experience}</p>
                  </div>
                </div>
              )}

              {author.linkedinUrl && (
                <div className="pt-2">
                  <a
                    href={author.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-[#0077b5] hover:bg-[#006297] transition-colors shadow-sm shadow-blue-500/15"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg> Connect on LinkedIn
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Biography */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
              Biography
            </h2>
            {author.biography ? (
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {author.biography}
              </p>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No biography available for this educator.
              </p>
            )}
          </div>
        </div>

        {/* Books & Notes list */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center gap-2">
              <BookOpen size={18} className="text-emerald-500" /> Books & Notes ({author.books.length})
            </h2>

            {author.books.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400 italic text-center py-4">
                No books published by this author yet.
              </p>
            ) : (
              <div className="space-y-4 divide-y divide-gray-100 dark:divide-gray-800">
                {author.books.map((book, idx) => (
                  <div key={book.id} className={`pt-4 first:pt-0 flex gap-3 group`}>
                    <div className="w-12 h-16 rounded bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-200 dark:border-gray-700 relative">
                      {book.coverImage ? (
                        <img src={book.coverImage} alt={book.name} className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen size={18} className="text-gray-400" />
                      )}
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {book.name}
                      </h3>
                      {book.category && (
                        <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                          {book.category}
                        </span>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                          {book.price && book.price > 0 ? `₹${book.price}` : "Free"}
                        </span>
                        {book.fileUrl && (
                          <a
                            href={book.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 text-[10px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Download size={10} /> Get File
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
