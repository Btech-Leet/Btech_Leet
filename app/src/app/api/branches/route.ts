import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { branchSchema } from "@/lib/validations";
import { requireAdminOrEditor, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET() {
  const branches = await prisma.branch.findMany({ orderBy: { name: "asc" } });
  return apiResponse(branches);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminOrEditor(req);
  if (isAuthResponse(auth)) return auth;

  const body = await req.json();
  const parsed = branchSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0].message, 422);

  const existing = await prisma.branch.findFirst({ where: { OR: [{ name: parsed.data.name }, { code: parsed.data.code }] } });
  if (existing) return apiError("Branch with this name or code already exists", 409);

  const branch = await prisma.branch.create({ data: parsed.data });
  return apiResponse(branch, "Branch created", 201);
}
