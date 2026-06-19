import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Clock, Eye, Calendar } from "lucide-react";
import { parseMarkdown } from "@/lib/markdown";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await prisma.blogPost.findFirst({ where: { OR: [{ slug }, { id: slug }], status: "PUBLISHED" } });
    if (!post) return { title: "Post Not Found" };
    return {
      title: post.metaTitle || post.title,
      description: post.metaDesc || post.excerpt || undefined,
      openGraph: { title: post.title, description: post.excerpt || undefined, images: post.coverImage ? [post.coverImage] : [] },
    };
  } catch (err) {
    console.error("Failed to load metadata for blog post:", err);
    return { title: "Blog Post" };
  }
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  let post = null;
  try {
    post = await prisma.blogPost.findFirst({
      where: { OR: [{ slug }, { id: slug }], status: "PUBLISHED" },
      include: { category: true },
    });
  } catch (err) {
    console.error("Failed to fetch blog post details:", err);
  }

  if (!post) notFound();

  // Increment views
  try {
    await prisma.blogPost.update({ where: { id: post.id }, data: { views: { increment: 1 } } });
  } catch (err) {
    console.error("Failed to increment blog post views:", err);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-blue-600">Blog</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-200 truncate max-w-[200px]">{post.title}</span>
      </nav>

      <article>
        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.category && <Badge variant="secondary">{post.category.name}</Badge>}
            {(post.tags as string[]).map((tag: string) => (
              <span key={tag} className="text-xs text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">{tag}</span>
            ))}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-5">{post.excerpt}</p>
          )}

          <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500 dark:text-gray-400 pb-6 border-b border-gray-200 dark:border-gray-800">
            {post.authorName && <span className="font-medium text-gray-700 dark:text-gray-300">{post.authorName}</span>}
            {post.publishedAt && (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} aria-hidden="true" />
                <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>
              </span>
            )}
            {post.readTime && (
              <span className="flex items-center gap-1.5"><Clock size={14} aria-hidden="true" /> {post.readTime} min read</span>
            )}
            <span className="flex items-center gap-1.5"><Eye size={14} aria-hidden="true" /> {post.views} views</span>
          </div>
        </header>

        {post.coverImage && (
          <div className="mb-8 rounded-2xl overflow-hidden">
            <img src={post.coverImage} alt={post.title} className="w-full h-64 sm:h-80 object-cover" loading="lazy" />
          </div>
        )}

        <div 
          className="prose prose-gray dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-img:rounded-xl text-gray-700 dark:text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: parseMarkdown(post.content) }}
        />

        <footer className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline" aria-label="Back to blog">
            <ArrowLeft size={14} aria-hidden="true" /> Back to Blog
          </Link>
        </footer>
      </article>
    </div>
  );
}
