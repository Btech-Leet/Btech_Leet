import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { couponSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return apiResponse(coupons);
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch coupons", 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const body = await req.json();
    const parsed = couponSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const { code, discountType, discountValue, applicableTo, startDate, endDate, active, usageLimit } = parsed.data;

    // Check uniqueness
    const existing = await prisma.coupon.findUnique({
      where: { code },
    });
    if (existing) {
      return apiError(`Coupon code "${code}" already exists`, 409);
    }

    const coupon = await prisma.coupon.create({
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

    return apiResponse(coupon, "Coupon created successfully", 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to create coupon", 500);
  }
}
