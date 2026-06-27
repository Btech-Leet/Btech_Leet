import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOrEditor, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminOrEditor(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const { id } = await params;
    const exists = await prisma.resource.findUnique({ where: { id } });
    if (!exists) return apiError("Resource not found", 404);

    // Delete resource file from storage
    if (exists.fileKey) {
      const { deleteFromStorage } = await import("@/lib/storage");
      try {
        await deleteFromStorage(exists.fileKey);
      } catch (err) {
        console.error("Failed to delete resource file from storage:", err);
      }
    }

    await prisma.resource.delete({ where: { id } });

    revalidatePath("/resources");
    revalidatePath("/admin/resources");

    return apiResponse(null, "Resource deleted successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to delete resource", 500);
  }
}
