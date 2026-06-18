import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";

// GET: List all active plans (public for student billing page)
export async function GET() {
  try {
    const plans = await prisma.premiumPlan.findMany({
      where: { active: true },
      orderBy: { price: "asc" },
    });
    return apiResponse(plans);
  } catch (err: any) {
    console.error("Plans fetch error:", err);
    return apiError("Failed to load plans", 500);
  }
}
