import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { notificationSchema } from "@/lib/validations";
import { requireAdminOrEditor, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError, getPaginationParams } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const { skip, limit, page } = getPaginationParams(searchParams);
  const examId = searchParams.get("examId");
  const priority = searchParams.get("priority");
  const pinned = searchParams.get("pinned");

  const where: Record<string, unknown> = {
    published: true,
    OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
  };
  if (examId) where.examId = examId;
  if (priority) where.priority = priority;
  if (pinned === "true") where.pinned = true;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      include: { exam: { select: { name: true, slug: true } } },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return apiResponse({ notifications, total, page, limit, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminOrEditor(req);
  if (isAuthResponse(auth)) return auth;

  const body = await req.json();
  const parsed = notificationSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0].message, 422);

  const notification = await prisma.notification.create({
    data: {
      ...parsed.data,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    },
  });

  return apiResponse(notification, "Notification created", 201);
}
