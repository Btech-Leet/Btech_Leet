import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOrEditor, isAuthResponse } from "@/lib/middleware";
import { apiError, apiResponse, slugify } from "@/lib/utils";
import { blogCategorySchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdminOrEditor(req);
  if (isAuthResponse(auth)) return auth;

  const categories = await prisma.blogCategory.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });

  return apiResponse(categories);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminOrEditor(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const body = await req.json();
    const parsed = blogCategorySchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 422);

    const data = parsed.data;
    const slug = data.slug ? slugify(data.slug) : slugify(data.name);
    if (!slug) return apiError("Category slug is required", 422);

    const existing = await prisma.blogCategory.findFirst({
      where: { OR: [{ name: data.name }, { slug }] },
    });
    if (existing) return apiError("A blog category with this name or slug already exists", 409);

    const category = await prisma.blogCategory.create({
      data: {
        name: data.name.trim(),
        slug,
      },
    });

    return apiResponse(category, "Blog category created", 201);
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Failed to create blog category", 500);
  }
}
