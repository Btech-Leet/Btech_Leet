import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { questionSchema } from "@/lib/validations";
import { requireAdminOrEditor, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const testId = searchParams.get("testId");
  if (!testId) return apiError("testId is required", 400);

  const questions = await prisma.question.findMany({
    where: { testId },
    orderBy: { order: "asc" },
  });

  return apiResponse(questions);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminOrEditor(req);
  if (isAuthResponse(auth)) return auth;

  const body = await req.json();
  const parsed = questionSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0].message, 422);

  const question = await prisma.question.create({ data: parsed.data as any });
  return apiResponse(question, "Question created", 201);
}
