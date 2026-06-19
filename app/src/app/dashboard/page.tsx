import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, ClipboardList, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard Overview | BTech LEET" };

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
    <div className="space-y-6">
      {/* Header welcome banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-y-6 translate-x-6">
          <Sparkles size={200} />
        </div>
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
              Student Dashboard
            </span>
            {user.premiumStatus && (
              <span className="text-xs font-bold uppercase tracking-wider bg-amber-500 text-slate-950 px-2.5 py-1 rounded-full shadow-sm">
                ★ Premium Member
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome back, {user.name}!
          </h1>
          <p className="text-blue-100 text-sm leading-relaxed">
            Ready to ace your LEET exams? Practice new mock tests, view your past performance metrics, or browse previous question papers to stay ahead.
          </p>
          {user.examTargets && user.examTargets.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {user.examTargets.map((target: string) => (
                <span key={target} className="text-[10px] font-bold px-2 py-0.5 bg-white/10 rounded-md uppercase tracking-wider border border-white/10">
                  {target.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Test Attempts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800/60 pb-3">
            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ClipboardList size={18} className="text-blue-600 dark:text-blue-400" aria-hidden="true" />
              Recent Test Attempts
            </h2>
            <Link href="/dashboard/performance" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold">
              View Analytics
            </Link>
          </div>
          
          {user.testAttempts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-400">No mock tests attempted yet</p>
              <Link href="/mock-tests" className="inline-block mt-3 text-xs bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 px-3.5 py-2 rounded-xl font-bold hover:bg-blue-100 dark:hover:bg-blue-950/60 transition-all">
                Start a Mock Test
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {user.testAttempts.map((attempt: any) => (
                <div key={attempt.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 pr-3">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{attempt.test.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(attempt.completedAt)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400">{attempt.score}/{attempt.totalMarks}</p>
                    <p className="text-xs text-slate-500 font-medium">{Math.round((attempt.score / attempt.totalMarks) * 100)}% Accuracy</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved Papers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800/60 pb-3">
            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText size={18} className="text-blue-600 dark:text-blue-400" aria-hidden="true" />
              Saved Papers
            </h2>
            <Link href="/papers" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold">
              Browse Directory
            </Link>
          </div>
          
          {user.savedPapers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-400">No saved question papers yet</p>
              <Link href="/papers" className="inline-block mt-3 text-xs bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 px-3.5 py-2 rounded-xl font-bold hover:bg-blue-100 dark:hover:bg-blue-950/60 transition-all">
                Browse Papers
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {user.savedPapers.map((sp: any) => (
                <a key={sp.id} href={sp.paper.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-3 first:pt-0 last:pb-0 group hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <div className="min-w-0 pr-3">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {sp.paper.title}
                    </p>
                    {sp.paper.year && <p className="text-xs text-slate-400 mt-0.5">{sp.paper.year}</p>}
                  </div>
                  <FileText size={16} className="text-slate-400 flex-shrink-0 group-hover:text-blue-500 transition-colors" aria-hidden="true" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
