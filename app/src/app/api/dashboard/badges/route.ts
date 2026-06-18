import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { checkAndAwardBadges, BADGE_CATALOG } from "@/lib/badgeHelper";

// GET: Retrieve all badges (unlocked + locked) for the current user
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (isAuthResponse(auth)) return auth;

  const unlocked = await prisma.userBadge.findMany({
    where: { userId: auth.userId },
    orderBy: { unlockedAt: "desc" },
  });

  const unlockedSet = new Set(unlocked.map((b) => b.badgeType));

  const badges = BADGE_CATALOG.map((def) => {
    const userBadge = unlocked.find((b) => b.badgeType === def.type);
    return {
      type: def.type,
      title: def.title,
      description: def.description,
      icon: def.icon,
      condition: def.condition,
      unlocked: unlockedSet.has(def.type),
      unlockedAt: userBadge?.unlockedAt ?? null,
    };
  });

  return apiResponse({
    badges,
    totalUnlocked: unlocked.length,
    totalBadges: BADGE_CATALOG.length,
    progress: Math.round((unlocked.length / BADGE_CATALOG.length) * 100),
  });
}

// POST: Manually trigger badge evaluation and return newly awarded badges
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const newlyAwarded = await checkAndAwardBadges(auth.userId);

    const badges = newlyAwarded.map((type) => {
      const def = BADGE_CATALOG.find((b) => b.type === type);
      return {
        type,
        title: def?.title ?? type,
        description: def?.description ?? "",
        icon: def?.icon ?? "🎖️",
      };
    });

    return apiResponse({
      newlyAwarded: badges,
      count: badges.length,
    });
  } catch (err: any) {
    console.error("Badge check error:", err);
    return apiError("Failed to evaluate badges", 500);
  }
}
