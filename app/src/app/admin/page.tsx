import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/ui/card";
import { Users, BookOpen, FileText, Building2, PenSquare, Mail, ClipboardList, Bell } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Admin Dashboard | BTech LEET" };

async function getStats() {
  const [
    totalUsers,
    totalExams,
    totalPapers,
    totalColleges,
    totalPosts,
    totalSubscribers,
    totalTests,
    recentNotifications,
    recentPosts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.exam.count({ where: { active: true } }),
    prisma.paper.count({ where: { active: true } }),
    prisma.college.count({ where: { active: true } }),
    prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
    prisma.emailSubscription.count({ where: { active: true } }),
    prisma.mockTest.count({ where: { status: "PUBLISHED" } }),
    prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { exam: { select: { name: true } } },
    }),
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { views: "desc" },
      take: 5,
      select: { id: true, title: true, slug: true, views: true, createdAt: true },
    }),
  ]);

  return { totalUsers, totalExams, totalPapers, totalColleges, totalPosts, totalSubscribers, totalTests, recentNotifications, recentPosts };
}

export default async function AdminDashboard() {
  const data = await getStats();

  return (
    <div className="text-white">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1 text-sm">Platform overview and quick stats</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {[
          { title: "Total Users", value: data.totalUsers, icon: Users },
          { title: "Active Exams", value: data.totalExams, icon: BookOpen },
          { title: "Papers", value: data.totalPapers, icon: FileText },
          { title: "Colleges", value: data.totalColleges, icon: Building2 },
          { title: "Blog Posts", value: data.totalPosts, icon: PenSquare },
          { title: "Subscribers", value: data.totalSubscribers, icon: Mail },
          { title: "Mock Tests", value: data.totalTests, icon: ClipboardList },
        ].map((stat) => (
          <div key={stat.title} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value.toLocaleString()}</p>
              </div>
              <div className="p-2.5 bg-blue-950/50 rounded-lg">
                <stat.icon size={18} className="text-blue-400" aria-hidden="true" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notifications */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Bell size={16} className="text-blue-400" aria-hidden="true" />
              Recent Notifications
            </h2>
            <a href="/admin/notifications" className="text-xs text-blue-400 hover:underline">View all</a>
          </div>
          {data.recentNotifications.length === 0 ? (
            <p className="text-gray-500 text-sm">No notifications yet</p>
          ) : (
            <div className="space-y-3">
              {data.recentNotifications.map((n: any) => (
                <div key={n.id} className="flex items-start gap-3 py-2.5 border-b border-gray-800 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">{n.title}</p>
                    {n.exam && <p className="text-xs text-gray-500">{n.exam.name}</p>}
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">{formatDate(n.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Blog Posts */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <PenSquare size={16} className="text-blue-400" aria-hidden="true" />
              Top Blog Posts
            </h2>
            <a href="/admin/blog" className="text-xs text-blue-400 hover:underline">View all</a>
          </div>
          {data.recentPosts.length === 0 ? (
            <p className="text-gray-500 text-sm">No posts yet</p>
          ) : (
            <div className="space-y-3">
              {data.recentPosts.map((post: any) => (
                <div key={post.id} className="flex items-start gap-3 py-2.5 border-b border-gray-800 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">{post.title}</p>
                    <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
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
