import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Manage Notifications | Admin" };

export default async function AdminNotificationsPage() {
  const notifications = await prisma.notification.findMany({
    include: { exam: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const priorityVariants: Record<string, "urgent" | "high" | "medium" | "low"> = {
    URGENT: "urgent", HIGH: "high", MEDIUM: "medium", LOW: "low",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{notifications.length} total</p>
        </div>
        <Link href="/admin/notifications/new" className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors" aria-label="Add notification">
          <Plus size={16} aria-hidden="true" /> Add Notification
        </Link>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-500 dark:text-slate-500">
            No notifications yet.
          </div>
        ) : (
          notifications.map((n: any) => (
            <div key={n.id} className="flex items-start gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <Badge variant={priorityVariants[n.priority]}>{n.priority}</Badge>
                  {n.pinned && <Badge variant="default">Pinned</Badge>}
                  {!n.published && <Badge variant="secondary">Draft</Badge>}
                  {n.exam && <span className="text-xs text-slate-500 dark:text-slate-400">{n.exam.name}</span>}
                </div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{n.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{n.content}</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">{formatDate(n.createdAt)}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Link href={`/admin/notifications/${n.id}/edit`} className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors" aria-label={`Edit ${n.title}`}>
                  <Edit size={15} aria-hidden="true" />
                </Link>
                <DeleteButton endpoint={`/api/notifications/${n.id}`} label={n.title} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
