import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BookOpen, Calendar, Download, FileText, ArrowLeft, Star, Tag, User, ShieldCheck, AlertCircle } from "lucide-react";
import PurchaseButton from "@/components/books/purchase-button";

interface BookPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { slug } = await params;
  const book = await prisma.book.findUnique({
    where: { slug, active: true },
  });

  if (!book) {
    return {
      title: "Book Not Found | BTech LEET",
    };
  }

  return {
    title: `${book.name} - Books & Study Notes | BTech LEET`,
    description: book.description || `Download ${book.name} study notes and preparation material for B.Tech Lateral Entry Exam.`,
  };
}

export default async function BookDetailPage({ params }: BookPageProps) {
  const { slug } = await params;

  // 1. Fetch book data
  const book = await prisma.book.findUnique({
    where: { slug, active: true },
    include: {
      author: true,
    },
  });

  if (!book) {
    notFound();
  }

  // 2. Fetch authenticated user if logged in
  const user = await getAuthUser();
  const isLoggedIn = !!user;

  // 3. Determine if user has access to download the file
  const isFree = !book.price || book.price <= 0;
  let hasAccess = isFree;

  if (isLoggedIn && user) {
    // Admin or Editor can always access
    if (user.role === "ADMIN" || user.role === "EDITOR") {
      hasAccess = true;
    } else if (!isFree) {
      // Check for successful standalone transaction
      const transaction = await prisma.transaction.findFirst({
        where: {
          userId: user.userId,
          purchaseType: "BOOK",
          purchaseItemId: book.id,
          status: "SUCCESSFUL",
        },
      });
      hasAccess = !!transaction;
    }
  }

  // 4. Fetch related books (same category, excluding current)
  const relatedBooks = await prisma.book.findMany({
    where: {
      category: book.category,
      active: true,
      NOT: { id: book.id },
    },
    take: 3,
    include: {
      author: { select: { name: true } },
    },
  });

  // 5. Schema markup
  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": book.name,
    "image": book.coverImage || "",
    "description": book.description || "",
    "offers": {
      "@type": "Offer",
      "price": book.price || 0,
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
    },
  };

  return (
    <>
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />

      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <Link
            href="/books"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-8 group transition-colors"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Digital Library
          </Link>

          {/* Book Info Header / Detail Card */}
          <div className="relative group">
            {/* Ambient Background Glow for the Card */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
            
            <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-10 bg-white/90 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
              
              {/* Book Cover */}
              <div className="lg:col-span-1 flex flex-col items-center">
                <div className="relative w-full aspect-[3/4] max-w-[280px] rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-2xl flex items-center justify-center overflow-hidden group/cover">
                  {book.coverImage ? (
                    <>
                      {/* Ambient Cover Glow */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10 opacity-0 group-hover/cover:opacity-100 transition-opacity duration-300" />
                      <img
                        src={book.coverImage}
                        alt={book.name}
                        className="w-full h-full object-cover group-hover/cover:scale-105 transition-transform duration-700 ease-out"
                      />
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <BookOpen size={64} className="text-orange-500/50 animate-pulse" />
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">No Cover Available</span>
                    </div>
                  )}

                  {book.featured && (
                    <span className="absolute top-4 right-4 z-20 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold shadow-lg shadow-orange-500/30">
                      <Star size={10} fill="currentColor" /> Featured
                    </span>
                  )}
                </div>

                {/* Status details */}
                <div className="mt-6 flex flex-col gap-1.5 text-center">
                  {book.fileSize && (
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">
                      File Size: {(book.fileSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                  )}
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">
                    Format: PDF Document
                  </span>
                </div>
              </div>

              {/* Book Details */}
              <div className="lg:col-span-2 flex flex-col justify-between space-y-8">
                <div className="space-y-5">
                  {/* Meta details */}
                  <div className="flex items-center gap-3 flex-wrap text-xs">
                    {book.category && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20 font-bold shadow-sm">
                        <Tag size={12} />
                        {book.category}
                      </span>
                    )}
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-medium">
                      <Calendar size={14} className="text-gray-400" />
                      Added: {new Date(book.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                    </span>
                  </div>

                  {/* Name */}
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.15]">
                    {book.name}
                  </h1>

                  {/* Author Info */}
                  {book.author && (
                    <div className="flex items-center gap-4 py-3 border-y border-gray-100 dark:border-gray-800/60">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                        {book.author.photo ? (
                          <img src={book.author.photo} alt={book.author.name} className="w-full h-full object-cover" />
                        ) : (
                          <User size={18} className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-500 font-bold uppercase tracking-wider mb-0.5">Prepared by</p>
                        <Link
                          href={`/author/${book.author.slug}`}
                          className="text-sm font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:underline"
                        >
                          {book.author.name}
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="space-y-2.5 pt-2">
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <FileText size={14} /> Description
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {book.description || "No description provided for this study material."}
                    </p>
                  </div>
                </div>

                {/* Purchase / Action Section */}
                <div className="pt-8 border-t border-gray-100 dark:border-gray-800/60">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 rounded-2xl bg-gray-50 dark:bg-gray-950/60 border border-gray-200 dark:border-gray-800 shadow-inner">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Pricing</span>
                      <span className={`text-4xl font-black ${isFree ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-white"}`}>
                        {isFree ? "FREE" : `₹${book.price}`}
                      </span>
                    </div>

                    <div className="w-full sm:max-w-[280px]">
                      {hasAccess ? (
                        <div className="space-y-2.5">
                          <a
                            href={`/api/books/download/${book.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-500/25 active:scale-[0.98] overflow-hidden group"
                          >
                            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-12" />
                            <Download size={20} className="relative z-10" />
                            <span className="relative z-10 text-[15px]">Download PDF</span>
                          </a>
                          {!isFree && (
                            <div className="flex items-center gap-1.5 justify-center text-[11px] text-green-600 dark:text-green-400 font-bold">
                              <ShieldCheck size={14} />
                              Purchased copy unlocked
                            </div>
                          )}
                        </div>
                      ) : (
                        <PurchaseButton
                          bookId={book.id}
                          bookName={book.name}
                          bookPrice={book.price || 0}
                          isLoggedIn={isLoggedIn}
                        />
                      )}
                    </div>
                  </div>

                  {hasAccess && (
                    <div className="mt-4 flex items-start gap-2 px-2 text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                      <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">
                        Sharing your download link is strictly prohibited. Your downloads are watermark-protected and securely logged for safety.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Related books section */}
          {relatedBooks.length > 0 && (
            <div className="mt-20 space-y-8">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-500/10 rounded-lg">
                  <FileText size={20} className="text-orange-600 dark:text-orange-500" />
                </div>
                Related Study Materials
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedBooks.map((rb: any) => (
                  <Link
                    key={rb.id}
                    href={`/books/${rb.slug}`}
                    className="group flex flex-col bg-white dark:bg-gray-900/40 hover:bg-gray-50 dark:hover:bg-gray-900/60 border border-gray-200 dark:border-gray-800 hover:border-orange-500/50 rounded-2xl overflow-hidden p-5 transition-all duration-300 shadow-sm hover:shadow-xl"
                  >
                    <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-950 border border-gray-200 dark:border-gray-850 flex items-center justify-center relative">
                      {rb.coverImage ? (
                        <img src={rb.coverImage} alt={rb.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                      ) : (
                        <BookOpen size={40} className="text-gray-300 dark:text-gray-800" />
                      )}
                    </div>
                    <div className="mt-4 space-y-1.5">
                      <h4 className="font-bold text-gray-900 dark:text-gray-200 text-sm sm:text-base line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{rb.name}</h4>
                      {rb.author && (
                        <p className="text-[11px] text-gray-500 font-medium">by {rb.author.name}</p>
                      )}
                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100 dark:border-gray-800/60">
                        <span className={`text-sm font-black ${rb.price && rb.price > 0 ? "text-gray-900 dark:text-white" : "text-green-600 dark:text-green-400"}`}>
                          {rb.price && rb.price > 0 ? `₹${rb.price}` : "Free"}
                        </span>
                        {rb.category && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-800">
                            {rb.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
