import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { deleteFromStorage } from "@/lib/storage";

// PATCH: Toggle active status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  const { id } = await params;

  try {
    const banner = await prisma.promoBanner.findUnique({ where: { id } });
    if (!banner) return apiError("Banner not found", 404);

    const updated = await prisma.promoBanner.update({
      where: { id },
      data: { active: !banner.active },
    });

    return apiResponse(updated, `Banner ${updated.active ? "activated" : "deactivated"}`);
  } catch (err: any) {
    return apiError(err.message || "Failed to update banner", 500);
  }
}

// DELETE: Remove banner and its image from storage
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  const { id } = await params;

  try {
    const banner = await prisma.promoBanner.findUnique({ where: { id } });
    if (!banner) return apiError("Banner not found", 404);

    // Delete image from Supabase Storage
    if (banner.imageKey) {
      try {
        await deleteFromStorage(banner.imageKey);
      } catch (err) {
        console.error("Failed to delete banner image from storage:", err);
      }
    }

    await prisma.promoBanner.delete({ where: { id } });

    return apiResponse(null, "Banner deleted successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to delete banner", 500);
  }
}
