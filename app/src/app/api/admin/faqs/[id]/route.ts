import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { faqSchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  const { id } = await params;
  const faq = await prisma.fAQ.findUnique({
    where: { id },
  });

  if (!faq) return apiError("FAQ not found", 404);

  return apiResponse(faq);
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
    
    // Support partial updates (like toggling active or editing order) by using partial schema validation
    const parsed = faqSchema.partial().safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const exists = await prisma.fAQ.findUnique({ where: { id } });
    if (!exists) return apiError("FAQ not found", 404);

    const updated = await prisma.fAQ.update({
      where: { id },
      data: parsed.data,
    });

    return apiResponse(updated, "FAQ updated successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to update FAQ", 500);
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
    const exists = await prisma.fAQ.findUnique({ where: { id } });
    if (!exists) return apiError("FAQ not found", 404);

    await prisma.fAQ.delete({
      where: { id },
    });

    return apiResponse(null, "FAQ deleted successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to delete FAQ", 500);
  }
}
