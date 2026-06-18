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

    const branchStats = await prisma.user.groupBy({
      by: ["branch"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    });

    const formattedStats = branchStats.map((item) => ({
      branch: item.branch || "Not Specified",
      count: item._count.id,
    }));

    const topBranches = formattedStats.slice(0, limit);
    const otherBranches = formattedStats.slice(limit);

    if (otherBranches.length > 0) {
      const otherCount = otherBranches.reduce((acc, curr) => acc + curr.count, 0);
      topBranches.push({
        branch: "Others",
        count: otherCount,
      });
    }

    return apiResponse(topBranches);
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch branch analytics", 500);
  }
}
