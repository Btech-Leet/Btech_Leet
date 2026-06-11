import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { blogPostSchema } from "@/lib/validations";
import { requireAdminOrEditor, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError, generateReadTime } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({
    where: { OR: [{ slug }, { id: slug }], status: "PUBLISHED" },
    include: { category: true },
  });
  if (!post) return apiError("Post not found", 404);

  await prisma.blogPost.update({ where: { id: post.id }, data: { views: { increment: 1 } } });
  return apiResponse(post);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireAdminOrEditor(req);
  if (isAuthResponse(auth)) return auth;

  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({ where: { OR: [{ slug }, { id: slug }] } });
  if (!post) return apiError("Post not found", 404);

  const body = await req.json();
  const parsed = blogPostSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0].message, 422);

  const data = parsed.data;
  if (data.content) data.readTime = generateReadTime(data.content);
  if (data.status === "PUBLISHED" && !post.publishedAt && !data.publishedAt) {
    data.publishedAt = new Date().toISOString();
  }

  const updated = await prisma.blogPost.update({ where: { id: post.id }, data: data as any });
  return apiResponse(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireAdminOrEditor(req);
  if (isAuthResponse(auth)) return auth;

  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({ where: { OR: [{ slug }, { id: slug }] } });
  if (!post) return apiError("Post not found", 404);

  await prisma.blogPost.delete({ where: { id: post.id } });
  return apiResponse(null, "Post deleted");
}
