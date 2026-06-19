import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { branchSchema } from "@/lib/validations";
import { requireAdminOrEditor, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const branch = await prisma.branch.findUnique({
    where: { id },
  });
  if (!branch) return apiError("Branch not found", 404);
  return apiResponse(branch);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminOrEditor(req);
  if (isAuthResponse(auth)) return auth;

  const { id } = await params;
  const branch = await prisma.branch.findUnique({ where: { id } });
  if (!branch) return apiError("Branch not found", 404);

  const body = await req.json();
  const parsed = branchSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0].message, 422);

  // Check if another branch has same name or code
  const existing = await prisma.branch.findFirst({
    where: {
      OR: [
        { name: parsed.data.name },
        { code: parsed.data.code }
      ],
      NOT: { id }
    }
  });
  if (existing) return apiError("Another branch with this name or code already exists", 409);

  const updated = await prisma.branch.update({
    where: { id },
    data: parsed.data,
  });
  return apiResponse(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminOrEditor(req);
  if (isAuthResponse(auth)) return auth;

  const { id } = await params;
  const branch = await prisma.branch.findUnique({ where: { id } });
  if (!branch) return apiError("Branch not found", 404);

  await prisma.branch.delete({ where: { id } });
  return apiResponse(null, "Branch deleted");
}
