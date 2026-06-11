import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { BookOpen, FileText, ClipboardList, Bell, User, Settings } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "My Dashboard | BTech LEET" };

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) redirect("/auth/login");

  const { verifyToken } = await import("@/lib/auth");
  const payload = verifyToken(token);
  if (!payload) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      testAttempts: {
        include: { test: { select: { title: true, slug: true } } },
        orderBy: { completedAt: "desc" },
        take: 5,
      },
      savedPapers: {
        include: { paper: { select: { title: true, fileUrl: true, year: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!user) redirect("/auth/login");

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Profile */}
          <div className="flex items-start gap-4 mb-8 flex-wrap">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {user.name[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{user.email}</p>
              <p className="text-xs text-gray-400 mt-1">Member since {formatDate(user.createdAt)}</p>
            </div>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { href: "/exams", icon: BookOpen, label: "Browse Exams" },
              { href: "/papers", icon: FileText, label: "Papers" },
              { href: "/mock-tests", icon: ClipboardList, label: "Mock Tests" },
              { href: "/notifications", icon: Bell, label: "Notifications" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all text-center">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                    <Icon size={20} className="text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Test Attempts */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ClipboardList size={16} className="text-blue-600" aria-hidden="true" />
                Recent Test Attempts
              </h2>
              {user.testAttempts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">No tests attempted yet</p>
                  <Link href="/mock-tests" className="text-blue-600 dark:text-blue-400 text-sm hover:underline mt-2 block">
                    Start a mock test →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {user.testAttempts.map((attempt: any) => (
                    <div key={attempt.id} className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{attempt.test.title}</p>
                        <p className="text-xs text-gray-400">{formatDate(attempt.completedAt)}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{attempt.score}/{attempt.totalMarks}</p>
                        <p className="text-xs text-gray-400">{Math.round((attempt.score / attempt.totalMarks) * 100)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Papers */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText size={16} className="text-blue-600" aria-hidden="true" />
                Saved Papers
              </h2>
              {user.savedPapers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">No saved papers yet</p>
                  <Link href="/papers" className="text-blue-600 dark:text-blue-400 text-sm hover:underline mt-2 block">
                    Browse papers →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {user.savedPapers.map((sp: any) => (
                    <a key={sp.id} href={sp.paper.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:text-blue-600 dark:hover:text-blue-400 group">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">{sp.paper.title}</p>
                        {sp.paper.year && <p className="text-xs text-gray-400">{sp.paper.year}</p>}
                      </div>
                      <FileText size={14} className="text-gray-400 flex-shrink-0 ml-2" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
