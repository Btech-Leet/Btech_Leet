import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError, getPaginationParams } from "@/lib/utils";

// GET: Transaction analytics and logs for admin dashboard
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const status = searchParams.get("status");
    const refundStatus = searchParams.get("refundStatus");

    // Date boundaries
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Revenue calculations
    const [revenueToday, revenueMonth, revenueTotal, totalTransactions, refundRequests] = await Promise.all([
      prisma.transaction.aggregate({
        where: { status: "SUCCESSFUL", createdAt: { gte: startOfToday } },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: { status: "SUCCESSFUL", createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: { status: "SUCCESSFUL" },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transaction.count(),
      prisma.transaction.count({ where: { refundStatus: "REQUESTED" } }),
    ]);

    // Conversion rate
    const totalOrders = await prisma.transaction.count();
    const successfulOrders = await prisma.transaction.count({ where: { status: "SUCCESSFUL" } });
    const conversionRate = totalOrders > 0 ? Math.round((successfulOrders / totalOrders) * 100) : 0;

    // Failed transactions count
    const failedCount = await prisma.transaction.count({ where: { status: "FAILED" } });

    // Build filter for transaction list
    const where: any = {};
    if (status) where.status = status;
    if (refundStatus) where.refundStatus = refundStatus;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    // Monthly revenue trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const agg = await prisma.transaction.aggregate({
        where: { status: "SUCCESSFUL", createdAt: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true },
        _count: true,
      });
      monthlyTrend.push({
        month: monthStart.toLocaleString("en-US", { month: "short", year: "2-digit" }),
        revenue: agg._sum.amount || 0,
        orders: agg._count,
      });
    }

    return apiResponse({
      stats: {
        revenueToday: revenueToday._sum.amount || 0,
        ordersToday: revenueToday._count,
        revenueMonth: revenueMonth._sum.amount || 0,
        ordersMonth: revenueMonth._count,
        revenueTotal: revenueTotal._sum.amount || 0,
        ordersTotal: revenueTotal._count,
        conversionRate,
        failedCount,
        pendingRefunds: refundRequests,
      },
      monthlyTrend,
      transactions: transactions.map((t) => ({
        id: t.id,
        orderId: t.orderId,
        paymentId: t.paymentId,
        userName: t.user.name,
        userEmail: t.user.email,
        amount: t.amount,
        currency: t.currency,
        status: t.status,
        purchaseType: t.purchaseType,
        purchaseName: t.purchaseName,
        refundStatus: t.refundStatus,
        refundReason: t.refundReason,
        failureReason: t.failureReason,
        invoiceNumber: t.invoiceNumber,
        createdAt: t.createdAt,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err: any) {
    console.error("Transaction analytics error:", err);
    return apiError("Failed to load transaction analytics", 500);
  }
}
