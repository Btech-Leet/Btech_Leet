import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, FileText, Download } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";

export const dynamic = "force-dynamic";

export default async function AdminPapersPage() {
  const papers = await prisma.paper.findMany({
    include: { exam: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText size={24} className="text-blue-500" />
            Papers
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage previous year papers, sample papers, and PDFs</p>
        </div>
        <Link
          href="/admin/papers/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Upload Paper
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Exam & Year</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Downloads</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {papers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500 dark:text-slate-500">
                    No papers uploaded yet.
                  </td>
                </tr>
              ) : (
                papers.map((paper: any) => (
                  <tr key={paper.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-700 dark:text-slate-200">{paper.title}</p>
                      {paper.subject && <p className="text-xs text-slate-500 dark:text-slate-500">{paper.subject}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-slate-600 dark:text-slate-300">{paper.exam.name}</span>
                      {paper.year && <span className="ml-2 text-slate-500 dark:text-slate-500">({paper.year})</span>}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
                        {paper.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                      {paper.downloads}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <a
                          href={paper.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-500 dark:text-slate-400 hover:text-blue-400 transition-colors"
                          title="Download"
                        >
                          <Download size={16} />
                        </a>
                        <DeleteButton endpoint={`/api/papers/${paper.id}`} label={paper.title} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
