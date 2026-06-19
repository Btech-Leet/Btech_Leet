import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";

// GET: Fetch all counselling registrations
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const registrations = await prisma.counsellingRegistration.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            mobile: true,
          },
        },
      },
    });

    return apiResponse(registrations);
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch counselling registrations", 500);
  }
}
