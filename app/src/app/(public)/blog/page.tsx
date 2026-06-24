import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { PenSquare, Clock, Eye, Search, ArrowRight } from "lucide-react";

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">Blog</h1>
        <p className="text-gray-500 dark:text-gray-400">Expert tips, strategies, and LEET exam updates</p>
      </div>

      <form className="flex flex-col sm:flex-row gap-3 mb-8" method="GET">
        <div className="flex flex-1 items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-xl px-4 bg-white dark:bg-gray-900">
          <Search size={15} className="text-gray-400" aria-hidden="true" />
          <input name="q" defaultValue={params.q} placeholder="Search articles..." className="flex-1 py-2.5 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none" aria-label="Search blog posts" />
        </div>
        <select name="categoryId" defaultValue={params.categoryId || ""} className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none" aria-label="Filter by category">
          <option value="">All Categories</option>
          {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors" aria-label="Search">Search</button>
      </form>

      {posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <PenSquare size={40} className="mx-auto mb-4 opacity-30" aria-hidden="true" />
          <p className="text-lg font-medium">No articles yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post: any) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all" aria-label={`Read ${post.title}`}>
              <div className="p-5 flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.featured && <Badge variant="default">Featured</Badge>}
                  {post.category && <Badge variant="secondary">{post.category.name}</Badge>}
                </div>
                <h2 className="font-bold text-gray-900 dark:text-white text-base mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{post.title}</h2>
                {post.excerpt && <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">{post.excerpt}</p>}
              </div>
              <div className="px-5 py-3.5 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                {post.publishedAt && <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>}
                {post.readTime && <span className="flex items-center gap-1"><Clock size={11} aria-hidden="true" /> {post.readTime} min</span>}
                <span className="flex items-center gap-1 ml-auto"><Eye size={11} aria-hidden="true" /> {post.views}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
