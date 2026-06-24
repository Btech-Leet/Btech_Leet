import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BookOpen, Star, Download, User, ArrowRight, BookMarked } from "lucide-react";

export const dynamic = "force-dynamic";

import { mergeSeoMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const fallback: Metadata = {
    title: "Books & Study Notes | BTech LEET",
    description: "Download free and premium study materials, books, and notes for B.Tech Lateral Entry Examination preparation. Mathematics, Physics, English, and more.",
  };
  return mergeSeoMetadata("/books", fallback);
}

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Premium Header */}
      <div className="relative py-16 sm:py-24 overflow-hidden bg-slate-900 dark:bg-slate-950">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] -z-10"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-6">
            <BookMarked size={14} className="text-orange-400" />
            <span className="text-sm font-bold text-white tracking-wide uppercase">Study Materials</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Books & <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Notes</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Curated study materials and preparation resources by top educators to help you crack B.Tech Lateral Entry Exams.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {books.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-200 dark:border-slate-800 border-dashed max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen size={32} className="text-slate-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Books Coming Soon</h3>
            <p className="text-slate-500 dark:text-slate-400 text-lg">We are preparing premium study materials. Stay tuned!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {books.map((book: any) => (
              <div
                key={book.id}
                className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-xl hover:border-orange-500/30 dark:hover:border-orange-500/30 transition-all duration-300 hover:-translate-y-1 relative"
              >
                {/* Featured badge */}
                {book.featured && (
                  <div className="absolute top-4 right-4 z-20">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-wider shadow-lg">
                      <Star size={10} className="fill-white" /> Featured
                    </span>
                  </div>
                )}

                {/* Subtle hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />

                {/* Cover Image */}
                <Link href={`/books/${book.slug}`} className="relative h-56 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden z-10 border-b border-slate-200 dark:border-slate-800">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={book.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
                      <BookOpen className="text-slate-300 dark:text-slate-500" size={32} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>

                <div className="p-6 flex-1 flex flex-col z-10">
                  <div className="mb-4">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg line-clamp-2 leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      <Link href={`/books/${book.slug}`} className="before:absolute before:inset-0">
                        {book.name}
                      </Link>
                    </h3>
                    {book.author && (
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-2">
                        <User size={14} className="text-orange-500" /> {book.author.name}
                      </p>
                    )}
                  </div>

                  {book.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 mb-6 flex-1">
                      {book.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mb-6 flex-wrap">
                    {book.category && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                        {book.category}
                      </span>
                    )}
                  </div>

                  {/* Price / Action footer */}
                  <div className="pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto">
                    <span className={`text-xl font-black ${
                      book.price && book.price > 0
                        ? "text-slate-900 dark:text-white"
                        : "text-green-600 dark:text-green-400"
                    }`}>
                      {book.price && book.price > 0 ? `₹${book.price}` : "Free"}
                    </span>

                    {book.price && book.price > 0 ? (
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 group-hover:bg-orange-500 dark:group-hover:bg-orange-500 group-hover:text-white transition-colors shadow-md relative z-20">
                        <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    ) : (
                      book.fileUrl && (
                        <a
                          href={`/api/books/download/${book.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 group-hover:bg-blue-600 dark:group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-md relative z-20"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Download size={18} />
                        </a>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
