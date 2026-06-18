import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { premiumAccessSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const grants = await prisma.premiumAccess.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, mobile: true } },
      },
    });
    return apiResponse(grants);
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch premium access logs", 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const body = await req.json();
    const parsed = premiumAccessSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const { userId, userName, email, mobile, planName, startDate, endDate, status, notes } = parsed.data;

    // Check user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return apiError("User not found", 404);
    }

    const activeStatus = status === "ACTIVE";

    // Create grant in transaction
    const grant = await prisma.$transaction(async (tx) => {
      const g = await tx.premiumAccess.create({
        data: {
          userId,
          userName,
          email,
          mobile,
          planName,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status,
          notes,
          grantedBy: auth.email,
        },
      });

      // Update user premium status
      await tx.user.update({
        where: { id: userId },
        data: {
          premiumStatus: activeStatus,
        },
      });

      return g;
    });

    return apiResponse(grant, "Premium access granted successfully", 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to grant premium access", 500);
  }
}
