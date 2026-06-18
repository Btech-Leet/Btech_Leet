import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import crypto from "crypto";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

// POST: Verify Razorpay payment signature and activate the purchase
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return apiError("Missing payment verification fields", 422);
    }

    // Verify HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // Mark transaction as failed
      await prisma.transaction.updateMany({
        where: { orderId: razorpay_order_id, userId: auth.userId },
        data: { status: "FAILED", failureReason: "Signature verification failed" },
      });
      return apiError("Payment verification failed", 400);
    }

    // Find the transaction
    const transaction = await prisma.transaction.findUnique({
      where: { orderId: razorpay_order_id },
    });

    if (!transaction) return apiError("Transaction not found", 404);
    if (transaction.userId !== auth.userId) return apiError("Unauthorized", 403);
    if (transaction.status === "SUCCESSFUL") return apiError("Payment already verified", 409);

    // Fetch order from Razorpay to get notes (where couponCode is stored securely)
    let couponCode = "";
    try {
      const razorpayOrderRes = await fetch(`https://api.razorpay.com/v1/orders/${razorpay_order_id}`, {
        headers: {
          Authorization: `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64")}`,
        },
      });
      if (razorpayOrderRes.ok) {
        const orderData = await razorpayOrderRes.json();
        couponCode = orderData.notes?.couponCode || "";
      }
    } catch (err) {
      console.error("Error fetching order from Razorpay during verification:", err);
    }

    // Generate invoice number
    const invoiceNumber = `LEET-INV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // Update transaction to SUCCESSFUL
    const updated = await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        status: "SUCCESSFUL",
        invoiceNumber,
      },
    });

    // Increment coupon used count if coupon was used
    if (couponCode) {
      try {
        await prisma.coupon.update({
          where: { code: couponCode.trim().toUpperCase() },
          data: { usedCount: { increment: 1 } },
        });
      } catch (err) {
        console.error("Failed to increment coupon usedCount:", err);
      }
    }

    // Activate purchase based on type
    if (transaction.purchaseType === "PLAN") {
      const plan = await prisma.premiumPlan.findUnique({ where: { id: transaction.purchaseItemId } });
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
            notes: `Payment ID: ${razorpay_payment_id}`,
          },
        });

        // Update user premium status
        await prisma.user.update({
          where: { id: auth.userId },
          data: { premiumStatus: true },
        });
      }
    }

    return apiResponse({
      verified: true,
      transactionId: updated.id,
      invoiceNumber,
      status: "SUCCESSFUL",
    });
  } catch (err: any) {
    console.error("Payment verification error:", err);
    return apiError("Internal server error", 500);
  }
}
