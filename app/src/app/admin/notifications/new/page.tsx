import { prisma } from "@/lib/prisma";
import { NotificationForm } from "@/components/admin/notification-form";

export const dynamic = "force-dynamic";

export default async function NewNotificationPage() {
  const exams = await prisma.exam.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } });
  return <NotificationForm exams={exams} mode="create" />;
}
