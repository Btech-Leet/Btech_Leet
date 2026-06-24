import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { PenSquare, Clock, Eye, Search, Filter, BookOpenText } from "lucide-react";

export const dynamic = "force-dynamic";

import { mergeSeoMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const fallback: Metadata = {
    title: "BTech LEET Blog – Tips, Strategies & Updates",
    description: "Read expert tips, preparation strategies, and the latest updates about BTech Lateral Entry Exam (LEET).",
  };
  return mergeSeoMetadata("/blog", fallback);
}

async function getPosts(params: Record<string, string>) {
  const where: Record<string, unknown> = { status: "PUBLISHED" };
  if (params.categoryId) where.categoryId = params.categoryId;
  if (params.q) where.title = { contains: params.q, mode: "insensitive" };

  try {
    return await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: { category: { select: { name: true, slug: true } } },
        orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      }),
      prisma.blogCategory.findMany({ orderBy: { name: "asc" } }),
    ]);
  } catch (err) {
    console.error("Failed to load blog posts:", err);
    return [[], []];
  }
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const [posts, categories] = await getPosts(params);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Premium Header */}
      <div className="relative py-16 sm:py-24 overflow-hidden bg-slate-900 dark:bg-slate-950">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] -z-10"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-6">
            <BookOpenText size={14} className="text-rose-400" />
            <span className="text-sm font-bold text-white tracking-wide uppercase">Knowledge Base</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            LEET <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-purple-400">Journal</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Expert tips, preparation strategies, and the latest news about B.Tech Lateral Entry Exams across India.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8 relative z-20">
        {/* Filters Box */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-200 dark:border-slate-800 mb-12">
          <form className="flex flex-col md:flex-row gap-4" method="GET">
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-400 group-focus-within:text-rose-500 transition-colors" />
              </div>
              <input
                name="q"
                defaultValue={params.q}
                placeholder="Search articles..."
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                aria-label="Search articles"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <select
                name="categoryId"
                defaultValue={params.categoryId || ""}
                className="px-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all appearance-none cursor-pointer pr-10 min-w-[200px]"
                aria-label="Filter by category"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: `right 1rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.2em 1.2em` }}
              >
                <option value="">All Categories</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <button
                type="submit"
                className="px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95"
                aria-label="Search"
              >
                <Filter size={16} /> Filter
              </button>
            </div>
          </form>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Showing {posts.length} article{posts.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <PenSquare size={24} className="text-slate-400" />
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">No articles found</p>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-500/10 px-6 py-2.5 rounded-full transition-colors">
              Clear all filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post: any) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:border-rose-500/30 dark:hover:border-rose-500/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative"
                aria-label={`Read ${post.title}`}
              >
                {/* Subtle hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0 pointer-events-none" />
                
                <div className="p-6 flex-1 relative z-10 flex flex-col">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.featured && (
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-gradient-to-r from-rose-500 to-purple-500 text-white shadow-sm">
                        Featured
                      </span>
                    )}
                    {post.category && (
                      <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {post.category.name}
                      </span>
                    )}
                  </div>
                  
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 leading-snug group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  
                  {post.excerpt && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed flex-1">
                      {post.excerpt}
                    </p>
                  )}
                </div>

                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 relative z-10 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-4">
                    {post.publishedAt && (
                      <time dateTime={post.publishedAt.toISOString()}>
                        {formatDate(post.publishedAt)}
                      </time>
                    )}
                    {post.readTime && (
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} className="text-rose-400" aria-hidden="true" /> {post.readTime} min
                      </span>
                    )}
                  </div>
                  <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                    <Eye size={14} className="text-slate-400" aria-hidden="true" /> {post.views}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
