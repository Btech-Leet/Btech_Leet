import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { premiumAccessSchema } from "@/lib/validations";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
    const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const body = await req.json();
    const parsed = premiumAccessSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const grant = await prisma.premiumAccess.findUnique({
      where: { id: id },
    });

    if (!grant) {
      return apiError("Premium access record not found", 404);
    }

    const { userId, planName, startDate, endDate, status, notes } = parsed.data;

    // Update grant and sync user premium status in a transaction
    const updated = await prisma.$transaction(async (tx) => {
      const uGrant = await tx.premiumAccess.update({
        where: { id: id },
        data: {
          planName,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status,
          notes,
        },
      });

      // Update user premiumStatus based on current grant status
      await tx.user.update({
        where: { id: userId },
        data: {
          premiumStatus: status === "ACTIVE",
        },
      });

      return uGrant;
    });

    return apiResponse(updated, "Premium access record updated successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to update premium access record", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
    const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const grant = await prisma.premiumAccess.findUnique({
      where: { id: id },
    });

    if (!grant) {
      return apiError("Premium access record not found", 404);
    }

    await prisma.$transaction(async (tx) => {
      await tx.premiumAccess.delete({
        where: { id: id },
      });

      // Check if user has other active premium access grants
      const otherActiveGrants = await tx.premiumAccess.findMany({
        where: {
          userId: grant.userId,
          status: "ACTIVE",
        },
      });

      // If no other active grants, set premiumStatus to false
      await tx.user.update({
        where: { id: grant.userId },
        data: {
          premiumStatus: otherActiveGrants.length > 0,
        },
      });
    });

    return apiResponse(null, "Premium access record deleted successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to delete premium access record", 500);
  }
}
