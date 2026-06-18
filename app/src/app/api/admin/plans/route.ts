import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";

// GET: List all plans
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  const plans = await prisma.premiumPlan.findMany({ orderBy: { price: "asc" } });
  return apiResponse(plans);
}

// POST: Create a new plan
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const { name, price, duration, features, active } = await req.json();
    if (!name || !price || !duration) {
      return apiError("name, price, and duration are required", 422);
    }

    const plan = await prisma.premiumPlan.create({
      data: {
        name,
        price: parseFloat(price),
        duration: parseInt(duration),
        features: features || [],
        active: active !== false,
      },
    });

    return apiResponse(plan, "Plan created", 201);
  } catch (err: any) {
    console.error("Plan creation error:", err);
    return apiError("Failed to create plan", 500);
  }
}

// PUT: Update an existing plan
export async function PUT(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const { id, name, price, duration, features, active } = await req.json();
    if (!id) return apiError("Plan id is required", 422);

    const existing = await prisma.premiumPlan.findUnique({ where: { id } });
    if (!existing) return apiError("Plan not found", 404);

    const updated = await prisma.premiumPlan.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(duration !== undefined && { duration: parseInt(duration) }),
        ...(features !== undefined && { features }),
        ...(active !== undefined && { active }),
      },
    });

    return apiResponse(updated, "Plan updated");
  } catch (err: any) {
    console.error("Plan update error:", err);
    return apiError("Failed to update plan", 500);
  }
}

// DELETE: Soft-delete a plan (set active = false)
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return apiError("Plan id is required", 422);

    await prisma.premiumPlan.update({
      where: { id },
      data: { active: false },
    });

    return apiResponse(null, "Plan deactivated");
  } catch (err: any) {
    console.error("Plan delete error:", err);
    return apiError("Failed to deactivate plan", 500);
  }
}
