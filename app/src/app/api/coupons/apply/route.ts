import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, itemId, itemPrice } = body;

    if (!code) {
      return apiError("Coupon code is required", 400);
    }

    if (itemPrice === undefined || itemPrice === null || typeof itemPrice !== "number") {
      return apiError("Valid item price is required", 400);
    }

    const uppercaseCode = code.trim().toUpperCase();

    const coupon = await prisma.coupon.findUnique({
      where: { code: uppercaseCode },
    });

    if (!coupon) {
      return apiError("Invalid coupon code", 404);
    }

    if (!coupon.active) {
      return apiError("This coupon is inactive", 400);
    }

    const now = new Date();
    if (now < new Date(coupon.startDate)) {
      return apiError("This coupon is not active yet", 400);
    }

    if (now > new Date(coupon.endDate)) {
      return apiError("This coupon has expired", 400);
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return apiError("This coupon usage limit has been reached", 400);
    }

    // Check applicability: check if 'ALL' is present or if itemId is listed
    const isApplicable = coupon.applicableTo.includes("ALL") || 
      (itemId && coupon.applicableTo.includes(itemId));

    if (!isApplicable) {
      return apiError("This coupon is not applicable to the selected item", 400);
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (itemPrice * coupon.discountValue) / 100;
    } else {
      // FIXED discount
      discountAmount = coupon.discountValue;
    }

    // Discount cannot exceed item price
    if (discountAmount > itemPrice) {
      discountAmount = itemPrice;
    }

    const finalPrice = itemPrice - discountAmount;

    return apiResponse({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      finalPrice: parseFloat(finalPrice.toFixed(2)),
    }, "Coupon applied successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to apply coupon", 500);
  }
}
