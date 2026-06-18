import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { blogPostSchema } from "@/lib/validations";
import { requireAdminOrEditor, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError, slugify, getPaginationParams, generateReadTime } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const { skip, limit, page } = getPaginationParams(searchParams);
  const categoryId = searchParams.get("categoryId");
  const featured = searchParams.get("featured");
  const status = searchParams.get("status") || "PUBLISHED";
  const tag = searchParams.get("tag");
  const q = searchParams.get("q");

  const where: Record<string, unknown> = { status };
  if (categoryId) where.categoryId = categoryId;
  if (featured === "true") where.featured = true;
  if (tag) where.tags = { has: tag };
  if (q) where.title = { contains: q, mode: "insensitive" };

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      include: { category: { select: { name: true, slug: true } } },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
      skip,
      take: limit,
    }),
    prisma.blogPost.count({ where }),
  ]);

  return apiResponse({ posts, total, page, limit, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminOrEditor(req);
  if (isAuthResponse(auth)) return auth;

  const body = await req.json();
  const parsed = blogPostSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0].message, 422);

  const data = parsed.data;
  if (!data.slug) data.slug = slugify(data.title);

  const existing = await prisma.blogPost.findUnique({ where: { slug: data.slug } });
  if (existing) data.slug = `${data.slug}-${Date.now()}`;

  if (!data.readTime) data.readTime = generateReadTime(data.content);
  if (data.status === "PUBLISHED" && !data.publishedAt) {
    data.publishedAt = new Date().toISOString();
  }

  const post = await prisma.blogPost.create({ data: data as any });
  return apiResponse(post, "Blog post created", 201);
}
