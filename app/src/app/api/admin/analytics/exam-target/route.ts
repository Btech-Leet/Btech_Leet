import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const users = await prisma.user.findMany({
      select: {
        examTargets: true,
      },
    });

    const targetCounts: { [key: string]: number } = {};
    let notSpecifiedCount = 0;

    users.forEach((user) => {
      if (!user.examTargets || user.examTargets.length === 0) {
        notSpecifiedCount++;
      } else {
        user.examTargets.forEach((target) => {
          targetCounts[target] = (targetCounts[target] || 0) + 1;
        });
      }
    });

    const formattedStats = Object.entries(targetCounts).map(([target, count]) => ({
      target,
      count,
    }));

    // Sort by count descending
    formattedStats.sort((a, b) => b.count - a.count);

    if (notSpecifiedCount > 0) {
      formattedStats.push({
        target: "Not Specified",
        count: notSpecifiedCount,
      });
    }

    return apiResponse(formattedStats);
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch exam target analytics", 500);
  }
}
