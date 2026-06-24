import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatBytes, formatDate } from "@/lib/utils";
import { FileText, Download, Search, Filter, BookCopy } from "lucide-react";

export const dynamic = "force-dynamic";

import { mergeSeoMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const fallback: Metadata = {
    title: "LEET Previous Year Papers – Download Question Papers",
    description: "Download BTech Lateral Entry Exam (LEET) previous year question papers, mock tests, and sample papers for all states.",
  };
  return mergeSeoMetadata("/papers", fallback);
}

async function getPapers(params: Record<string, string>) {
  const where: Record<string, unknown> = { active: true };
  if (params.examId) where.examId = params.examId;
  if (params.type) where.type = params.type;
  if (params.year) where.year = parseInt(params.year);
  if (params.q) where.title = { contains: params.q, mode: "insensitive" };

  try {
    return await Promise.all([
      prisma.paper.findMany({
        where,
        include: { exam: { select: { name: true, slug: true } } },
        orderBy: [{ year: "desc" }, { createdAt: "desc" }],
      }),
      prisma.exam.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    ]);
  } catch (err) {
    console.error("Failed to load papers:", err);
    return [[], []];
  }
}

export default async function PapersPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const [papers, exams] = await getPapers(params);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Premium Header */}
      <div className="relative py-16 sm:py-24 overflow-hidden bg-slate-900 dark:bg-slate-950">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -z-10"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-6">
            <BookCopy size={14} className="text-teal-400" />
            <span className="text-sm font-bold text-white tracking-wide uppercase">Practice Archive</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Question <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Papers</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Previous year papers, mock tests, and sample questions to help you prepare effectively for your upcoming LEET exams.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8 relative z-20">
        {/* Filters Box */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-200 dark:border-slate-800 mb-12">
          <form className="flex flex-col lg:flex-row gap-4" method="GET">
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-400 group-focus-within:text-teal-500 transition-colors" />
              </div>
              <input
                name="q"
                defaultValue={params.q}
                placeholder="Search papers by title..."
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                aria-label="Search papers"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <select
                name="examId"
                defaultValue={params.examId || ""}
                className="px-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all appearance-none cursor-pointer pr-10 min-w-[200px]"
                aria-label="Filter by exam"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: `right 1rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.2em 1.2em` }}
              >
                <option value="">All Exams</option>
                {exams.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>

              <select
                name="type"
                defaultValue={params.type || ""}
                className="px-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all appearance-none cursor-pointer pr-10 min-w-[160px]"
                aria-label="Filter by type"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: `right 1rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.2em 1.2em` }}
              >
                <option value="">All Types</option>
                <option value="PREVIOUS_YEAR">Previous Year</option>
                <option value="MOCK">Mock Test</option>
                <option value="SAMPLE">Sample Paper</option>
              </select>

              <button
                type="submit"
                className="px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95"
                aria-label="Filter papers"
              >
                <Filter size={16} /> Filter
              </button>
            </div>
          </form>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Showing {papers.length} paper{papers.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Grid */}
        {papers.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={24} className="text-slate-400" />
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">No papers found</p>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
            <Link href="/papers" className="inline-flex items-center gap-2 text-sm font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 bg-teal-50 dark:bg-teal-500/10 px-6 py-2.5 rounded-full transition-colors">
              Clear all filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {papers.map((paper: any) => (
              <div key={paper.id} className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:border-teal-500/30 dark:hover:border-teal-500/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative">
                {/* Subtle hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0 pointer-events-none" />
                
                <div className="p-6 flex-1 relative z-10 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border ${
                        paper.type === "PREVIOUS_YEAR" ? "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-500/20" : 
                        paper.type === "MOCK" ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20" : 
                        "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                      }`}>
                        {paper.type.replace("_", " ")}
                      </div>
                      {paper.year && (
                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          {paper.year}
                        </div>
                      )}
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-snug group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {paper.title}
                  </h2>

                  <div className="space-y-2 mt-auto pt-4 flex-1">
                    {paper.exam && (
                      <div className="flex items-center gap-2">
                        <Link href={`/exams/${paper.exam.slug}`} className="text-sm font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors inline-block w-full truncate">
                          {paper.exam.name}
                        </Link>
                      </div>
                    )}

                    {paper.branch && (
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                        {paper.branch}
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between relative z-10 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Details</span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {paper.fileSize ? formatBytes(paper.fileSize) : "PDF"} · {paper.downloads} DLs
                    </span>
                  </div>
                  
                  <a
                    href={paper.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-xl hover:bg-teal-600 dark:hover:bg-teal-500 hover:text-white transition-all shadow-md group-hover:shadow-lg active:scale-95"
                    aria-label={`Download ${paper.title}`}
                  >
                    <Download size={14} aria-hidden="true" /> Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
