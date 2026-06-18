import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { mockTestSchema } from "@/lib/validations";
import { requireAdminOrEditor, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError, slugify, getPaginationParams } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const { skip, limit, page } = getPaginationParams(searchParams);
  const examId = searchParams.get("examId");
  const status = searchParams.get("status") || "PUBLISHED";

  const where: Record<string, unknown> = { status };
  if (examId) where.examId = examId;

  const [tests, total] = await Promise.all([
    prisma.mockTest.findMany({
      where,
      include: { _count: { select: { questions: true, attempts: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.mockTest.count({ where }),
  ]);

  return apiResponse({ tests, total, page, limit, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminOrEditor(req);
  if (isAuthResponse(auth)) return auth;

  const body = await req.json();
  const parsed = mockTestSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0].message, 422);

  const data = parsed.data;
  if (!data.slug) data.slug = slugify(data.title);

  const existing = await prisma.mockTest.findUnique({ where: { slug: data.slug } });
  if (existing) data.slug = `${data.slug}-${Date.now()}`;

  const test = await prisma.mockTest.create({ data: data as any });
  return apiResponse(test, "Mock test created", 201);
}
