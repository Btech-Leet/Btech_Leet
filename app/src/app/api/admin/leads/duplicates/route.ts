import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    // We want to detect leads with matching non-null emails or mobile numbers
    const allLeads = await prisma.lead.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const emailGroups: { [key: string]: typeof allLeads } = {};
    const mobileGroups: { [key: string]: typeof allLeads } = {};

    allLeads.forEach((lead) => {
      if (lead.email && lead.email.trim() !== "") {
        const emailKey = lead.email.toLowerCase().trim();
        emailGroups[emailKey] = emailGroups[emailKey] || [];
        emailGroups[emailKey].push(lead);
      }
      if (lead.mobile && lead.mobile.trim() !== "") {
        const mobileKey = lead.mobile.trim();
        mobileGroups[mobileKey] = mobileGroups[mobileKey] || [];
        mobileGroups[mobileKey].push(lead);
      }
    });

    const duplicateGroups: Array<{
      type: "email" | "mobile";
      value: string;
      leads: typeof allLeads;
    }> = [];

    // Filter out groups with only 1 lead (no duplicates)
    Object.entries(emailGroups).forEach(([email, group]) => {
      if (group.length > 1) {
        duplicateGroups.push({
          type: "email",
          value: email,
          leads: group,
        });
      }
    });

    Object.entries(mobileGroups).forEach(([mobile, group]) => {
      if (group.length > 1) {
        // Avoid adding exact duplicate sets if they already matched by email
        const alreadyAdded = duplicateGroups.some(g => 
          g.type === "email" && 
          g.leads.some(l => l.mobile === mobile)
        );
        if (!alreadyAdded) {
          duplicateGroups.push({
            type: "mobile",
            value: mobile,
            leads: group,
          });
        }
      }
    });

    return apiResponse(duplicateGroups);
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch duplicate leads", 500);
  }
}
