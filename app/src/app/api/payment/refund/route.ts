import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

// POST: Request a refund (user) or approve/reject (admin)
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const { transactionId, action, reason, remarks } = await req.json();

    if (!transactionId) return apiError("transactionId is required", 422);

    const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });
    if (!transaction) return apiError("Transaction not found", 404);

    // User requesting refund
    if (action === "REQUEST") {
      if (transaction.userId !== auth.userId) return apiError("Unauthorized", 403);
      if (transaction.status !== "SUCCESSFUL") return apiError("Only successful payments can be refunded", 400);
      if (transaction.refundStatus !== "NONE") return apiError("Refund already in progress", 400);

      await prisma.transaction.update({
        where: { id: transactionId },
        data: { refundStatus: "REQUESTED", refundReason: reason || "No reason provided" },
      });

      return apiResponse({ message: "Refund request submitted" });
    }

    // Admin approving/rejecting refund
    if (action === "APPROVE" || action === "REJECT") {
      if (auth.role !== "ADMIN") return apiError("Admin access required", 403);

      if (action === "APPROVE") {
        // Call Razorpay refund API
        if (transaction.paymentId) {
          try {
            const refundRes = await fetch(
              `https://api.razorpay.com/v1/payments/${transaction.paymentId}/refund`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64")}`,
                },
                body: JSON.stringify({
                  amount: Math.round(transaction.amount * 100),
                  notes: { reason: remarks || "Admin approved refund" },
                }),
              }
            );

            if (!refundRes.ok) {
              console.error("Razorpay refund API failed:", await refundRes.text());
            }
          } catch (err) {
            console.error("Razorpay refund call error:", err);
          }
        }

        await prisma.transaction.update({
          where: { id: transactionId },
          data: {
            refundStatus: "APPROVED",
            refundRemarks: remarks || "Approved by admin",
            status: "REFUNDED",
          },
        });

        // Revoke premium access if it was a PLAN purchase
        if (transaction.purchaseType === "PLAN") {
          await prisma.premiumAccess.updateMany({
            where: { userId: transaction.userId, status: "ACTIVE" },
            data: { status: "REVOKED" },
          });
          await prisma.user.update({
            where: { id: transaction.userId },
            data: { premiumStatus: false },
          });
        }

        return apiResponse({ message: "Refund approved and processed" });
      }

      // REJECT
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { refundStatus: "REJECTED", refundRemarks: remarks || "Rejected by admin" },
      });
      return apiResponse({ message: "Refund rejected" });
    }

    return apiError("Invalid action. Must be REQUEST, APPROVE, or REJECT", 422);
  } catch (err: any) {
    console.error("Refund error:", err);
    return apiError("Internal server error", 500);
  }
}
