import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { seoMetaSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const seoMetas = await prisma.seoMeta.findMany({
      orderBy: { createdAt: "desc" },
    });
    return apiResponse(seoMetas);
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch SEO meta configurations", 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const body = await req.json();
    const parsed = seoMetaSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const data = parsed.data;
    // Normalize URL path
    data.pageUrl = data.pageUrl === "/" ? "/" : data.pageUrl.trim().replace(/\/$/, "");

    // Check uniqueness
    const existing = await prisma.seoMeta.findUnique({
      where: { pageUrl: data.pageUrl },
    });
    if (existing) {
      return apiError(`SEO configurations already exist for page URL "${data.pageUrl}"`, 409);
    }

    const seoMeta = await prisma.seoMeta.create({ data });

    return apiResponse(seoMeta, "SEO configuration created successfully", 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to create SEO configuration", 500);
  }
}
