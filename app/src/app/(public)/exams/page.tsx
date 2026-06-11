import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, Search, Filter } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "LEET Exam Directory – State & Central Lateral Entry Exams",
  description: "Browse all state and central BTech Lateral Entry Exam (LEET) details including eligibility, syllabus, important dates, and application info.",
};

async function getExams(searchParams: Record<string, string>) {
  const where: Record<string, unknown> = { active: true };
  if (searchParams.type) where.type = searchParams.type;
  if (searchParams.stateId) where.stateId = searchParams.stateId;
  if (searchParams.q) where.name = { contains: searchParams.q, mode: "insensitive" };

  return Promise.all([
    prisma.exam.findMany({
      where,
      include: { state: { select: { name: true, code: true } } },
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    }),
    prisma.state.findMany({ orderBy: { name: "asc" } }),
  ]);
}

export default async function ExamsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const [exams, states] = await getExams(params);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">LEET Exam Directory</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Find all BTech Lateral Entry Exam details across India
        </p>
      </div>

      {/* Filters */}
      <form className="flex flex-col sm:flex-row gap-3 mb-8" method="GET">
        <div className="flex-1 flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-xl px-4 bg-white dark:bg-gray-900">
          <Search size={16} className="text-gray-400" aria-hidden="true" />
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Search by exam name..."
            className="flex-1 py-2.5 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
            aria-label="Search exams"
          />
        </div>

        <select
          name="type"
          defaultValue={params.type || ""}
          className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Filter by exam type"
        >
          <option value="">All Types</option>
          <option value="STATE">State LEET</option>
          <option value="CENTRAL">Central LEET</option>
          <option value="PRIVATE">Private</option>
        </select>

        <select
          name="stateId"
          defaultValue={params.stateId || ""}
          className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Filter by state"
        >
          <option value="">All States</option>
          {states.map((s: any) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <button
          type="submit"
          className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
          aria-label="Apply filters"
        >
          <Filter size={15} aria-hidden="true" /> Filter
        </button>
      </form>

      {/* Results count */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Showing {exams.length} exam{exams.length !== 1 ? "s" : ""}
        {params.q ? ` for "${params.q}"` : ""}
      </p>

      {/* Grid */}
      {exams.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg font-medium text-gray-500 dark:text-gray-400">No exams found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
          <Link href="/exams" className="mt-4 inline-block text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
            Clear filters
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam: any) => (
            <Link
              key={exam.id}
              href={`/exams/${exam.slug}`}
              className="group p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200"
              aria-label={`View ${exam.name} details`}
            >
              <div className="flex items-start justify-between mb-4">
                <Badge variant={exam.type === "STATE" ? "default" : exam.type === "CENTRAL" ? "secondary" : "outline"}>
                  {exam.type}
                </Badge>
                {exam.featured && (
                  <Badge variant="warning" className="text-xs">Featured</Badge>
                )}
              </div>

              <h2 className="font-bold text-gray-900 dark:text-white text-lg mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {exam.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{exam.fullName}</p>

              <div className="space-y-1.5">
                {exam.state && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <MapPin size={12} aria-hidden="true" />
                    {exam.state.name}
                  </div>
                )}
                {exam.officialWebsite && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Globe size={12} aria-hidden="true" />
                    <span className="truncate">{exam.officialWebsite}</span>
                  </div>
                )}
              </div>

              {exam.applicationFee && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                  <span className="text-gray-400">Application Fee</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{exam.applicationFee}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
