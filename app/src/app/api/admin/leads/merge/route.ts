import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const body = await req.json();
    const { primaryId, duplicateIds } = body;

    if (!primaryId || typeof primaryId !== "string") {
      return apiError("Primary lead ID is required", 422);
    }

    if (
      !duplicateIds ||
      !Array.isArray(duplicateIds) ||
      duplicateIds.length === 0
    ) {
      return apiError("At least one duplicate lead ID is required", 422);
    }

    // Verify primary lead exists
    const primaryLead = await prisma.lead.findUnique({
      where: { id: primaryId },
    });

    if (!primaryLead) {
      return apiError("Primary lead not found", 404);
    }

    // Verify all duplicate leads exist
    const duplicateLeads = await prisma.lead.findMany({
      where: { id: { in: duplicateIds } },
    });

    if (duplicateLeads.length !== duplicateIds.length) {
      return apiError("One or more duplicate leads not found", 404);
    }

    // Perform merge in a transaction
    await prisma.$transaction(async (tx) => {
      // Transfer all notes from duplicate leads to primary
      await tx.leadNote.updateMany({
        where: { leadId: { in: duplicateIds } },
        data: { leadId: primaryId },
      });

      // Merge data: fill in missing fields from duplicates (first non-null wins)
      const mergeFields = [
        "name",
        "email",
        "mobile",
        "collegeName",
        "branch",
        "sourcePage",
        "sourceUrl",
        "landingPage",
        "referrerPage",
        "utmSource",
        "utmMedium",
        "utmCampaign",
      ] as const;

      const updateData: Record<string, string> = {};

      for (const field of mergeFields) {
        if (
          !primaryLead[field] ||
          (typeof primaryLead[field] === "string" &&
            (primaryLead[field] as string).trim() === "")
        ) {
          // Find a value from duplicates
          for (const dup of duplicateLeads) {
            const val = dup[field];
            if (val && typeof val === "string" && val.trim() !== "") {
              updateData[field] = val;
              break;
            }
          }
        }
      }

      // Update primary lead with merged fields
      if (Object.keys(updateData).length > 0) {
        await tx.lead.update({
          where: { id: primaryId },
          data: updateData,
        });
      }

      // Delete duplicate leads (notes already transferred)
      await tx.lead.deleteMany({
        where: { id: { in: duplicateIds } },
      });
    });

    // Fetch updated primary lead
    const mergedLead = await prisma.lead.findUnique({
      where: { id: primaryId },
      include: {
        notes: { orderBy: { createdAt: "desc" } },
        user: {
          select: {
            name: true,
            email: true,
            profileComplete: true,
            premiumStatus: true,
          },
        },
      },
    });

    return apiResponse(
      mergedLead,
      `Successfully merged ${duplicateIds.length} duplicate lead(s) into the primary lead.`
    );
  } catch (err: any) {
    return apiError(err.message || "Failed to merge leads", 500);
  }
}
