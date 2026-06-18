import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { examSchema } from "@/lib/validations";
import { requireAdminOrEditor, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError, slugify } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const exam = await prisma.exam.findFirst({
    where: { OR: [{ slug }, { id: slug }], active: true },
    include: {
      state: true,
      papers: { where: { active: true }, orderBy: [{ year: "desc" }, { createdAt: "desc" }] },
      notifications: { where: { published: true }, orderBy: [{ pinned: "desc" }, { createdAt: "desc" }], take: 10 },
      counselling: { where: { active: true } },
    },
  });

  if (!exam) return apiError("Exam not found", 404);
  return apiResponse(exam);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireAdminOrEditor(req);
  if (isAuthResponse(auth)) return auth;

  const { slug } = await params;
  const exam = await prisma.exam.findFirst({ where: { OR: [{ slug }, { id: slug }] } });
  if (!exam) return apiError("Exam not found", 404);

  const body = await req.json();
  const parsed = examSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0].message, 422);

  const updated = await prisma.exam.update({
    where: { id: exam.id },
    data: parsed.data as any,
  });

  return apiResponse(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireAdminOrEditor(req);
  if (isAuthResponse(auth)) return auth;

  const { slug } = await params;
  const exam = await prisma.exam.findFirst({ where: { OR: [{ slug }, { id: slug }] } });
  if (!exam) return apiError("Exam not found", 404);

  await prisma.exam.delete({ where: { id: exam.id } });
  return apiResponse(null, "Exam deleted");
}
