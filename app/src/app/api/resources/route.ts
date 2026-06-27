import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { resourceSchema } from "@/lib/validations";
import { requireAdminOrEditor, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError, getPaginationParams } from "@/lib/utils";
import { uploadToStorage, generateStoragePath, validateFile, processAndCompressFile } from "@/lib/storage";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const { skip, limit, page } = getPaginationParams(searchParams);
  const branchId = searchParams.get("branchId");
  const semester = searchParams.get("semester");
  const type = searchParams.get("type");
  const q = searchParams.get("q");

  const where: Record<string, unknown> = { active: true };
  if (branchId) where.branchId = branchId;
  if (semester) where.semester = parseInt(semester);
  if (type) where.type = type;
  if (q) where.title = { contains: q, mode: "insensitive" };

  const [resources, total] = await Promise.all([
    prisma.resource.findMany({
      where,
      include: { branch: { select: { name: true, code: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.resource.count({ where }),
  ]);

  return apiResponse({ resources, total, page, limit, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdminOrEditor(req);
    if (isAuthResponse(auth)) return auth;

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const metadata = JSON.parse(formData.get("metadata") as string || "{}");

    const parsed = resourceSchema.safeParse(metadata);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 422);

    if (!file) return apiError("File is required", 400);

    const fileValidation = validateFile({ size: file.size, type: file.type }, "document");
    if (!fileValidation.valid) return apiError(fileValidation.error!, 400);

    const buffer = Buffer.from(await file.arrayBuffer());
    const finalBuffer = await processAndCompressFile(buffer, file.type);
    
    const path = generateStoragePath("resources", file.name);
    const { url } = await uploadToStorage(finalBuffer, path, file.type);

    const resource = await prisma.resource.create({
      data: {
        ...parsed.data,
        fileUrl: url,
        fileKey: path,
        fileSize: finalBuffer.length,
        mimeType: file.type,
      },
    });

    try {
      revalidatePath("/resources");
      revalidatePath("/admin/resources");
    } catch (revalidateErr) {
      console.warn("Failed to revalidate path:", revalidateErr);
    }

    return apiResponse(resource, "Resource uploaded", 201);
  } catch (err: any) {
    console.error("Resource upload error:", err);
    return apiError(err.message || "Failed to upload resource", 500);
  }
}
