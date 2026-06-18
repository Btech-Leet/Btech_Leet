import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const { id } = await params;
    const body = await req.json();
    const { status, reply } = body;

    const inquiry = await prisma.contactInquiry.findUnique({
      where: { id },
    });

    if (!inquiry) {
      return apiError("Contact inquiry not found", 404);
    }

    const updateData: any = {};
    if (status && ["NEW", "READ", "RESOLVED", "REPLIED"].includes(status)) {
      updateData.status = status;
    }

    if (reply !== undefined) {
      updateData.reply = reply;
      updateData.repliedAt = new Date();
      updateData.status = "REPLIED";
    }

    const updated = await prisma.contactInquiry.update({
      where: { id },
      data: updateData,
    });

    return apiResponse(updated, "Inquiry updated successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to update inquiry", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const { id } = await params;
    const inquiry = await prisma.contactInquiry.findUnique({
      where: { id },
    });

    if (!inquiry) {
      return apiError("Inquiry not found", 404);
    }

    await prisma.contactInquiry.delete({
      where: { id },
    });

    return apiResponse(null, "Inquiry deleted successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to delete inquiry", 500);
  }
}
