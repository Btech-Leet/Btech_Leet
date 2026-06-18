import { NextRequest } from "next/server";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { uploadToStorage, generateStoragePath, validateFile, processAndCompressFile } from "@/lib/storage";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = formData.get("folder") as string || "misc";

    if (!file) {
      return apiError("No file uploaded", 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let contentType = file.type;
    let fileName = file.name;

    // Validate size before compression using global limits
    const validation = validateFile({ size: file.size, type: file.type }, file.type.startsWith("image/") ? "image" : "document");
    if (!validation.valid) {
      return apiError(validation.error!, 400);
    }

    // Process and aggressively compress if necessary
    const finalBuffer = await processAndCompressFile(buffer, contentType);
    
    if (file.type.startsWith("image/")) {
       // Our processAndCompressFile converts images to webp
       contentType = "image/webp";
       const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
       fileName = `${baseName}.webp`;
    }

    const storagePath = generateStoragePath(folder, fileName);
    const result = await uploadToStorage(finalBuffer, storagePath, contentType);

    // Save to media library database if required (Feature #43)
    try {
      const { prisma } = await import("@/lib/prisma");
      await prisma.mediaFile.create({
        data: {
          name: fileName,
          url: result.url,
          path: result.path,
          mimeType: contentType,
          size: finalBuffer.length,
          folder,
        }
      });
    } catch (dbErr) {
      // If media file table save fails, we still return the upload result (since table might not be generated or query fails)
      console.error("Failed to register upload in MediaFile model:", dbErr);
    }

    return apiResponse(result, "File uploaded successfully");
  } catch (err: any) {
    return apiError(err.message || "Upload failed", 500);
  }
}
