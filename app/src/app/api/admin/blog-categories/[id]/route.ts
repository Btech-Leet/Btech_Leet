import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOrEditor, isAuthResponse } from "@/lib/middleware";
import { apiError, apiResponse } from "@/lib/utils";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminOrEditor(req);
  if (isAuthResponse(auth)) return auth;

  const { id } = await params;
  const category = await prisma.blogCategory.findUnique({
    where: { id },
    include: { _count: { select: { posts: true } } },
  });

  if (!category) return apiError("Blog category not found", 404);
  if (category._count.posts > 0) {
    return apiError("Move or delete posts in this category before deleting it", 409);
  }

  await prisma.blogCategory.delete({ where: { id } });
  return apiResponse(null, "Blog category deleted");
}
