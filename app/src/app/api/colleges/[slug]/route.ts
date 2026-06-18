import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { collegeSchema } from "@/lib/validations";
import { requireAdminOrEditor, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const college = await prisma.college.findFirst({
    where: { OR: [{ slug }, { id: slug }], active: true },
    include: {
      state: true,
      branches: { include: { branch: true } },
    },
  });
  if (!college) return apiError("College not found", 404);
  return apiResponse(college);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireAdminOrEditor(req);
  if (isAuthResponse(auth)) return auth;

  const { slug } = await params;
  const college = await prisma.college.findFirst({ where: { OR: [{ slug }, { id: slug }] } });
  if (!college) return apiError("College not found", 404);

  const body = await req.json();
  const parsed = collegeSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0].message, 422);

  const updated = await prisma.college.update({ where: { id: college.id }, data: parsed.data as any });
  return apiResponse(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireAdminOrEditor(req);
  if (isAuthResponse(auth)) return auth;

  const { slug } = await params;
  const college = await prisma.college.findFirst({ where: { OR: [{ slug }, { id: slug }] } });
  if (!college) return apiError("College not found", 404);

  await prisma.college.delete({ where: { id: college.id } });
  return apiResponse(null, "College deleted");
}
