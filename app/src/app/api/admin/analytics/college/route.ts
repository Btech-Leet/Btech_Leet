import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const limit = Number(req.nextUrl.searchParams.get("limit") || "10");

    const collegeStats = await prisma.user.groupBy({
      by: ["collegeName"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    });

    const formattedStats = collegeStats.map((item) => ({
      collegeName: item.collegeName || "Not Specified",
      count: item._count.id,
    }));

    // Split into top N and "Others"
    const topColleges = formattedStats.slice(0, limit);
    const otherColleges = formattedStats.slice(limit);
    
    if (otherColleges.length > 0) {
      const otherCount = otherColleges.reduce((acc, curr) => acc + curr.count, 0);
      topColleges.push({
        collegeName: "Others",
        count: otherCount,
      });
    }

    return apiResponse(topColleges);
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch college analytics", 500);
  }
}
