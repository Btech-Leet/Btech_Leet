import Link from "next/link";
import { prisma } from "@/lib/prisma";

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

  // Curated styles matching design assets
  const cardGradients = [
    "from-orange-500/30 via-orange-600/20 to-transparent",
    "from-blue-500/30 via-blue-600/20 to-transparent",
    "from-teal-500/30 via-teal-600/20 to-transparent",
  ];

  const categoryBadgeColors = [
    "bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800",
    "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800",
    "bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 border-teal-200 dark:border-teal-800",
  ];

  const iconNames = ["book_4", "menu_book", "data_object"];

  return (
    <section className="py-xxl bg-slate-100/50 dark:bg-slate-900/50 px-margin-mobile md:px-margin-desktop border-b border-slate-200 dark:border-slate-800 transition-colors duration-300" aria-labelledby="books-heading">
      <div className="max-w-container-max mx-auto">
        <div className="text-center mb-xl max-w-2xl mx-auto">
          <h2 id="books-heading" className="text-headline-lg-mobile md:text-headline-lg font-headline-lg-mobile md:font-headline-lg text-slate-900 dark:text-white mb-sm transition-colors duration-300">
            Premium Study Materials
          </h2>
          <p className="text-body-md font-body-md text-slate-650 dark:text-slate-400 transition-colors duration-300">
            Curated resources, high-yield notes, and recommended books to accelerate your preparation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {books.map((book, idx) => {
            const gradient = cardGradients[idx % cardGradients.length];
            const badgeColor = categoryBadgeColors[idx % categoryBadgeColors.length];
            const iconName = iconNames[idx % iconNames.length];
            const isFree = !book.price || book.price === 0;

            return (
              <div key={book.id} className="relative group h-full">
                <div className={`absolute -inset-1 bg-gradient-to-br ${gradient} rounded-3xl blur-xl opacity-40 group-hover:opacity-100 transition duration-500`} />
                <div className="relative bg-white dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col h-full transform group-hover:-translate-y-1 transition-all duration-500">
                  
                  {/* Card Cover */}
                  <div className="h-48 bg-slate-100 dark:bg-slate-800/50 relative flex items-center justify-center p-6 transition-colors duration-300">
                    <div className={`absolute top-4 left-4 border text-[10px] uppercase font-bold px-2 py-0.5 rounded ${badgeColor}`}>
                      {book.category || (isFree ? "Notes" : "Book")}
                    </div>
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.name}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-6xl text-slate-400 opacity-50" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {iconName}
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-lg flex flex-col flex-1">
                    <h3 className="text-headline-md font-headline-md text-slate-900 dark:text-white mb-xs group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
                      {book.name}
                    </h3>
                    <p className="text-body-md font-body-md text-slate-650 dark:text-slate-400 mb-md flex-1 line-clamp-3 transition-colors duration-300">
                      {book.description || "No description provided."}
                    </p>

                    {/* Action buttons */}
                    <div className="flex gap-3 mt-auto">
                      {isFree ? (
                        book.fileUrl ? (
                          <a
                            href={`/api/books/download/${book.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-orange-50 dark:bg-orange-700/20 text-orange-750 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30 hover:bg-orange-100 dark:hover:bg-orange-700/40 px-4 py-2 rounded-lg text-label-md font-label-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">download</span> Download
                          </a>
                        ) : (
                          <Link
                            href={`/books/${book.slug}`}
                            className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 rounded-lg text-label-md font-label-md transition-colors text-center flex items-center justify-center"
                          >
                            View Details
                          </Link>
                        )
                      ) : (
                        <Link
                          href={`/books/${book.slug}`}
                          className="flex-1 bg-blue-50 dark:bg-blue-700/20 text-blue-750 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 hover:bg-blue-100 dark:hover:bg-blue-700/40 px-4 py-2 rounded-lg text-label-md font-label-md transition-colors flex items-center justify-center gap-2 text-center"
                        >
                          <span className="material-symbols-outlined text-[18px]">shopping_cart</span> Buy Now
                        </Link>
                      )}
                      
                      <Link
                        href={`/books/${book.slug}`}
                        className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 rounded-lg text-label-md font-label-md transition-colors text-center flex items-center justify-center"
                      >
                        Details
                      </Link>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
