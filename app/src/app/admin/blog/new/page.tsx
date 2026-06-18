import { prisma } from "@/lib/prisma";
import { BlogForm } from "@/components/admin/blog-form";

export const dynamic = "force-dynamic";

export default async function NewBlogPostPage() {
  const categories = await prisma.blogCategory.findMany({
    orderBy: { name: "asc" },
  });

  return <BlogForm categories={categories} mode="create" />;
}
