import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { bookSchema } from "@/lib/validations";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  const books = await prisma.book.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true } },
    },
  });

  return apiResponse(books);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const body = await req.json();
    const parsed = bookSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const data = parsed.data;
    if (!data.slug) {
      data.slug = generateSlug(data.name);
    }

    // Ensure slug uniqueness
    const existing = await prisma.book.findUnique({ where: { slug: data.slug } });
    if (existing) {
      data.slug = `${data.slug}-${Date.now()}`;
    }

    const book = await prisma.book.create({
      data: {
        name: data.name,
        slug: data.slug as string,
        coverImage: data.coverImage,
        description: data.description,
        price: data.price,
        category: data.category,
        fileUrl: data.fileUrl,
        fileKey: data.fileKey,
        fileSize: data.fileSize,
        authorId: data.authorId || null,
        active: data.active,
        featured: data.featured,
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    return apiResponse(book, "Book created successfully", 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to create book", 500);
  }
}
