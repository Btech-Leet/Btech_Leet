import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ChevronRight, Calendar } from "lucide-react";

async function getBlogPosts() {
  try {
    return await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      include: { category: { select: { name: true, slug: true } } },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      take: 3,
    });
  } catch (err) {
    console.error("Failed to load blog posts for homepage:", err);
    return [];
  }
}

export async function BlogSection() {
  const posts = await getBlogPosts();

  if (posts.length === 0) return null;

  const cardGradients = [
    "from-orange-500/20 via-orange-500/5 to-transparent",
    "from-blue-500/20 via-blue-500/5 to-transparent",
    "from-teal-500/20 via-teal-500/5 to-transparent",
  ];

  const defaultImages = [
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800"
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
              Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Insights</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Strategies, updates, and advice from academic experts.
            </p>
          </div>
          <Link
            href="/blog"
            className="group hidden md:flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 px-6 py-3 rounded-full border border-slate-200 dark:border-slate-800 hover:border-orange-500/50 transition-all shadow-sm hover:shadow-md"
          >
            View All Articles
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform text-orange-500" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post: any, idx: number) => {
            const gradient = cardGradients[idx % cardGradients.length];
            const coverImage = post.coverImage || defaultImages[idx % defaultImages.length];

            return (
              <div key={post.id} className="group relative flex flex-col bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Aspect Cover Image */}
                <Link href={`/blog/${post.slug}`} className="relative overflow-hidden aspect-[16/10] bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 block">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                  <Image
                    alt={post.title}
                    className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                    src={coverImage}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  {post.category && (
                    <div className="absolute top-4 left-4 z-20 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-[10px] uppercase font-bold px-3 py-1 rounded-full">
                      {post.category.name}
                    </div>
                  )}
                </Link>

                {/* Blog Card Body */}
                <div className="p-6 flex flex-col flex-1 relative z-10">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium">
                    <Calendar size={14} />
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>
                  
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-6 flex-1">
                    {post.excerpt || "Read full article details on BTech Lateral Entry preparation."}
                  </p>
                  
                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors"
                  >
                    Read Article
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 px-8 py-4 rounded-full border border-slate-200 dark:border-slate-800 active:scale-95 transition-all"
          >
            View All Articles
            <ChevronRight size={16} className="text-orange-500" />
          </Link>
        </div>

      </div>
    </section>
  );
}
