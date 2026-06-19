import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";

// GET: Fetch counselling price setting
export async function GET(req: NextRequest) {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "counselling_price" },
    });

    // Default price is 999 if not set in DB
    const price = setting ? (setting.value as any).price : 999;

    return apiResponse({ price });
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch counselling price setting", 500);
  }
}

// POST: Update counselling price setting
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const { price } = await req.json();

    if (price === undefined || typeof price !== "number" || price < 0) {
      return apiError("Valid price number is required", 422);
    }

    const setting = await prisma.setting.upsert({
      where: { key: "counselling_price" },
      update: { value: { price } },
      create: { key: "counselling_price", value: { price } },
    });

    return apiResponse(setting, "Counselling price updated successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to update counselling price", 500);
  }
}
