import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, PenSquare, Edit } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { BlogCategoryManager } from "@/components/admin/blog-category-manager";

export const dynamic = "force-dynamic";

type AdminBlogPost = Awaited<ReturnType<typeof prisma.blogPost.findMany>>[number] & {
  category: { name: string } | null;
};

type AdminBlogCategory = Awaited<ReturnType<typeof prisma.blogCategory.findMany>>[number] & {
  _count: { posts: number };
};

export default async function AdminBlogPage() {
  let posts: AdminBlogPost[] = [];
  let categories: AdminBlogCategory[] = [];
  try {
    [posts, categories] = await Promise.all([
      prisma.blogPost.findMany({
        include: { category: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.blogCategory.findMany({
        include: { _count: { select: { posts: true } } },
        orderBy: { name: "asc" },
      }),
    ]);
  } catch (e) {
    console.error("Failed to fetch blog posts:", e);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PenSquare size={24} className="text-blue-500" />
            Blog Posts
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage articles, news, and updates</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Write Post
        </Link>
      </div>

      <BlogCategoryManager categories={categories} />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Views</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500 dark:text-slate-500">
                    No blog posts written yet.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-700 dark:text-slate-200">{post.title}</p>
                      {post.authorName && <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">By {post.authorName}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-slate-500 dark:text-slate-400">{post.category?.name || "Uncategorized"}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${post.status === 'PUBLISHED' ? 'bg-green-900/30 text-green-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                        {post.status}
                      </span>
                      {post.featured && <span className="ml-2 inline-flex px-2 py-1 rounded bg-blue-900/30 text-blue-400 text-xs">Featured</span>}
                    </td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                      {post.views}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link href={`/admin/blog/${post.slug}/edit`} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors">
                          <Edit size={16} />
                        </Link>
                        <DeleteButton endpoint={`/api/blog/${post.slug}`} label={post.title} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
