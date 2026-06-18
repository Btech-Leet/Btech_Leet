import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pageUrl = searchParams.get("pageUrl");

    if (!pageUrl) {
      return apiError("pageUrl query parameter is required", 400);
    }

    const faqs = await prisma.fAQ.findMany({
      where: {
        pageUrl,
        active: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    return apiResponse(faqs);
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch FAQs", 500);
  }
}
