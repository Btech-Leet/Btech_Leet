import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { emailCampaignSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const campaigns = await prisma.emailCampaign.findMany({
      orderBy: { createdAt: "desc" },
    });
    return apiResponse(campaigns);
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch campaigns", 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const body = await req.json();
    const parsed = emailCampaignSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const { subject, content, templateId, recipientType } = parsed.data;

    const campaign = await prisma.emailCampaign.create({
      data: {
        subject,
        content,
        templateId,
        recipientType,
        status: "DRAFT",
      },
    });

    return apiResponse(campaign, "Email campaign created successfully", 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to create campaign", 500);
  }
}
