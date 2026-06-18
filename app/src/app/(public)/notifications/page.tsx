import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Bell, Pin, Filter } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "LEET Exam Notifications – Latest Updates & Alerts",
  description: "Stay updated with the latest BTech Lateral Entry Exam (LEET) notifications including application dates, results, counselling schedules, and important announcements.",
};

const priorityVariant: Record<string, "urgent" | "high" | "medium" | "low"> = {
  URGENT: "urgent", HIGH: "high", MEDIUM: "medium", LOW: "low",
};

async function getNotifications(params: Record<string, string>) {
  const where: Record<string, unknown> = {
    published: true,
    OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
  };
  if (params.examId) where.examId = params.examId;
  if (params.priority) where.priority = params.priority;

  try {
    return await Promise.all([
      prisma.notification.findMany({
        where,
        include: { exam: { select: { name: true, slug: true } } },
        orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      }),
      prisma.exam.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    ]);
  } catch (err) {
    console.error("Failed to load notifications:", err);
    return [[], []];
  }
}

export default async function NotificationsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const [notifications, exams] = await getNotifications(params);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">Notifications</h1>
        <p className="text-gray-500 dark:text-gray-400">Latest LEET exam updates and announcements</p>
      </div>

      {/* Filters */}
      <form className="flex flex-wrap gap-3 mb-8" method="GET">
        <select
          name="priority"
          defaultValue={params.priority || ""}
          className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Filter by priority"
        >
          <option value="">All Priorities</option>
          <option value="URGENT">Urgent</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <select
          name="examId"
          defaultValue={params.examId || ""}
          className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Filter by exam"
        >
          <option value="">All Exams</option>
          {exams.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>

        <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2" aria-label="Apply filters">
          <Filter size={14} aria-hidden="true" /> Filter
        </button>

        {(params.priority || params.examId) && (
          <Link href="/notifications" className="px-5 py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl">
            Clear
          </Link>
        )}
      </form>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{notifications.length} notification{notifications.length !== 1 ? "s" : ""}</p>

      {notifications.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Bell size={40} className="mx-auto mb-4 opacity-30" aria-hidden="true" />
          <p className="text-lg font-medium">No notifications found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n: any) => (
            <Link
              key={n.id}
              href={`/notifications/${n.id}`}
              className="flex items-start gap-4 p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all group"
              aria-label={n.title}
            >
              {n.pinned && <Pin size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" aria-label="Pinned" />}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <Badge variant={priorityVariant[n.priority]}>{n.priority}</Badge>
                  {n.exam && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">{n.exam.name}</span>
                  )}
                </div>
                <h2 className="font-semibold text-gray-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                  {n.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{n.content}</p>
              </div>
              <time dateTime={n.createdAt.toISOString()} className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap hidden sm:block mt-1">
                {formatDate(n.createdAt)}
              </time>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
