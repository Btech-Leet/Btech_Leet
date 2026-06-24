import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { BookOpen, Download, ShoppingCart, ChevronRight, Star } from "lucide-react";

async function getBooks() {
  try {
    return await prisma.book.findMany({
      where: { active: true },
      orderBy: [
        { featured: "desc" },
        { createdAt: "desc" },
      ],
      take: 3,
    });
  } catch (err) {
    console.error("Failed to fetch books for homepage:", err);
    return [];
  }
}

export async function BooksSection() {
  const books = await getBooks();

  if (books.length === 0) return null;

  const cardGradients = [
    "from-orange-500/20 via-orange-500/5 to-transparent",
    "from-blue-500/20 via-blue-500/5 to-transparent",
    "from-teal-500/20 via-teal-500/5 to-transparent",
  ];

  const badgeColors = [
    "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-slate-50 dark:bg-slate-950/50 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
              Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Study Materials</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Curated resources, high-yield notes, and recommended books to accelerate your preparation.
            </p>
          </div>
          <Link
            href="/books"
            className="group hidden md:flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-6 py-3 rounded-full border border-slate-200 dark:border-slate-800 hover:border-orange-500/50 transition-all shadow-sm hover:shadow-md"
          >
            View Library
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform text-orange-500" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {books.map((book, idx) => {
            const gradient = cardGradients[idx % cardGradients.length];
            const badgeColor = badgeColors[idx % badgeColors.length];
            const isFree = !book.price || book.price === 0;

            return (
              <div key={book.id} className="group relative flex flex-col bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Card Cover Area */}
                <div className="relative h-56 bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
                  <div className={`absolute top-4 left-4 z-10 text-[10px] uppercase font-black px-3 py-1 rounded-full border backdrop-blur-md ${badgeColor}`}>
                    {book.category || (isFree ? "Notes" : "Book")}
                  </div>
                  {book.featured && (
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-1 text-[10px] uppercase font-black px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
                      <Star size={10} fill="currentColor" /> Featured
                    </div>
                  )}
                  {book.coverImage ? (
                    <Image
                      src={book.coverImage}
                      alt={book.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
                    />
                  ) : (
                    <BookOpen size={48} className="text-slate-300 dark:text-slate-800" />
                  )}
                </div>

                {/* Card Content Area */}
                <div className="relative p-6 flex flex-col flex-1 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-t border-slate-100 dark:border-slate-800/50">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {book.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 flex-1 line-clamp-2">
                    {book.description || "No description provided."}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Price</span>
                      <span className={`text-xl font-black ${isFree ? "text-green-600 dark:text-green-400" : "text-slate-900 dark:text-white"}`}>
                        {isFree ? "FREE" : `₹${book.price}`}
                      </span>
                    </div>

                    <Link
                      href={`/books/${book.slug}`}
                      className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 shadow-sm group-hover:shadow-md ${
                        isFree 
                          ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-500 hover:text-white dark:hover:bg-green-500 dark:hover:text-white" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-orange-500 hover:text-white border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {isFree ? <Download size={20} className="group-hover:animate-bounce" /> : <ShoppingCart size={20} className="group-hover:-rotate-12 transition-transform" />}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/books"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-8 py-4 rounded-full border border-slate-200 dark:border-slate-800 active:scale-95 transition-all"
          >
            View Full Library
            <ChevronRight size={16} className="text-orange-500" />
          </Link>
        </div>
      </div>
    </section>
  );
}
