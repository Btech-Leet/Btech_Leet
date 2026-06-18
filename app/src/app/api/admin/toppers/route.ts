import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { topperSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  const toppers = await prisma.topper.findMany({
    orderBy: [
      { year: "desc" },
      { order: "asc" }
    ],
  });

  return apiResponse(toppers);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const body = await req.json();
    const parsed = topperSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const topper = await prisma.topper.create({
      data: parsed.data,
    });

    return apiResponse(topper, "Topper profile created successfully", 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to create topper profile", 500);
  }
}
