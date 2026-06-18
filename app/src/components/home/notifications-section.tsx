import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

async function getNotifications() {
  try {
    return await prisma.notification.findMany({
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
  URGENT: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800",
  HIGH: "bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-800",
  MEDIUM: "bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800",
  LOW: "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800",
};

export async function NotificationsSection() {
  const notifications = await getNotifications();

  return (
    <section className="py-xxl bg-slate-50 dark:bg-slate-900 px-margin-mobile md:px-margin-desktop transition-colors duration-300" aria-labelledby="notifications-heading">
      <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-3 gap-xl">
        {/* Left column - title */}
        <div className="lg:col-span-1">
          <h2 id="notifications-heading" className="text-headline-lg-mobile md:text-headline-lg font-headline-lg-mobile md:font-headline-lg text-slate-900 dark:text-white mb-sm transition-colors duration-300">
            Academic Bulletin
          </h2>
          <p className="text-body-md font-body-md text-slate-650 dark:text-slate-400 mb-lg transition-colors duration-300">
            Stay synchronized with the latest announcements, schedule changes, and crucial deadlines.
          </p>
          <Link
            href="/notifications"
            className="text-label-md font-label-md text-slate-700 dark:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors inline-flex items-center gap-2"
            aria-label="View all notifications"
          >
            View All Bulletins
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
          </Link>
        </div>

        {/* Right column - notification items */}
        <div className="lg:col-span-2 flex flex-col gap-sm">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p>No notifications yet. Check back soon.</p>
            </div>
          ) : (
            notifications.map((n: any) => {
              const date = new Date(n.createdAt);
              const monthShort = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
              const day = date.getDate();

              return (
                <Link
                  key={n.id}
                  href={`/notifications/${n.id}`}
                  className="bg-white dark:bg-slate-800 p-md rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-md sm:items-center justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-colors group"
                  aria-label={n.title}
                >
                  <div className="flex items-start sm:items-center gap-md">
                    {/* Date block */}
                    <div className="hidden sm:flex flex-col items-center justify-center bg-slate-200 dark:bg-slate-700 w-16 h-16 rounded-lg text-slate-900 dark:text-white shrink-0 transition-colors duration-300">
                      <span className="text-label-md font-label-md font-bold">{monthShort}</span>
                      <span className="text-headline-md font-headline-md">{day}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${priorityStyles[n.priority] || priorityStyles.LOW}`}>
                          {n.priority === "URGENT" ? "Exam Date" : n.priority === "MEDIUM" ? "Result" : n.priority === "HIGH" ? "Update" : "Info"}
                        </span>
                        <span className="text-caption font-caption text-slate-600 dark:text-slate-400 sm:hidden transition-colors duration-300">
                          {formatDate(n.createdAt)}
                        </span>
                      </div>
                      <h4 className="text-body-lg font-body-lg font-semibold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        {n.title}
                      </h4>
                    </div>
                  </div>
                  <span className="text-slate-400 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors p-2 self-start sm:self-auto shrink-0 flex items-center">
                    <span className="material-symbols-outlined text-[18px]">arrow_forward_ios</span>
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
