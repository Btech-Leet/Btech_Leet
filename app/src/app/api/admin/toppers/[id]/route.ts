import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { topperSchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  const { id } = await params;
  const topper = await prisma.topper.findUnique({
    where: { id },
  });

  if (!topper) return apiError("Topper profile not found", 404);

  return apiResponse(topper);
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
    
    const parsed = topperSchema.partial().safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const exists = await prisma.topper.findUnique({ where: { id } });
    if (!exists) return apiError("Topper profile not found", 404);

    const updated = await prisma.topper.update({
      where: { id },
      data: parsed.data,
    });

    return apiResponse(updated, "Topper profile updated successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to update topper profile", 500);
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
    const exists = await prisma.topper.findUnique({ where: { id } });
    if (!exists) return apiError("Topper profile not found", 404);

    // Delete associated image from Supabase storage if it exists
    if (exists.image) {
      const { deleteFromStorage } = await import("@/lib/storage");
      try {
        const urlObj = new URL(exists.image);
        const pathParts = urlObj.pathname.split("/storage/v1/object/public/btechleet/");
        if (pathParts.length > 1) {
          const path = decodeURIComponent(pathParts[1]);
          await deleteFromStorage(path);
        }
      } catch (err) {
        console.error("Failed to delete topper image from storage:", err);
      }
    }

    await prisma.topper.delete({
      where: { id },
    });

    return apiResponse(null, "Topper profile deleted successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to delete topper profile", 500);
  }
}
