import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const searchParams = req.nextUrl.searchParams;
    
    // Pagination params
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.max(1, Number(searchParams.get("limit") || "10"));
    const skip = (page - 1) * limit;

    // Filter params
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const sourcePage = searchParams.get("sourcePage") || undefined;
    const utmSource = searchParams.get("utmSource") || undefined;

    // Sorting params
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    // Where condition builder
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (sourcePage) {
      where.sourcePage = { contains: sourcePage, mode: "insensitive" };
    }

    if (utmSource) {
      where.utmSource = { contains: utmSource, mode: "insensitive" };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { mobile: { contains: search, mode: "insensitive" } },
        { collegeName: { contains: search, mode: "insensitive" } },
        { branch: { contains: search, mode: "insensitive" } },
      ];
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              profileComplete: true,
              premiumStatus: true,
            },
          },
          _count: {
            select: {
              notes: true,
            },
          },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    return apiResponse({
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch leads list", 500);
  }
}
