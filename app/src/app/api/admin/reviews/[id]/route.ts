import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { reviewAdminSchema } from "@/lib/validations";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
    const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const body = await req.json();
    const parsed = reviewAdminSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const review = await prisma.review.findUnique({
      where: { id: id },
    });

    if (!review) {
      return apiError("Review not found", 404);
    }

    const updated = await prisma.review.update({
      where: { id: id },
      data: parsed.data,
    });

    return apiResponse(updated, "Review updated successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to update review", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
    const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const review = await prisma.review.findUnique({
      where: { id: id },
    });

    if (!review) {
      return apiError("Review not found", 404);
    }

    await prisma.review.delete({
      where: { id: id },
    });

    return apiResponse(null, "Review deleted successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to delete review", 500);
  }
}
