import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { expertSchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  const { id } = await params;
  const expert = await prisma.expert.findUnique({
    where: { id },
  });

  if (!expert) return apiError("Expert profile not found", 404);

  return apiResponse(expert);
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
    
    const parsed = expertSchema.partial().safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const exists = await prisma.expert.findUnique({ where: { id } });
    if (!exists) return apiError("Expert profile not found", 404);

    const updated = await prisma.expert.update({
      where: { id },
      data: parsed.data as any,
    });

    return apiResponse(updated, "Expert profile updated successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to update expert profile", 500);
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
    const exists = await prisma.expert.findUnique({ where: { id } });
    if (!exists) return apiError("Expert profile not found", 404);

    // Delete associated photo from Supabase storage if it exists
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
        console.error("Failed to delete expert photo from storage:", err);
      }
    }

    await prisma.expert.delete({
      where: { id },
    });

    return apiResponse(null, "Expert profile deleted successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to delete expert profile", 500);
  }
}
