import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { examSchema } from "@/lib/validations";
import { requireAdminOrEditor, isAuthResponse, rateLimit, getIP } from "@/lib/middleware";
import { apiResponse, apiError, slugify, getPaginationParams } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const { skip, limit, page } = getPaginationParams(searchParams);
  const type = searchParams.get("type");
  const stateId = searchParams.get("stateId");
  const featured = searchParams.get("featured");
  const q = searchParams.get("q");

  const where: Record<string, unknown> = { active: true };
  if (type) where.type = type;
  if (stateId) where.stateId = stateId;
  if (featured === "true") where.featured = true;
  if (q) where.name = { contains: q, mode: "insensitive" };

  const [exams, total] = await Promise.all([
    prisma.exam.findMany({
      where,
      include: { state: { select: { name: true, code: true } } },
      orderBy: [{ featured: "desc" }, { name: "asc" }],
      skip,
      take: limit,
    }),
    prisma.exam.count({ where }),
  ]);

  return apiResponse({ exams, total, page, limit, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminOrEditor(req);
  if (isAuthResponse(auth)) return auth;

  const ip = getIP(req);
  const { allowed } = rateLimit(ip, 30, 60 * 1000);
  if (!allowed) return apiError("Rate limit exceeded", 429);

  const body = await req.json();
  const parsed = examSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0].message, 422);

  const data = parsed.data;
  if (!data.slug) data.slug = slugify(data.name);

  const existing = await prisma.exam.findUnique({ where: { slug: data.slug } });
  if (existing) data.slug = `${data.slug}-${Date.now()}`;

  const exam = await prisma.exam.create({ data: data as any });
  return apiResponse(exam, "Exam created", 201);
}
