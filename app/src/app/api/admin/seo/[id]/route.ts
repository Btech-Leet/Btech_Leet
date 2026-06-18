import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { seoMetaSchema } from "@/lib/validations";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
    const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const body = await req.json();
    const parsed = seoMetaSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const seoMeta = await prisma.seoMeta.findUnique({
      where: { id: id },
    });

    if (!seoMeta) {
      return apiError("SEO configuration not found", 404);
    }

    const data = parsed.data;
    data.pageUrl = data.pageUrl === "/" ? "/" : data.pageUrl.trim().replace(/\/$/, "");

    // Check code uniqueness if pageUrl is updated
    if (data.pageUrl !== seoMeta.pageUrl) {
      const existing = await prisma.seoMeta.findUnique({
        where: { pageUrl: data.pageUrl },
      });
      if (existing) {
        return apiError(`SEO configurations already exist for page URL "${data.pageUrl}"`, 409);
      }
    }

    const updated = await prisma.seoMeta.update({
      where: { id: id },
      data,
    });

    return apiResponse(updated, "SEO configuration updated successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to update SEO configuration", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
    const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const seoMeta = await prisma.seoMeta.findUnique({
      where: { id: id },
    });

    if (!seoMeta) {
      return apiError("SEO configuration not found", 404);
    }

    await prisma.seoMeta.delete({
      where: { id: id },
    });

    return apiResponse(null, "SEO configuration deleted successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to delete SEO configuration", 500);
  }
}
