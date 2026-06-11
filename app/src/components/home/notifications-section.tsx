import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowRight, Pin } from "lucide-react";
import { formatDate } from "@/lib/utils";

async function getNotifications() {
  try {
    return prisma.notification.findMany({
      where: {
        published: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      include: { exam: { select: { name: true } } },
      take: 5,
    });
  } catch {
    return [];
  }
}

const priorityStyles: Record<string, string> = {
  URGENT: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  MEDIUM: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  LOW: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

export async function NotificationsSection() {
  const notifications = await getNotifications();

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900/50" aria-labelledby="notifications-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <h2 id="notifications-heading" className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Latest Notifications
            </h2>
            <p className="text-gray-500 dark:text-gray-400">Stay updated with the latest LEET exam news</p>
          </div>
          <Link
            href="/notifications"
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:gap-3 transition-all text-sm"
            aria-label="View all notifications"
          >
            View All <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No notifications yet. Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n: any) => (
              <Link
                key={n.id}
                href={`/notifications/${n.id}`}
                className="flex items-start gap-4 p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all duration-150 group"
                aria-label={n.title}
              >
                {n.pinned && (
                  <Pin size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" aria-label="Pinned" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityStyles[n.priority]}`}>
                      {n.priority}
                    </span>
                    {n.exam && (
                      <span className="text-xs text-gray-400">{n.exam.name}</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                    {n.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{n.content}</p>
                </div>
                <time dateTime={n.createdAt.toISOString()} className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap hidden sm:block">
                  {formatDate(n.createdAt)}
                </time>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
