import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { emailTemplateSchema } from "@/lib/validations";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
    const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const body = await req.json();
    const parsed = emailTemplateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const template = await prisma.emailTemplate.findUnique({
      where: { id: id },
    });

    if (!template) {
      return apiError("Email template not found", 404);
    }

    const updated = await prisma.emailTemplate.update({
      where: { id: id },
      data: parsed.data,
    });

    return apiResponse(updated, "Email template updated successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to update email template", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
    const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const template = await prisma.emailTemplate.findUnique({
      where: { id: id },
    });

    if (!template) {
      return apiError("Email template not found", 404);
    }

    await prisma.emailTemplate.delete({
      where: { id: id },
    });

    return apiResponse(null, "Email template deleted successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to delete email template", 500);
  }
}
