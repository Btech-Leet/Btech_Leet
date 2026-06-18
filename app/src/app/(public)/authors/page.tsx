import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PenTool, GraduationCap, Briefcase, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Authors & Educators | BTech LEET",
  description: "Meet the authors and educators who create study materials, books, and notes for B.Tech Lateral Entry Examination preparation.",
};

export default async function AuthorsPage() {
  const authors = await prisma.author.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { books: true } },
    },
  });

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-20 bg-gradient-to-b from-emerald-50/50 to-transparent dark:from-emerald-950/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
            <PenTool size={14} /> Our Authors
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Authors & Educators
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-500 dark:text-gray-400">
            The brilliant minds behind our study materials, textbooks, and preparation resources for B.Tech Lateral Entry exams.
          </p>
        </div>
      </section>

      {/* Authors Grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {authors.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center text-gray-500 shadow-sm max-w-lg mx-auto">
            <PenTool className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={48} />
            <h3 className="font-bold text-gray-800 dark:text-gray-200">Authors Coming Soon</h3>
            <p className="text-xs text-gray-500 mt-1">We are onboarding authors. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {authors.map((author) => (
              <div
                key={author.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <div className="p-6 sm:p-8 space-y-5">
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-100 dark:border-emerald-900/50 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-500">
                      {author.photo ? (
                        <img src={author.photo} alt={author.name} className="w-full h-full object-cover" />
                      ) : (
                        <PenTool className="text-emerald-500" size={28} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg sm:text-xl">
                        {author.name}
                      </h3>
                      {author.designation && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                          {author.designation}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5">
                        {author._count.books > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-blue-500 font-medium">
                            <BookOpen size={12} /> {author._count.books} {author._count.books === 1 ? "Book" : "Books"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {author.experience && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                      <Briefcase size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{author.experience}</p>
                    </div>
                  )}

                  {author.biography && (
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      {author.biography}
                    </p>
                  )}
                </div>

                {author.linkedinUrl && (
                  <div className="px-6 py-3.5 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800/80 flex justify-center">
                    <a
                      href={author.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg> View LinkedIn Profile
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
