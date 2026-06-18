import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BookOpen, Star, Download, User } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Books & Study Notes | BTech LEET",
  description: "Download free and premium study materials, books, and notes for B.Tech Lateral Entry Examination preparation. Mathematics, Physics, English, and more.",
};

export default async function BooksPage() {
  const books = await prisma.book.findMany({
    where: { active: true },
    orderBy: [
      { featured: "desc" },
      { createdAt: "desc" },
    ],
    include: {
      author: { select: { id: true, name: true, slug: true } },
    },
  });

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-20 bg-gradient-to-b from-orange-50/50 to-transparent dark:from-orange-950/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold border border-orange-500/20">
            <BookOpen size={14} /> Study Materials
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Books & Study Notes
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-500 dark:text-gray-400">
            Curated study materials and preparation resources by top educators to help you crack B.Tech Lateral Entry Exams.
          </p>
        </div>
      </section>

      {/* Books Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {books.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center text-gray-500 shadow-sm max-w-lg mx-auto">
            <BookOpen className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={48} />
            <h3 className="font-bold text-gray-800 dark:text-gray-200">Books Coming Soon</h3>
            <p className="text-xs text-gray-500 mt-1">We are preparing study materials. Stay tuned!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-300 group relative"
              >
                {/* Featured badge */}
                {book.featured && (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-[10px] font-bold shadow-sm">
                      <Star size={10} fill="currentColor" /> Featured
                    </span>
                  </div>
                )}

                {/* Cover Image */}
                <Link href={`/books/${book.slug}`} className="relative h-44 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-850 flex items-center justify-center overflow-hidden block">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={book.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <BookOpen className="text-gray-300 dark:text-gray-700" size={56} />
                  )}
                </Link>

                <div className="p-5 space-y-3 flex-1">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base line-clamp-2 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                      <Link href={`/books/${book.slug}`}>{book.name}</Link>
                    </h3>
                    {book.author && (
                      <Link
                        href={`/authors/${book.author.slug}`}
                        className="text-xs text-orange-600 dark:text-orange-400 font-semibold mt-1 flex items-center gap-1 hover:underline hover:text-orange-700 dark:hover:text-orange-300"
                      >
                        <User size={11} /> {book.author.name}
                      </Link>
                    )}
                  </div>

                  {book.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                      {book.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    {book.category && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                        {book.category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price / Action footer */}
                <div className="px-5 py-3.5 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                  <span className={`text-sm font-extrabold ${
                    book.price && book.price > 0
                      ? "text-gray-900 dark:text-white"
                      : "text-green-600 dark:text-green-400"
                  }`}>
                    {book.price && book.price > 0 ? `₹${book.price}` : "Free"}
                  </span>

                  {book.price && book.price > 0 ? (
                    <Link
                      href={`/books/${book.slug}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors"
                    >
                      Get Notes
                    </Link>
                  ) : (
                    book.fileUrl && (
                      <a
                        href={`/api/books/download/${book.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                      >
                        <Download size={12} /> Download
                      </a>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
