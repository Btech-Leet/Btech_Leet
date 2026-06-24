import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/ui/card";
import { Users, BookOpen, FileText, Building2, PenSquare, Mail, ClipboardList, Bell, Tag } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Admin Dashboard | BTech LEET" };

async function getStats() {
  try {
    // Batch 1 – user & lead counts (4 queries)
    const [totalUsers, premiumUsers, totalLeads, pendingReviews] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { premiumStatus: true } }),
      prisma.lead.count(),
      prisma.review.count({ where: { status: "PENDING" } }),
    ]);

    // Batch 2 – content counts (4 queries)
    const [activeCoupons, totalExams, totalPapers, totalColleges] = await Promise.all([
      prisma.coupon.count({ where: { active: true } }),
      prisma.exam.count({ where: { active: true } }),
      prisma.paper.count({ where: { active: true } }),
      prisma.college.count({ where: { active: true } }),
    ]);

    // Batch 3 – remaining counts + lists (4 queries)
    const [totalPosts, totalSubscribers, totalTests, recentNotifications] = await Promise.all([
      prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
      prisma.emailSubscription.count({ where: { active: true } }),
      prisma.mockTest.count({ where: { status: "PUBLISHED" } }),
      prisma.notification.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { exam: { select: { name: true } } },
      }),
    ]);

    // Batch 4 – top posts (1 query)
    const recentPosts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { views: "desc" },
      take: 5,
      select: { id: true, title: true, slug: true, views: true, createdAt: true },
    });

    return {
      totalUsers,
      premiumUsers,
      totalLeads,
      pendingReviews,
      activeCoupons,
      totalExams,
      totalPapers,
      totalColleges,
      totalPosts,
      totalSubscribers,
      totalTests,
      recentNotifications,
      recentPosts,
    };
  } catch (err) {
    console.error("Failed to load admin stats:", err);
    return {
      totalUsers: 0,
      premiumUsers: 0,
      totalLeads: 0,
      pendingReviews: 0,
      activeCoupons: 0,
      totalExams: 0,
      totalPapers: 0,
      totalColleges: 0,
      totalPosts: 0,
      totalSubscribers: 0,
      totalTests: 0,
      recentNotifications: [],
      recentPosts: [],
    };
  }
}

export default async function AdminDashboard() {
  const data = await getStats();

  return (
    <div className="text-slate-900 dark:text-white">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Platform overview and quick stats</p>
        </div>
        <div>
          <a
            href="/admin/analytics"
            className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold shadow-sm transition-all"
          >
            View Full Analytics
          </a>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {[
          { title: "Total Users", value: data.totalUsers, icon: Users },
          { title: "Premium Users", value: data.premiumUsers, icon: Users, isPremium: true },
          { title: "CRM Leads", value: data.totalLeads, icon: ClipboardList },
          { title: "Pending Reviews", value: data.pendingReviews, icon: FileText },
          { title: "Active Coupons", value: data.activeCoupons, icon: Tag },
          { title: "Active Exams", value: data.totalExams, icon: BookOpen },
          { title: "Papers", value: data.totalPapers, icon: FileText },
          { title: "Colleges", value: data.totalColleges, icon: Building2 },
          { title: "Blog Posts", value: data.totalPosts, icon: PenSquare },
          { title: "Subscribers", value: data.totalSubscribers, icon: Mail },
          { title: "Mock Tests", value: data.totalTests, icon: ClipboardList },
        ].map((stat) => (
          <div key={stat.title} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value.toLocaleString()}</p>
              </div>
              <div className={`p-2.5 rounded-lg ${stat.isPremium ? "bg-purple-100 dark:bg-purple-950/50" : "bg-blue-100 dark:bg-blue-950/50"}`}>
                <stat.icon size={18} className={stat.isPremium ? "text-purple-600 dark:text-purple-400" : "text-blue-600 dark:text-blue-400"} aria-hidden="true" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notifications */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell size={16} className="text-blue-400" aria-hidden="true" />
              Recent Notifications
            </h2>
            <a href="/admin/notifications" className="text-xs text-blue-400 hover:underline">View all</a>
          </div>
          {data.recentNotifications.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-500 text-sm">No notifications yet</p>
          ) : (
            <div className="space-y-3">
              {data.recentNotifications.map((n: any) => (
                <div key={n.id} className="flex items-start gap-3 py-2.5 border-b border-slate-200 dark:border-slate-800 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{n.title}</p>
                    {n.exam && <p className="text-xs text-slate-500 dark:text-slate-500">{n.exam.name}</p>}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-500 flex-shrink-0">{formatDate(n.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Blog Posts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <PenSquare size={16} className="text-blue-400" aria-hidden="true" />
              Top Blog Posts
            </h2>
            <a href="/admin/blog" className="text-xs text-blue-400 hover:underline">View all</a>
          </div>
          {data.recentPosts.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-500 text-sm">No posts yet</p>
          ) : (
            <div className="space-y-3">
              {data.recentPosts.map((post: any) => (
                <div key={post.id} className="flex items-start gap-3 py-2.5 border-b border-slate-200 dark:border-slate-800 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{post.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">{formatDate(post.createdAt)}</p>
                  </div>
                  <span className="text-xs text-blue-400 flex-shrink-0 font-medium">{post.views} views</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
