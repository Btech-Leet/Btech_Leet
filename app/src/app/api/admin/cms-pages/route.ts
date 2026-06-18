import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { cmsPageSchema } from "@/lib/validations";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  const pages = await prisma.cmsPage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return apiResponse(pages);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const body = await req.json();
    const parsed = cmsPageSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const data = parsed.data;
    if (!data.slug) {
      data.slug = generateSlug(data.title);
    }

    const existing = await prisma.cmsPage.findUnique({ where: { slug: data.slug } });
    if (existing) {
      data.slug = `${data.slug}-${Date.now()}`;
    }

    const page = await prisma.cmsPage.create({
      data: {
        ...data,
        slug: data.slug as string,
      },
    });

    return apiResponse(page, "CMS page created successfully", 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to create CMS page", 500);
  }
}
