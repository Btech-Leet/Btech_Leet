import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ChevronRight, Bell, AlertTriangle, Info, CheckCircle } from "lucide-react";

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

const priorityConfig: Record<string, { bg: string; icon: typeof Bell; label: string }> = {
  URGENT: {
    bg: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    icon: AlertTriangle,
    label: "Exam Date",
  },
  HIGH: {
    bg: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
    icon: Bell,
    label: "Update",
  },
  MEDIUM: {
    bg: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20",
    icon: CheckCircle,
    label: "Result",
  },
  LOW: {
    bg: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    icon: Info,
    label: "Info",
  },
};

export async function NotificationsSection() {
  const notifications = await getNotifications();

  return (
    <section className="py-24 relative overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Left column */}
        <div className="lg:col-span-1 flex flex-col justify-center">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Academic <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Bulletin</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            Stay synchronized with the latest announcements, schedule changes, and crucial deadlines.
          </p>
          <Link
            href="/notifications"
            className="group inline-flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 px-6 py-3 rounded-full border border-slate-200 dark:border-slate-800 hover:border-orange-500/50 transition-all shadow-sm hover:shadow-md w-max"
          >
            View All Bulletins
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform text-orange-500" />
          </Link>
        </div>

        {/* Right column - notification items */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800">
              <Bell size={32} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No notifications yet. Check back soon.</p>
            </div>
          ) : (
            notifications.map((n: any) => {
              const date = new Date(n.createdAt);
              const monthShort = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
              const day = date.getDate();
              const config = priorityConfig[n.priority] || priorityConfig.LOW;
              const IconComponent = config.icon;

              return (
                <Link
                  key={n.id}
                  href={`/notifications/${n.id}`}
                  className="group relative bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    {/* Date block */}
                    <div className="hidden sm:flex flex-col items-center justify-center bg-white dark:bg-slate-800 w-16 h-16 rounded-2xl text-slate-900 dark:text-white shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm">
                      <span className="text-[10px] font-black tracking-wider text-slate-500 dark:text-slate-400 uppercase">{monthShort}</span>
                      <span className="text-2xl font-black leading-none">{day}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ${config.bg}`}>
                          <IconComponent size={10} />
                          {config.label}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-snug">
                        {n.title}
                      </h3>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-400 dark:text-slate-600 group-hover:text-orange-500 transition-colors shrink-0 self-start sm:self-auto group-hover:translate-x-1 transition-transform" />
                </Link>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
