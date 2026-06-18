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

      <main className="min-h-screen pt-24 pb-16 bg-gray-950 text-white selection:bg-orange-600 selection:text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <Link
            href="/books"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white mb-8 group transition-colors"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Digital Library
          </Link>

          {/* Book Info Header / Detail Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 bg-gray-900/40 border border-gray-850 rounded-2xl p-6 sm:p-10 backdrop-blur-sm shadow-xl">
            {/* Book Cover */}
            <div className="lg:col-span-1 flex flex-col items-center">
              <div className="relative w-full aspect-[3/4] max-w-[280px] rounded-xl bg-gray-950 border border-gray-800 shadow-2xl flex items-center justify-center overflow-hidden group">
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt={book.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <BookOpen size={64} className="text-orange-500/80 animate-pulse" />
                    <span className="text-xs text-gray-500">No Cover Available</span>
                  </div>
                )}

                {book.featured && (
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/90 text-white text-[10px] font-bold shadow-md">
                    <Star size={10} fill="currentColor" /> Featured
                  </span>
                )}
              </div>

              {/* Status details */}
              <div className="mt-4 flex flex-col gap-1 text-center">
                {book.fileSize && (
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    File Size: {(book.fileSize / 1024 / 1024).toFixed(2)} MB
                  </span>
                )}
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                  Format: PDF Document
                </span>
              </div>
            </div>

            {/* Book Details */}
            <div className="lg:col-span-2 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Meta details */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  {book.category && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-semibold">
                      <Tag size={12} />
                      {book.category}
                    </span>
                  )}
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400 flex items-center gap-1">
                    <Calendar size={12} />
                    Added: {new Date(book.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                  </span>
                </div>

                {/* Name */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  {book.name}
                </h1>

                {/* Author Info */}
                {book.author && (
                  <div className="flex items-center gap-3 py-2 border-y border-gray-850/50">
                    <div className="w-9 h-9 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {book.author.photo ? (
                        <img src={book.author.photo} alt={book.author.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={16} className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Prepared by</p>
                      <Link
                        href={`/author/${book.author.slug}`}
                        className="text-xs font-bold text-orange-400 hover:text-orange-300 hover:underline"
                      >
                        {book.author.name}
                      </Link>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-1.5 pt-2">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description</h3>
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {book.description || "No description provided for this study material."}
                  </p>
                </div>
              </div>

              {/* Purchase / Action Section */}
              <div className="pt-6 border-t border-gray-850/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-5 rounded-2xl bg-gray-950/60 border border-gray-850">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Price</span>
                    <span className={`text-3xl font-black ${isFree ? "text-green-400" : "text-white"}`}>
                      {isFree ? "FREE" : `₹${book.price}`}
                    </span>
                  </div>

                  <div className="w-full sm:max-w-xs">
                    {hasAccess ? (
                      <div className="space-y-2">
                        <a
                          href={`/api/books/download/${book.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-600/20 active:scale-[0.98]"
                        >
                          <Download size={18} />
                          Download PDF / Notes
                        </a>
                        {!isFree && (
                          <div className="flex items-center gap-1 justify-center text-[10px] text-green-400/80 font-medium">
                            <ShieldCheck size={12} />
                            Stand-alone purchased copy unlocked
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
                  <div className="mt-3 flex items-start gap-1.5 px-1 text-[10px] text-gray-500">
                    <AlertCircle size={12} className="text-gray-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Sharing your download link is strictly prohibited. Your downloads are watermark-protected and logged for safety.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Related books section */}
          {relatedBooks.length > 0 && (
            <div className="mt-16 space-y-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText size={18} className="text-orange-500" />
                Related Books & Study Materials
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedBooks.map((rb) => (
                  <Link
                    key={rb.id}
                    href={`/books/${rb.slug}`}
                    className="group flex flex-col bg-gray-900/30 hover:bg-gray-900/50 border border-gray-850 hover:border-gray-800 rounded-xl overflow-hidden p-4 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-950 border border-gray-850 flex items-center justify-center relative">
                      {rb.coverImage ? (
                        <img src={rb.coverImage} alt={rb.name} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300" />
                      ) : (
                        <BookOpen size={36} className="text-gray-800" />
                      )}
                    </div>
                    <div className="mt-3 space-y-1">
                      <h4 className="font-bold text-gray-200 text-xs sm:text-sm line-clamp-2 group-hover:text-white transition-colors">{rb.name}</h4>
                      {rb.author && (
                        <p className="text-[10px] text-gray-500">by {rb.author.name}</p>
                      )}
                      <div className="flex items-center justify-between pt-1">
                        <span className={`text-xs font-extrabold ${rb.price && rb.price > 0 ? "text-white" : "text-green-400"}`}>
                          {rb.price && rb.price > 0 ? `₹${rb.price}` : "Free"}
                        </span>
                        {rb.category && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-800/80 text-gray-400 border border-gray-850">
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
