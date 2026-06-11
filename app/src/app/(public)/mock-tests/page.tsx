import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Clock, Users, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "LEET Mock Tests – Practice Tests & Exam Simulation",
  description: "Practice with BTech Lateral Entry Exam (LEET) mock tests. Get instant results, detailed analysis, and improve your score.",
};

export default async function MockTestsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const where: Record<string, unknown> = { status: "PUBLISHED" };
  if (params.examId) where.examId = params.examId;

  const [tests, exams] = await Promise.all([
    prisma.mockTest.findMany({
      where,
      include: { _count: { select: { questions: true, attempts: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.exam.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">Mock Tests</h1>
        <p className="text-gray-500 dark:text-gray-400">Practice with real exam-pattern mock tests and track your progress</p>
      </div>

      <form className="flex flex-wrap gap-3 mb-8" method="GET">
        <select name="examId" defaultValue={params.examId || ""} className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none" aria-label="Filter by exam">
          <option value="">All Exams</option>
          {exams.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors" aria-label="Apply filter">Filter</button>
      </form>

      {tests.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <ClipboardList size={40} className="mx-auto mb-4 opacity-30" aria-hidden="true" />
          <p className="text-lg font-medium">No mock tests available yet</p>
          <p className="text-sm mt-1">Check back soon</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test: any) => (
            <div key={test.id} className="flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all">
              <div className="mb-4">
                <Badge variant="default" className="mb-3">Mock Test</Badge>
                <h2 className="font-bold text-gray-900 dark:text-white text-base mb-2 line-clamp-2">{test.title}</h2>
                {test.description && <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{test.description}</p>}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span className="flex items-center gap-1.5"><Clock size={14} aria-hidden="true" /> {test.duration} mins</span>
                <span className="flex items-center gap-1.5"><ClipboardList size={14} aria-hidden="true" /> {test._count.questions} questions</span>
                <span className="flex items-center gap-1.5"><Users size={14} aria-hidden="true" /> {test._count.attempts} attempts</span>
              </div>

              <div className="mt-auto flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{test.totalMarks} marks</span>
                <Link
                  href={`/mock-tests/${test.slug}`}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  aria-label={`Start ${test.title}`}
                >
                  Start Test <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
