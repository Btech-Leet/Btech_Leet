import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiError } from "@/lib/utils";

export const dynamic = "force-dynamic";

function escapeCsvValue(val: any): string {
  if (val === null || val === undefined) return "";
  const str = String(val).trim();
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const inquiries = await prisma.contactInquiry.findMany({
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "ID",
      "Name",
      "Email",
      "Mobile",
      "Subject",
      "Message",
      "Status",
      "Reply",
      "Replied At",
      "Created At"
    ];

    const csvRows = [headers.join(",")];

    for (const inq of inquiries) {
      const row = [
        escapeCsvValue(inq.id),
        escapeCsvValue(inq.name),
        escapeCsvValue(inq.email),
        escapeCsvValue(inq.mobile),
        escapeCsvValue(inq.subject),
        escapeCsvValue(inq.message),
        escapeCsvValue(inq.status),
        escapeCsvValue(inq.reply),
        escapeCsvValue(inq.repliedAt ? inq.repliedAt.toISOString() : ""),
        escapeCsvValue(inq.createdAt.toISOString())
      ];
      csvRows.push(row.join(","));
    }

    const csvContent = csvRows.join("\n");

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=contact_inquiries.csv",
      },
    });
  } catch (err: any) {
    return apiError(err.message || "Failed to export CSV", 500);
  }
}
