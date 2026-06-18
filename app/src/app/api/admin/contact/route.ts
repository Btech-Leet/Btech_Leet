import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const query = searchParams.get("q") || "";

    const whereClause: any = {};
    if (status && ["NEW", "READ", "RESOLVED", "REPLIED"].includes(status)) {
      whereClause.status = status;
    }

    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { subject: { contains: query, mode: "insensitive" } },
      ];
    }

    const inquiries = await prisma.contactInquiry.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return apiResponse(inquiries);
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch inquiries", 500);
  }
}
