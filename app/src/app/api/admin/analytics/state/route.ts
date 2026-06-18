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

    const stateStats = await prisma.user.groupBy({
      by: ["state"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    });

    const formattedStats = stateStats.map((item) => ({
      state: item.state || "Not Specified",
      count: item._count.id,
    }));

    const topStates = formattedStats.slice(0, limit);
    const otherStates = formattedStats.slice(limit);

    if (otherStates.length > 0) {
      const otherCount = otherStates.reduce((acc, curr) => acc + curr.count, 0);
      topStates.push({
        state: "Others",
        count: otherCount,
      });
    }

    return apiResponse(topStates);
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch state analytics", 500);
  }
}
