import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { NotificationForm } from "@/components/admin/notification-form";

export const dynamic = "force-dynamic";

export default async function EditNotificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [notification, exams] = await Promise.all([
    prisma.notification.findUnique({ where: { id } }),
    prisma.exam.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!notification) notFound();
  return <NotificationForm initialData={notification} exams={exams} mode="edit" />;
}
