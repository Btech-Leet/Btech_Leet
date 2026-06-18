import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { faqSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  const faqs = await prisma.fAQ.findMany({
    orderBy: [
      { pageUrl: "asc" },
      { order: "asc" }
    ],
  });

  return apiResponse(faqs);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const body = await req.json();
    const parsed = faqSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const faq = await prisma.fAQ.create({
      data: parsed.data,
    });

    return apiResponse(faq, "FAQ created successfully", 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to create FAQ", 550);
  }
}
