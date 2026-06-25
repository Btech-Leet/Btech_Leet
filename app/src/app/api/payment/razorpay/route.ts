import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import crypto from "crypto";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

// POST: Create a Razorpay Order for plan or book purchase
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const { purchaseType, purchaseItemId, couponCode } = await req.json();

    if (!purchaseType || !purchaseItemId) {
      return apiError("purchaseType and purchaseItemId are required", 422);
    }

    let amount: number;
    let purchaseName: string;

    if (purchaseType === "PLAN") {
      const plan = await prisma.premiumPlan.findUnique({ where: { id: purchaseItemId } });
      if (!plan || !plan.active) return apiError("Plan not found or inactive", 404);
      amount = plan.price;
      purchaseName = plan.name;
    } else if (purchaseType === "BOOK") {
      const book = await prisma.book.findUnique({ where: { id: purchaseItemId } });
      if (!book || !book.active) return apiError("Book not found or inactive", 404);
      amount = book.price || 0;
      purchaseName = book.name;
    } else if (purchaseType === "RESOURCE") {
      const resource = await prisma.resource.findUnique({ where: { id: purchaseItemId } });
      if (!resource || !resource.active) return apiError("Resource not found or inactive", 404);
      amount = resource.price || 0;
      purchaseName = resource.title;
    } else {
      return apiError("Invalid purchaseType. Must be PLAN, BOOK, or RESOURCE", 422);
    }

    // Apply Coupon Code if present
    let appliedCoupon = null;
    if (couponCode) {
      const uppercaseCode = couponCode.trim().toUpperCase();
      const coupon = await prisma.coupon.findUnique({
        where: { code: uppercaseCode },
      });

      if (coupon && coupon.active) {
        const now = new Date();
        const isNotExpired = now >= new Date(coupon.startDate) && now <= new Date(coupon.endDate);
        const limitNotReached = coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit;
        const isApplicable = coupon.applicableTo.includes("ALL") || coupon.applicableTo.includes(purchaseItemId);

        if (isNotExpired && limitNotReached && isApplicable) {
          let discountAmount = 0;
          if (coupon.discountType === "PERCENTAGE") {
            discountAmount = (amount * coupon.discountValue) / 100;
          } else {
            discountAmount = coupon.discountValue;
          }
          if (discountAmount > amount) discountAmount = amount;
          amount = amount - discountAmount;
          appliedCoupon = coupon.code;
        }
      }
    }

    // If discount results in 0 or negative price, bypass Razorpay and grant access directly
    if (amount <= 0) {
      const invoiceNumber = `LEET-INV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      
      const transaction = await prisma.transaction.create({
        data: {
          userId: auth.userId,
          orderId: `free_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          paymentId: "FREE_COUPON",
          signature: "FREE_COUPON",
          amount: 0,
          currency: "INR",
          status: "SUCCESSFUL",
          purchaseType: purchaseType as "PLAN" | "BOOK" | "RESOURCE",
          purchaseItemId,
          purchaseName,
          invoiceNumber,
        },
      });

      if (appliedCoupon) {
        try {
          await prisma.coupon.update({
            where: { code: appliedCoupon },
            data: { usedCount: { increment: 1 } },
          });
        } catch (e) {
          console.error("Failed to increment coupon usedCount:", e);
        }
      }

      if (purchaseType === "PLAN") {
        const plan = await prisma.premiumPlan.findUnique({ where: { id: purchaseItemId } });
        if (plan) {
          const user = await prisma.user.findUnique({ where: { id: auth.userId } });
          const startDate = new Date();
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + plan.duration);

          await prisma.premiumAccess.create({
            data: {
              userId: auth.userId,
              userName: user?.name ?? "",
              email: user?.email ?? "",
              mobile: user?.mobile ?? null,
              planName: plan.name,
              startDate,
              endDate,
              status: "ACTIVE",
              grantedBy: "RAZORPAY",
              notes: `100% discount coupon applied`,
            },
          });

          await prisma.user.update({
            where: { id: auth.userId },
            data: { premiumStatus: true },
          });
        }
      }

      return apiResponse({
        free: true,
        transactionId: transaction.id,
        invoiceNumber,
      }, "Coupon applied successfully. Access granted for free!");
    }

    // In development without Razorpay keys, simulate a successful purchase
    if (process.env.NODE_ENV === "development" && (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET)) {
      console.warn("Razorpay keys missing in development mode. Simulating successful purchase.");
      
      const invoiceNumber = `LEET-INV-DEV-${Date.now().toString(36).toUpperCase()}`;
      
      const transaction = await prisma.transaction.create({
        data: {
          userId: auth.userId,
          orderId: `dev_${Date.now()}`,
          paymentId: "DEV_MOCK_PAYMENT",
          signature: "DEV_MOCK",
          amount: amount, // Record actual amount, but process as free/mock
          currency: "INR",
          status: "SUCCESSFUL",
          purchaseType: purchaseType as "PLAN" | "BOOK" | "RESOURCE",
          purchaseItemId,
          purchaseName,
          invoiceNumber,
        },
      });

      if (purchaseType === "PLAN") {
        const plan = await prisma.premiumPlan.findUnique({ where: { id: purchaseItemId } });
        if (plan) {
          const user = await prisma.user.findUnique({ where: { id: auth.userId } });
          const startDate = new Date();
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + plan.duration);

          await prisma.premiumAccess.create({
            data: {
              userId: auth.userId,
              userName: user?.name ?? "",
              email: user?.email ?? "",
              mobile: user?.mobile ?? null,
              planName: plan.name,
              startDate,
              endDate,
              status: "ACTIVE",
              grantedBy: "RAZORPAY_DEV_MOCK",
              notes: `Mock payment in development`,
            },
          });

          await prisma.user.update({
            where: { id: auth.userId },
            data: { premiumStatus: true },
          });
        }
      }

      return apiResponse({
        free: true,
        transactionId: transaction.id,
        invoiceNumber,
      }, "Development mode: Mock payment successful!");
    }

    // Create Razorpay order via their REST API
    const orderPayload = {
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${auth.userId.slice(0, 8)}`,
      notes: {
        userId: auth.userId,
        purchaseType,
        purchaseItemId,
        couponCode: appliedCoupon || "",
      },
    };

    const razorpayRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64")}`,
      },
      body: JSON.stringify(orderPayload),
    });

    if (!razorpayRes.ok) {
      const errBody = await razorpayRes.text();
      console.error("Razorpay order creation failed:", errBody);
      return apiError("Failed to create payment order. Please try again.", 502);
    }

    const razorpayOrder = await razorpayRes.json();

    // Save pending transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: auth.userId,
        orderId: razorpayOrder.id,
        amount,
        currency: "INR",
        status: "PENDING",
        purchaseType: purchaseType as "PLAN" | "BOOK" | "RESOURCE",
        purchaseItemId,
        purchaseName,
      },
    });

    return apiResponse({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      transactionId: transaction.id,
      keyId: RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    console.error("Payment creation error:", err);
    return apiError("Internal server error", 500);
  }
}
