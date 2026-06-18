import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { authorSchema } from "@/lib/validations";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  const authors = await prisma.author.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { books: true } },
    },
  });

  return apiResponse(authors);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const body = await req.json();
    const parsed = authorSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const data = parsed.data;
    if (!data.slug) {
      data.slug = generateSlug(data.name);
    }

    // Ensure slug uniqueness
    const existing = await prisma.author.findUnique({ where: { slug: data.slug } });
    if (existing) {
      data.slug = `${data.slug}-${Date.now()}`;
    }

    const author = await prisma.author.create({
      data: {
        ...data,
        slug: data.slug as string,
      },
    });

    return apiResponse(author, "Author created successfully", 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to create author", 500);
  }
}
