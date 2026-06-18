import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { authorSchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  const { id } = await params;
  const author = await prisma.author.findUnique({
    where: { id },
    include: { books: true },
  });

  if (!author) return apiError("Author not found", 404);

  return apiResponse(author);
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

    const parsed = authorSchema.partial().safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const exists = await prisma.author.findUnique({ where: { id } });
    if (!exists) return apiError("Author not found", 404);

    const updated = await prisma.author.update({
      where: { id },
      data: parsed.data,
    });

    return apiResponse(updated, "Author updated successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to update author", 500);
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
    const exists = await prisma.author.findUnique({ where: { id } });
    if (!exists) return apiError("Author not found", 404);

    // Delete associated photo from storage
    if (exists.photo) {
      const { deleteFromStorage } = await import("@/lib/storage");
      try {
        const urlObj = new URL(exists.photo);
        const pathParts = urlObj.pathname.split("/storage/v1/object/public/btechleet/");
        if (pathParts.length > 1) {
          const path = decodeURIComponent(pathParts[1]);
          await deleteFromStorage(path);
        }
      } catch (err) {
        console.error("Failed to delete author photo from storage:", err);
      }
    }

    await prisma.author.delete({ where: { id } });

    return apiResponse(null, "Author deleted successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to delete author", 500);
  }
}
