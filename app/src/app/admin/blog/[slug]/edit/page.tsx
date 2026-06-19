import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BlogForm } from "@/components/admin/blog-form";

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [post, categories] = await Promise.all([
    prisma.blogPost.findFirst({
      where: { OR: [{ slug }, { id: slug }] },
    }),
    prisma.blogCategory.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  if (!post) notFound();

  return (
    <BlogForm
      categories={categories}
      initialData={{
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || "",
        content: post.content,
        categoryId: post.categoryId || "",
        coverImage: post.coverImage || "",
        tags: post.tags,
        authorName: post.authorName || "",
        status: post.status,
        featured: post.featured,
      }}
      mode="edit"
    />
  );
}
