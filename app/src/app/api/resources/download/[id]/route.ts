import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isAuthResponse } from "@/lib/middleware";
import { createClient } from "@supabase/supabase-js";

const bucket = process.env.SUPABASE_STORAGE_BUCKET || "btechleet";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 1. Fetch resource details
  const resource = await prisma.resource.findUnique({
    where: { id },
  });

  if (!resource || !resource.active) {
    return NextResponse.json({ message: "Resource not found" }, { status: 404 });
  }

  if (!resource.fileUrl) {
    return NextResponse.json({ message: "No file associated with this resource" }, { status: 404 });
  }

  const isPaid = resource.price && resource.price > 0;

  // 2. If it's a paid resource, check authentication and purchase
  if (isPaid) {
    const auth = await requireAuth(req);
    if (isAuthResponse(auth)) {
      return auth;
    }

    // Auth is JWTPayload
    const userId = auth.userId;
    const role = auth.role;

    // Admin/Editor bypass
    if (role !== "ADMIN" && role !== "EDITOR") {
      // Check purchase transaction
      const transaction = await prisma.transaction.findFirst({
        where: {
          userId,
          purchaseType: "RESOURCE",
          purchaseItemId: id,
          status: "SUCCESSFUL",
        },
      });

      if (!transaction) {
        return NextResponse.json({ message: "You have not purchased this resource" }, { status: 403 });
      }
    }
  }

  // Increment download count
  try {
    await prisma.resource.update({
      where: { id },
      data: { downloads: { increment: 1 } },
    });
  } catch (err) {
    console.error("Failed to increment download count:", err);
  }

  // 3. Generate secure download link
  if (resource.fileKey && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.SUPABASE_SERVICE_ROLE_KEY || "",
        { auth: { persistSession: false } }
      );

      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .createSignedUrl(resource.fileKey, 300); // 5 minutes expiry

      if (!error && data?.signedUrl) {
        return NextResponse.redirect(data.signedUrl);
      }
    } catch (err) {
      console.error("Failed to generate signed URL:", err);
    }
  }

  // Fallback to direct redirect to public fileUrl
  return NextResponse.redirect(resource.fileUrl);
}
