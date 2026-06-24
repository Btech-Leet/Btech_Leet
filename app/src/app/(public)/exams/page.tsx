import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { MapPin, Globe, Search, Filter, ChevronRight, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

import { mergeSeoMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const fallback: Metadata = {
    title: "LEET Exam Directory – State & Central Lateral Entry Exams",
    description: "Browse all state and central BTech Lateral Entry Exam (LEET) details including eligibility, syllabus, important dates, and application info.",
  };
  return mergeSeoMetadata("/exams", fallback);
}

async function getExams(searchParams: Record<string, string>) {
  const where: Record<string, unknown> = { active: true };
  if (searchParams.type) where.type = searchParams.type;
  if (searchParams.stateId) where.stateId = searchParams.stateId;
  if (searchParams.q) where.name = { contains: searchParams.q, mode: "insensitive" };

  try {
    return await Promise.all([
      prisma.exam.findMany({
        where,
        include: { state: { select: { name: true, code: true } } },
        orderBy: [{ featured: "desc" }, { name: "asc" }],
      }),
      prisma.state.findMany({ orderBy: { name: "asc" } }),
    ]);
  } catch (err) {
    console.error("Failed to load exams:", err);
    return [[], []];
  }
}

export default async function ExamsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const [exams, states] = await getExams(params);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Premium Header */}
      <div className="relative py-16 sm:py-24 overflow-hidden bg-slate-900 dark:bg-slate-950">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -z-10"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-6">
            <BookOpen size={14} className="text-orange-400" />
            <span className="text-sm font-bold text-white tracking-wide uppercase">Comprehensive Database</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            LEET Exam <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Directory</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Find all BTech Lateral Entry Exam details across India. Compare syllabuses, check eligibility, and track crucial deadlines.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8 relative z-20">
        {/* Filters Box */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-200 dark:border-slate-800 mb-12">
          <form className="flex flex-col md:flex-row gap-4" method="GET">
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-400 group-focus-within:text-orange-500 transition-colors" />
              </div>
              <input
                name="q"
                defaultValue={params.q}
                placeholder="Search by exam name..."
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                aria-label="Search exams"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <select
                name="type"
                defaultValue={params.type || ""}
                className="px-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none cursor-pointer pr-10 min-w-[160px]"
                aria-label="Filter by exam type"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: `right 1rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.2em 1.2em` }}
              >
                <option value="">All Types</option>
                <option value="STATE">State LEET</option>
                <option value="CENTRAL">Central LEET</option>
                <option value="PRIVATE">Private</option>
              </select>

              <select
                name="stateId"
                defaultValue={params.stateId || ""}
                className="px-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none cursor-pointer pr-10 min-w-[160px]"
                aria-label="Filter by state"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: `right 1rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.2em 1.2em` }}
              >
                <option value="">All States</option>
                {states.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <button
                type="submit"
                className="px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95"
                aria-label="Apply filters"
              >
                <Filter size={16} /> Filter
              </button>
            </div>
          </form>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Showing {exams.length} exam{exams.length !== 1 ? "s" : ""}
            {params.q ? ` for "${params.q}"` : ""}
          </p>
        </div>

        {/* Grid */}
        {exams.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-slate-400" />
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">No exams found</p>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
            <Link href="/exams" className="inline-flex items-center gap-2 text-sm font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 bg-orange-50 dark:bg-orange-500/10 px-6 py-2.5 rounded-full transition-colors">
              Clear all filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam: any) => (
              <Link
                key={exam.id}
                href={`/exams/${exam.slug}`}
                className="group flex flex-col p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-orange-500/30 dark:hover:border-orange-500/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
                aria-label={`View ${exam.name} details`}
              >
                {/* Subtle gradient hover effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-5">
                    <div className={`text-[10px] uppercase font-black px-3 py-1 rounded-full border ${
                      exam.type === "STATE" ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20" : 
                      exam.type === "CENTRAL" ? "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20" : 
                      "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                    }`}>
                      {exam.type}
                    </div>
                    {exam.featured && (
                      <div className="text-[10px] uppercase font-black px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                        Featured
                      </div>
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-snug">
                    {exam.name}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed flex-1">
                    {exam.fullName}
                  </p>

                  <div className="space-y-3 mb-6">
                    {exam.state && (
                      <div className="flex items-center gap-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                        <MapPin size={16} className="text-slate-400" />
                        {exam.state.name}
                      </div>
                    )}
                    {exam.officialWebsite && (
                      <div className="flex items-center gap-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg truncate">
                        <Globe size={16} className="text-slate-400 shrink-0" />
                        <span className="truncate">{exam.officialWebsite}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">App Fee</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {exam.applicationFee || "Not Specified"}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white text-slate-400 transition-colors">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
