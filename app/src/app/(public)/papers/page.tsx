import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatBytes, formatDate } from "@/lib/utils";
import { FileText, Download, Search, Filter } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "LEET Previous Year Papers – Download Question Papers",
  description: "Download BTech Lateral Entry Exam (LEET) previous year question papers, mock tests, and sample papers for all states.",
};

async function getPapers(params: Record<string, string>) {
  const where: Record<string, unknown> = { active: true };
  if (params.examId) where.examId = params.examId;
  if (params.type) where.type = params.type;
  if (params.year) where.year = parseInt(params.year);
  if (params.q) where.title = { contains: params.q, mode: "insensitive" };

  return Promise.all([
    prisma.paper.findMany({
      where,
      include: { exam: { select: { name: true, slug: true } } },
      orderBy: [{ year: "desc" }, { createdAt: "desc" }],
    }),
    prisma.exam.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
}

export default async function PapersPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const [papers, exams] = await getPapers(params);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">Question Papers</h1>
        <p className="text-gray-500 dark:text-gray-400">Previous year papers and mock tests for LEET preparation</p>
      </div>

      <form className="flex flex-col sm:flex-row flex-wrap gap-3 mb-8" method="GET">
        <div className="flex flex-1 items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-xl px-4 bg-white dark:bg-gray-900 min-w-[200px]">
          <Search size={15} className="text-gray-400" aria-hidden="true" />
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Search papers..."
            className="flex-1 py-2.5 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
            aria-label="Search papers"
          />
        </div>

        <select
          name="examId"
          defaultValue={params.examId || ""}
          className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Filter by exam"
        >
          <option value="">All Exams</option>
          {exams.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>

        <select
          name="type"
          defaultValue={params.type || ""}
          className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Filter by type"
        >
          <option value="">All Types</option>
          <option value="PREVIOUS_YEAR">Previous Year</option>
          <option value="MOCK">Mock Test</option>
          <option value="SAMPLE">Sample Paper</option>
        </select>

        <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2" aria-label="Filter papers">
          <Filter size={14} aria-hidden="true" /> Filter
        </button>
      </form>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{papers.length} paper{papers.length !== 1 ? "s" : ""} found</p>

      {papers.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FileText size={40} className="mx-auto mb-4 opacity-30" aria-hidden="true" />
          <p className="text-lg font-medium">No papers found</p>
          <p className="text-sm mt-1">Try changing your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {papers.map((paper: any) => (
            <div key={paper.id} className="flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200">
              <div className="p-5 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant={paper.type === "PREVIOUS_YEAR" ? "default" : paper.type === "MOCK" ? "warning" : "secondary"}>
                    {paper.type.replace("_", " ")}
                  </Badge>
                  {paper.year && <span className="text-xs text-gray-500">{paper.year}</span>}
                </div>

                <h2 className="font-semibold text-gray-900 dark:text-white text-base mb-1 line-clamp-2">{paper.title}</h2>

                {paper.exam && (
                  <Link href={`/exams/${paper.exam.slug}`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    {paper.exam.name}
                  </Link>
                )}

                {paper.branch && (
                  <p className="text-xs text-gray-400 mt-1">{paper.branch}</p>
                )}
              </div>

              <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  {paper.fileSize ? formatBytes(paper.fileSize) : "PDF"} · {paper.downloads} downloads
                </div>
                <a
                  href={paper.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors"
                  aria-label={`Download ${paper.title}`}
                >
                  <Download size={13} aria-hidden="true" /> Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
