import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { notificationSchema } from "@/lib/validations";
import { requireAdminOrEditor, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notification = await prisma.notification.findUnique({
    where: { id },
    include: { exam: { select: { name: true, slug: true } } },
  });
  if (!notification) return apiError("Notification not found", 404);
  return apiResponse(notification);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminOrEditor(req);
  if (isAuthResponse(auth)) return auth;

  const { id } = await params;
  const body = await req.json();
  const parsed = notificationSchema.partial().safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0].message, 422);

  const updated = await prisma.notification.update({
    where: { id },
    data: {
      ...parsed.data,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
    },
  });

  return apiResponse(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminOrEditor(req);
  if (isAuthResponse(auth)) return auth;

  const { id } = await params;
  await prisma.notification.delete({ where: { id } });
  return apiResponse(null, "Notification deleted");
}
