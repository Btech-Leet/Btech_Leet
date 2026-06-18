import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { questionSchema } from "@/lib/validations";
import { requireAdminOrEditor, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminOrEditor(req);
  if (isAuthResponse(auth)) return auth;

  const { id } = await params;
  const body = await req.json();

  // Validate the incoming updates (partially)
  const parsed = questionSchema.partial().safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0].message, 422);

  const question = await prisma.question.findUnique({
    where: { id },
  });
  if (!question) return apiError("Question not found", 404);

  const updated = await prisma.question.update({
    where: { id },
    data: parsed.data as any,
  });

  return apiResponse(updated, "Question updated successfully");
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminOrEditor(req);
  if (isAuthResponse(auth)) return auth;

  const { id } = await params;
  const question = await prisma.question.findUnique({
    where: { id },
  });
  if (!question) return apiError("Question not found", 404);

  await prisma.question.delete({
    where: { id },
  });

  return apiResponse(null, "Question deleted successfully");
}
