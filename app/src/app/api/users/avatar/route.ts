import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { uploadToStorage, deleteFromStorage, generateStoragePath } from "@/lib/storage";
import { compressImage } from "@/lib/image";
import { calculateProfileCompletion } from "@/lib/profile";

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return apiError("No file uploaded", 400);
    }

    // Check size limit: 2MB
    const maxSizeBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return apiError("File too large. Max 2MB allowed.", 400);
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return apiError("Invalid file type. Allowed: JPEG, PNG, WEBP.", 400);
    }

    // Convert file to buffer and compress/convert to WebP
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    
    // Compress to WebP (max width 400px for avatar, quality 85)
    const compressedBuffer = await compressImage(fileBuffer, 400, 85);

    // Get current user to check if they already have an avatar to delete
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    if (user.avatar) {
      // Try to parse the path from the URL to delete the old one
      try {
        const urlObj = new URL(user.avatar);
        const pathParts = urlObj.pathname.split("/storage/v1/object/public/btechleet/");
        if (pathParts.length > 1) {
          const oldPath = decodeURIComponent(pathParts[1]);
          await deleteFromStorage(oldPath);
        }
      } catch (err) {
        console.error("Failed to delete old avatar:", err);
      }
    }

    // Upload to Supabase Storage
    const storagePath = generateStoragePath("avatars", `${auth.userId}.webp`);
    const uploadResult = await uploadToStorage(compressedBuffer, storagePath, "image/webp");

    // Update database
    const mergedUser = {
      name: user.name,
      avatar: uploadResult.url,
      mobile: user.mobile,
      state: user.state,
      collegeName: user.collegeName,
      branch: user.branch,
      passingYear: user.passingYear,
      examTargets: user.examTargets,
    };
    const profileComplete = calculateProfileCompletion(mergedUser);

    const updatedUser = await prisma.user.update({
      where: { id: auth.userId },
      data: {
        avatar: uploadResult.url,
        profileComplete,
      },
      select: {
        avatar: true,
        profileComplete: true,
      },
    });

    return apiResponse(updatedUser, "Avatar uploaded successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to upload avatar", 500);
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    if (user.avatar) {
      // Try to delete from Supabase storage
      try {
        const urlObj = new URL(user.avatar);
        const pathParts = urlObj.pathname.split("/storage/v1/object/public/btechleet/");
        if (pathParts.length > 1) {
          const oldPath = decodeURIComponent(pathParts[1]);
          await deleteFromStorage(oldPath);
        }
      } catch (err) {
        console.error("Failed to delete avatar from storage:", err);
      }
    }

    const mergedUser = {
      name: user.name,
      avatar: null,
      mobile: user.mobile,
      state: user.state,
      collegeName: user.collegeName,
      branch: user.branch,
      passingYear: user.passingYear,
      examTargets: user.examTargets,
    };
    const profileComplete = calculateProfileCompletion(mergedUser);

    const updatedUser = await prisma.user.update({
      where: { id: auth.userId },
      data: {
        avatar: null,
        profileComplete,
      },
      select: {
        avatar: true,
        profileComplete: true,
      },
    });

    return apiResponse(updatedUser, "Avatar deleted successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to delete avatar", 500);
  }
}
