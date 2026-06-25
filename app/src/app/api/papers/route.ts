import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { paperSchema } from "@/lib/validations";
import { requireAdminOrEditor, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError, getPaginationParams } from "@/lib/utils";
import { uploadToStorage, generateStoragePath, validateFile, processAndCompressFile } from "@/lib/storage";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const { skip, limit, page } = getPaginationParams(searchParams);
  const examId = searchParams.get("examId");
  const type = searchParams.get("type");
  const q = searchParams.get("q");

  const where: Record<string, unknown> = { active: true };
  if (examId) where.examId = examId;
  if (type) where.type = type;
  if (q) where.title = { contains: q, mode: "insensitive" };

  const [papers, total] = await Promise.all([
    prisma.paper.findMany({
      where,
      include: { exam: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.paper.count({ where }),
  ]);

  return apiResponse({ papers, total, page, limit, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdminOrEditor(req);
    if (isAuthResponse(auth)) return auth;

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const metadata = JSON.parse(formData.get("metadata") as string || "{}");

    const parsed = paperSchema.safeParse(metadata);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 422);

    if (!file) return apiError("File is required", 400);

    const fileValidation = validateFile({ size: file.size, type: file.type }, "document");
    if (!fileValidation.valid) return apiError(fileValidation.error!, 400);

    const buffer = Buffer.from(await file.arrayBuffer());
    const finalBuffer = await processAndCompressFile(buffer, file.type);
    
    const path = generateStoragePath("papers", file.name);
    const { url } = await uploadToStorage(finalBuffer, path, file.type);

    const paper = await prisma.paper.create({
      data: {
        ...parsed.data,
        fileUrl: url,
        fileKey: path,
        fileSize: finalBuffer.length,
        mimeType: file.type,
      },
    });

    return apiResponse(paper, "Paper uploaded", 201);
  } catch (err: any) {
    console.error("Paper upload error:", err);
    return apiError(err.message || "Failed to upload paper", 500);
  }
}
