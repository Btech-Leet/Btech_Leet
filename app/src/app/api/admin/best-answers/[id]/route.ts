import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { bestAnswerPageSchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  const { id } = await params;
  const page = await prisma.bestAnswerPage.findUnique({ where: { id } });
  if (!page) return apiError("Page not found", 404);

  return apiResponse(page);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const { id } = await params;
    const body = await req.json();

    const parsed = bestAnswerPageSchema.partial().safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const exists = await prisma.bestAnswerPage.findUnique({ where: { id } });
    if (!exists) return apiError("Page not found", 404);

    const updated = await prisma.bestAnswerPage.update({
      where: { id },
      data: parsed.data as any,
    });

    return apiResponse(updated, "Page updated successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to update page", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const { id } = await params;
    const exists = await prisma.bestAnswerPage.findUnique({ where: { id } });
    if (!exists) return apiError("Page not found", 404);

    await prisma.bestAnswerPage.delete({ where: { id } });

    return apiResponse(null, "Page deleted successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to delete page", 500);
  }
}
