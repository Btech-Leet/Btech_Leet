import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadToStorage, generateStoragePath, validateFile, processAndCompressFile } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const linkUrl = formData.get("linkUrl") as string;
    const file = formData.get("file") as File;

    if (!title || !file) {
      return NextResponse.json({ message: "Title and Image are required" }, { status: 400 });
    }

    // Validate
    const validation = validateFile({ size: file.size, type: file.type }, "image");
    if (!validation.valid) {
      return NextResponse.json({ message: validation.error }, { status: 400 });
    }

    // Process & compress
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const compressedBuffer = await processAndCompressFile(buffer, file.type);

    // Upload
    const path = generateStoragePath("promo-banners", file.name.replace(/\.[^/.]+$/, "") + ".webp");
    const finalContentType = file.type.startsWith("image/") ? "image/webp" : file.type;
    
    const { url, path: storagePath } = await uploadToStorage(compressedBuffer, path, finalContentType);

    // Deactivate previous banners
    await prisma.promoBanner.updateMany({
      where: { active: true },
      data: { active: false }
    });

    const banner = await prisma.promoBanner.create({
      data: {
        title,
        imageUrl: url,
        imageKey: storagePath,
        linkUrl: linkUrl || null,
        active: true,
      }
    });

    return NextResponse.json({ banner });
  } catch (error: any) {
    console.error("Error creating banner:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}
