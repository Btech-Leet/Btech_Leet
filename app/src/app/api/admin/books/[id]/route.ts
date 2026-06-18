import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { bookSchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  const { id } = await params;
  const book = await prisma.book.findUnique({
    where: { id },
    include: { author: true },
  });

  if (!book) return apiError("Book not found", 404);

  return apiResponse(book);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const { id } = await params;
    const body = await req.json();

    const parsed = bookSchema.partial().safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const exists = await prisma.book.findUnique({ where: { id } });
    if (!exists) return apiError("Book not found", 404);

    const updated = await prisma.book.update({
      where: { id },
      data: parsed.data,
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    return apiResponse(updated, "Book updated successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to update book", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const { id } = await params;
    const exists = await prisma.book.findUnique({ where: { id } });
    if (!exists) return apiError("Book not found", 404);

    // Delete cover image from storage
    if (exists.coverImage) {
      const { deleteFromStorage } = await import("@/lib/storage");
      try {
        const urlObj = new URL(exists.coverImage);
        const pathParts = urlObj.pathname.split("/storage/v1/object/public/btechleet/");
        if (pathParts.length > 1) {
          const path = decodeURIComponent(pathParts[1]);
          await deleteFromStorage(path);
        }
      } catch (err) {
        console.error("Failed to delete book cover from storage:", err);
      }
    }

    // Delete book file from storage
    if (exists.fileKey) {
      const { deleteFromStorage } = await import("@/lib/storage");
      try {
        await deleteFromStorage(exists.fileKey);
      } catch (err) {
        console.error("Failed to delete book file from storage:", err);
      }
    }

    await prisma.book.delete({ where: { id } });

    return apiResponse(null, "Book deleted successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to delete book", 500);
  }
}
