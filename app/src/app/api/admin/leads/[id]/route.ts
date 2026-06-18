import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { leadUpdateSchema } from "@/lib/validations";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const { id } = await params;
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        user: true,
        notes: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!lead) {
      return apiError("Lead not found", 404);
    }

    return apiResponse(lead);
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch lead details", 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = leadUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const { status, remarks } = parsed.data;

    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return apiError("Lead not found", 404);
    }

    const updateData: any = {};
    if (status) {
      updateData.status = status;
      if (status === "CONVERTED" && !lead.convertedAt) {
        updateData.convertedAt = new Date();
      }
    }
    if (remarks !== undefined) {
      updateData.remarks = remarks;
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: updateData,
    });

    return apiResponse(updated, "Lead updated successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to update lead", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const { id } = await params;
    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return apiError("Lead not found", 404);
    }

    await prisma.lead.delete({
      where: { id },
    });

    return apiResponse(null, "Lead deleted successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to delete lead", 500);
  }
}
