import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiError } from "@/lib/utils";

export const dynamic = "force-dynamic";

function escapeCsvField(field: string | null | undefined): string {
  if (!field) return "";
  const str = String(field);
  // If field contains comma, newline, or quote — wrap in quotes
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { mobile: { contains: search, mode: "insensitive" } },
        { collegeName: { contains: search, mode: "insensitive" } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
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

    // Build CSV
    const headers = [
      "Name",
      "Email",
      "Mobile",
      "College",
      "Branch",
      "Status",
      "Source Page",
      "Source URL",
      "Landing Page",
      "Referrer",
      "UTM Source",
      "UTM Medium",
      "UTM Campaign",
      "Remarks",
      "Linked User",
      "Profile Complete %",
      "Premium",
      "Created At",
      "Converted At",
    ];

    const rows = leads.map((lead) => [
      escapeCsvField(lead.name),
      escapeCsvField(lead.email),
      escapeCsvField(lead.mobile),
      escapeCsvField(lead.collegeName),
      escapeCsvField(lead.branch),
      escapeCsvField(lead.status),
      escapeCsvField(lead.sourcePage),
      escapeCsvField(lead.sourceUrl),
      escapeCsvField(lead.landingPage),
      escapeCsvField(lead.referrerPage),
      escapeCsvField(lead.utmSource),
      escapeCsvField(lead.utmMedium),
      escapeCsvField(lead.utmCampaign),
      escapeCsvField(lead.remarks),
      escapeCsvField(lead.user?.name || "—"),
      String(lead.user?.profileComplete ?? "—"),
      lead.user?.premiumStatus ? "Yes" : "No",
      new Date(lead.createdAt).toISOString(),
      lead.convertedAt ? new Date(lead.convertedAt).toISOString() : "",
    ]);

    const csv =
      headers.join(",") + "\n" + rows.map((r) => r.join(",")).join("\n");

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="leads-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (err: any) {
    return apiError(err.message || "Failed to export leads", 500);
  }
}
