import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const { id: leadId } = await params;

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return apiError("Lead not found", 404);
    }

    const notes = await prisma.leadNote.findMany({
      where: { leadId },
      orderBy: {
        createdAt: "desc",
      },
    });

    return apiResponse(notes);
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch lead notes", 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const { id: leadId } = await params;
    const body = await req.json();
    const { content } = body;

    if (!content || typeof content !== "string" || content.trim() === "") {
      return apiError("Note content is required", 422);
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return apiError("Lead not found", 404);
    }

    const createdBy = auth.email || "Admin";

    const note = await prisma.leadNote.create({
      data: {
        leadId,
        content: content.trim(),
        createdBy,
      },
    });

    return apiResponse(note, "Note added successfully", 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to create lead note", 500);
  }
}
