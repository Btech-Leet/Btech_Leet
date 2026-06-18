import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Pin, Calendar, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  try {
    const n = await prisma.notification.findUnique({ where: { id } });
    if (!n) return { title: "Notification Not Found" };
    return { title: n.title, description: n.content.slice(0, 160) };
  } catch (err) {
    console.error("Failed to load metadata for notification:", err);
    return { title: "Notification Details" };
  }
}

const priorityVariant: Record<string, "urgent" | "high" | "medium" | "low"> = {
  URGENT: "urgent", HIGH: "high", MEDIUM: "medium", LOW: "low",
};

export default async function NotificationDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  let notification = null;
  try {
    notification = await prisma.notification.findUnique({
      where: { id, published: true },
      include: { exam: { select: { name: true, slug: true } } },
    });
  } catch (err) {
    console.error("Failed to fetch notification details:", err);
  }

  if (!notification) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link href="/notifications" className="hover:text-blue-600">Notifications</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-200 truncate max-w-[200px]">{notification.title}</span>
      </nav>

      <article>
        <header className="mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge variant={priorityVariant[notification.priority]}>{notification.priority}</Badge>
            {notification.pinned && (
              <span className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
                <Pin size={12} aria-hidden="true" /> Pinned
              </span>
            )}
            {notification.exam && (
              <Link href={`/exams/${notification.exam.slug}`} className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                {notification.exam.name}
              </Link>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            {notification.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} aria-hidden="true" />
              <time dateTime={notification.createdAt.toISOString()}>{formatDate(notification.createdAt)}</time>
            </span>
            {notification.expiresAt && (
              <span className="text-orange-500 dark:text-orange-400">
                Expires: {formatDate(notification.expiresAt)}
              </span>
            )}
          </div>
        </header>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-base">
            {notification.content}
          </p>
        </div>

        <div className="mt-6">
          <Link
            href="/notifications"
            className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            aria-label="Back to all notifications"
          >
            <ArrowLeft size={14} aria-hidden="true" /> Back to all notifications
          </Link>
        </div>
      </article>
    </div>
  );
}
