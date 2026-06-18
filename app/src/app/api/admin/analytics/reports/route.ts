import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const searchParams = req.nextUrl.searchParams;
    const startStr = searchParams.get("startDate");
    const endStr = searchParams.get("endDate");

    let startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Default to last 30 days
    let endDate = new Date();

    if (startStr) {
      const parsedStart = new Date(startStr);
      if (!isNaN(parsedStart.getTime())) {
        startDate = parsedStart;
      }
    }
    if (endStr) {
      const parsedEnd = new Date(endStr);
      if (!isNaN(parsedEnd.getTime())) {
        // Set to end of that day
        parsedEnd.setHours(23, 59, 59, 999);
        endDate = parsedEnd;
      }
    }

    const whereClause = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    const [
      newUsers,
      premiumGranted,
      contactInquiries,
      reviewsSubmitted,
      leadsCreated,
      campaignsSent,
    ] = await Promise.all([
      prisma.user.count({ where: whereClause }),
      prisma.premiumAccess.count({ where: whereClause }),
      prisma.contactInquiry.count({ where: whereClause }),
      prisma.review.count({ where: whereClause }),
      prisma.lead.count({ where: whereClause }),
      prisma.emailCampaign.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: "SENT",
        },
      }),
    ]);

    // Let's get daily breakdown for the range
    // We will group users, leads, premium, and contacts by day in this range
    const usersByDay = await prisma.user.findMany({
      where: whereClause,
      select: { createdAt: true },
    });

    const leadsByDay = await prisma.lead.findMany({
      where: whereClause,
      select: { createdAt: true },
    });

    const premiumByDay = await prisma.premiumAccess.findMany({
      where: whereClause,
      select: { createdAt: true },
    });

    const dailyStats: { [key: string]: { date: string; users: number; leads: number; premium: number } } = {};

    // Initialize all dates in range
    const dateCursor = new Date(startDate);
    while (dateCursor <= endDate) {
      const dateKey = dateCursor.toLocaleDateString("default", { month: "short", day: "numeric" });
      dailyStats[dateKey] = { date: dateKey, users: 0, leads: 0, premium: 0 };
      dateCursor.setDate(dateCursor.getDate() + 1);
    }

    usersByDay.forEach((u) => {
      const dateKey = u.createdAt.toLocaleDateString("default", { month: "short", day: "numeric" });
      if (dailyStats[dateKey]) dailyStats[dateKey].users++;
    });

    leadsByDay.forEach((l) => {
      const dateKey = l.createdAt.toLocaleDateString("default", { month: "short", day: "numeric" });
      if (dailyStats[dateKey]) dailyStats[dateKey].leads++;
    });

    premiumByDay.forEach((p) => {
      const dateKey = p.createdAt.toLocaleDateString("default", { month: "short", day: "numeric" });
      if (dailyStats[dateKey]) dailyStats[dateKey].premium++;
    });

    const breakdown = Object.values(dailyStats);

    return apiResponse({
      summary: {
        newUsers,
        premiumGranted,
        contactInquiries,
        reviewsSubmitted,
        leadsCreated,
        campaignsSent,
      },
      breakdown,
    });
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch report analytics", 500);
  }
}
