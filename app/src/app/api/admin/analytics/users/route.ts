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
    const range = searchParams.get("range") || "30days"; // 30days, 7days, 12months

    const now = new Date();
    let startDate = new Date();

    if (range === "7days") {
      startDate.setDate(now.getDate() - 7);
    } else if (range === "12months") {
      startDate.setMonth(now.getMonth() - 12);
    } else {
      // Default 30 days
      startDate.setDate(now.getDate() - 30);
    }

    // Fetch users created since startDate
    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group the data
    const registrationTrend: { label: string; count: number }[] = [];

    if (range === "12months") {
      // Group by month
      const monthsMap: { [key: string]: number } = {};
      
      // Initialize last 12 months
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(now.getMonth() - i);
        const monthLabel = d.toLocaleString("default", { month: "short", year: "2-digit" });
        monthsMap[monthLabel] = 0;
      }

      users.forEach((u) => {
        const monthLabel = u.createdAt.toLocaleString("default", { month: "short", year: "2-digit" });
        if (monthsMap[monthLabel] !== undefined) {
          monthsMap[monthLabel]++;
        }
      });

      Object.entries(monthsMap).forEach(([label, count]) => {
        registrationTrend.push({ label, count });
      });
    } else {
      // Group by day
      const daysMap: { [key: string]: number } = {};
      const numDays = range === "7days" ? 7 : 30;

      // Initialize days
      for (let i = numDays - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dayLabel = d.toLocaleDateString("default", { month: "short", day: "numeric" });
        daysMap[dayLabel] = 0;
      }

      users.forEach((u) => {
        const dayLabel = u.createdAt.toLocaleDateString("default", { month: "short", day: "numeric" });
        if (daysMap[dayLabel] !== undefined) {
          daysMap[dayLabel]++;
        }
      });

      Object.entries(daysMap).forEach(([label, count]) => {
        registrationTrend.push({ label, count });
      });
    }

    // Summary statistics
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date();
    weekStart.setDate(now.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date();
    monthStart.setMonth(now.getMonth() - 1);
    monthStart.setHours(0, 0, 0, 0);

    const [todayCount, weekCount, monthCount, totalUsers] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.user.count(),
    ]);

    return apiResponse({
      trend: registrationTrend,
      summary: {
        today: todayCount,
        thisWeek: weekCount,
        thisMonth: monthCount,
        total: totalUsers,
      },
    });
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch user registrations analytics", 500);
  }
}
