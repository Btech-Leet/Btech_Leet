import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";

// GET: List the current user's transactions
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderId: true,
        paymentId: true,
        amount: true,
        currency: true,
        status: true,
        purchaseType: true,
        purchaseName: true,
        refundStatus: true,
        invoiceNumber: true,
        createdAt: true,
      },
    });

    return apiResponse(transactions);
  } catch (err: any) {
    console.error("Payment history error:", err);
    return apiError("Failed to load payment history", 500);
  }
}
