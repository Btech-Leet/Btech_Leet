import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { couponSchema } from "@/lib/validations";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
    const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const body = await req.json();
    const parsed = couponSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id: id },
    });

    if (!coupon) {
      return apiError("Coupon not found", 404);
    }

    // Check code uniqueness if code is updated
    if (parsed.data.code !== coupon.code) {
      const existing = await prisma.coupon.findUnique({
        where: { code: parsed.data.code },
      });
      if (existing) {
        return apiError(`Coupon code "${parsed.data.code}" is already in use`, 409);
      }
    }

    const { code, discountType, discountValue, applicableTo, startDate, endDate, active, usageLimit } = parsed.data;

    const updated = await prisma.coupon.update({
      where: { id: id },
      data: {
        code,
        discountType,
        discountValue,
        applicableTo,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        active,
        usageLimit,
      },
    });

    return apiResponse(updated, "Coupon updated successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to update coupon", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
    const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id: id },
    });

    if (!coupon) {
      return apiError("Coupon not found", 404);
    }

    await prisma.coupon.delete({
      where: { id: id },
    });

    return apiResponse(null, "Coupon deleted successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to delete coupon", 500);
  }
}
