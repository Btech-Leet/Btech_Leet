import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { cmsPageSchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  const { id } = await params;
  const page = await prisma.cmsPage.findUnique({ where: { id } });
  if (!page) return apiError("Page not found", 404);

  return apiResponse(page);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const { id } = await params;
    const body = await req.json();

    const parsed = cmsPageSchema.partial().safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const exists = await prisma.cmsPage.findUnique({ where: { id } });
    if (!exists) return apiError("Page not found", 404);

    const updated = await prisma.cmsPage.update({
      where: { id },
      data: parsed.data,
    });

    return apiResponse(updated, "CMS page updated successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to update page", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const { id } = await params;
    const exists = await prisma.cmsPage.findUnique({ where: { id } });
    if (!exists) return apiError("Page not found", 404);

    // Delete featured image from storage
    if (exists.featuredImage) {
      const { deleteFromStorage } = await import("@/lib/storage");
      try {
        const urlObj = new URL(exists.featuredImage);
        const pathParts = urlObj.pathname.split("/storage/v1/object/public/btechleet/");
        if (pathParts.length > 1) {
          const path = decodeURIComponent(pathParts[1]);
          await deleteFromStorage(path);
        }
      } catch (err) {
        console.error("Failed to delete CMS page image from storage:", err);
      }
    }

    await prisma.cmsPage.delete({ where: { id } });

    return apiResponse(null, "CMS page deleted successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to delete CMS page", 500);
  }
}
