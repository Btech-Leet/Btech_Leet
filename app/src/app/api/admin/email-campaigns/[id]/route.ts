import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { sendNotificationEmail } from "@/lib/email";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
    const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const body = await req.json();
    const { subject, content, templateId, recipientType, send, recipients } = body;

    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: id },
    });

    if (!campaign) {
      return apiError("Email campaign not found", 404);
    }

    if (campaign.status === "SENDING" || campaign.status === "SENT") {
      return apiError("Cannot modify or resend a campaign that is already sent or sending", 400);
    }

    // 1. Update campaign fields first in DB if provided
    const updatedData: any = {};
    if (subject !== undefined) updatedData.subject = subject;
    if (content !== undefined) updatedData.content = content;
    if (templateId !== undefined) updatedData.templateId = templateId;
    if (recipientType !== undefined) updatedData.recipientType = recipientType;

    let activeCampaign = campaign;
    if (Object.keys(updatedData).length > 0) {
      activeCampaign = await prisma.emailCampaign.update({
        where: { id: id },
        data: updatedData,
      });
    }

    // 2. Trigger sending logic
    if (send) {
      // Resolve recipients
      let targetEmails: string[] = [];

      if (activeCampaign.recipientType === "ALL") {
        const users = await prisma.user.findMany({ select: { email: true } });
        const subscribers = await prisma.emailSubscription.findMany({
          where: { active: true },
          select: { email: true },
        });

        const allEmails = [
          ...users.map((u) => u.email),
          ...subscribers.map((s) => s.email)
        ];

        // Deduplicate
        targetEmails = Array.from(new Set(allEmails)).map((e) => e.trim().toLowerCase());
      } else {
        if (!Array.isArray(recipients) || recipients.length === 0) {
          return apiError("Recipients list is required for this campaign type", 400);
        }
        targetEmails = Array.from(new Set(recipients)).map((e) => String(e).trim().toLowerCase());
      }

      const totalRecipients = targetEmails.length;
      if (totalRecipients === 0) {
        return apiError("No recipients found for this campaign", 400);
      }

      // Mark status as SENDING
      await prisma.emailCampaign.update({
        where: { id: id },
        data: { status: "SENDING" },
      });

      // Chunk sending (groups of 90 to prevent Resend limit errors)
      const chunkSize = 90;
      let sentCount = 0;
      let failedCount = 0;

      for (let i = 0; i < targetEmails.length; i += chunkSize) {
        const chunk = targetEmails.slice(i, i + chunkSize);
        try {
          // Use bcc batch sending
          await sendNotificationEmail(chunk, activeCampaign.subject, activeCampaign.content);
          sentCount += chunk.length;
        } catch (err: any) {
          console.error("Batch sending failed for chunk:", chunk, err);
          failedCount += chunk.length;
        }
      }

      const finalStatus = failedCount === totalRecipients ? "FAILED" : "SENT";

      const updatedCampaign = await prisma.emailCampaign.update({
        where: { id: id },
        data: {
          status: finalStatus,
          recipientCount: totalRecipients,
          sentCount,
          failedCount,
          sentAt: new Date(),
        },
      });

      return apiResponse(updatedCampaign, `Campaign completed with status: ${finalStatus}. Sent to ${sentCount}/${totalRecipients} recipients.`);
    }

    return apiResponse(activeCampaign, "Campaign updated successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to process campaign", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
    const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: id },
    });

    if (!campaign) {
      return apiError("Email campaign not found", 404);
    }

    await prisma.emailCampaign.delete({
      where: { id: id },
    });

    return apiResponse(null, "Campaign deleted successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to delete campaign", 500);
  }
}
