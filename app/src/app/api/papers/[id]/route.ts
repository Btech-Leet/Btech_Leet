import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { requireAdminOrEditor, isAuthResponse } from "@/lib/middleware";
import { deleteFromStorage } from "@/lib/storage";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminOrEditor(req);
  if (isAuthResponse(auth)) return auth;

  const { id } = await params;
  const paper = await prisma.paper.findUnique({ where: { id } });
  if (!paper) return apiError("Paper not found", 404);

  if (paper.fileKey) {
    try { await deleteFromStorage(paper.fileKey); } catch { /* file may not exist */ }
  }

  await prisma.paper.delete({ where: { id } });
  return apiResponse(null, "Paper deleted");
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminOrEditor(req);
  if (isAuthResponse(auth)) return auth;

  const { id } = await params;
  const paper = await prisma.paper.findUnique({ where: { id } });
  if (!paper) return apiError("Paper not found", 404);

  const body = await req.json();
  const { paperSchema } = await import("@/lib/validations");
  const parsed = paperSchema.partial().safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0].message, 422);

  const updated = await prisma.paper.update({ where: { id }, data: parsed.data as any });
  return apiResponse(updated, "Paper updated");
}
