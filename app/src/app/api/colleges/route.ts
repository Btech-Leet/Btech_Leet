import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { collegeSchema } from "@/lib/validations";
import { requireAdminOrEditor, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError, slugify, getPaginationParams } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const { skip, limit, page } = getPaginationParams(searchParams);
  const stateId = searchParams.get("stateId");
  const type = searchParams.get("type");
  const featured = searchParams.get("featured");
  const q = searchParams.get("q");

  const where: Record<string, unknown> = { active: true };
  if (stateId) where.stateId = stateId;
  if (type) where.type = type;
  if (featured === "true") where.featured = true;
  if (q) where.name = { contains: q, mode: "insensitive" };

  const [colleges, total] = await Promise.all([
    prisma.college.findMany({
      where,
      include: {
        state: { select: { name: true, code: true } },
        branches: { include: { branch: { select: { name: true, code: true } } } },
      },
      orderBy: [{ featured: "desc" }, { ranking: "asc" }, { name: "asc" }],
      skip,
      take: limit,
    }),
    prisma.college.count({ where }),
  ]);

  return apiResponse({ colleges, total, page, limit, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminOrEditor(req);
  if (isAuthResponse(auth)) return auth;

  const body = await req.json();
  const parsed = collegeSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0].message, 422);

  const data = parsed.data;
  if (!data.slug) data.slug = slugify(data.name);

  const existing = await prisma.college.findUnique({ where: { slug: data.slug } });
  if (existing) data.slug = `${data.slug}-${Date.now()}`;

  const college = await prisma.college.create({ data: data as any });
  return apiResponse(college, "College created", 201);
}
