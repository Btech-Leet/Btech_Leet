import { prisma } from "@/lib/prisma";
import { Download, Library, Search, FileText, Book } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const resources = await prisma.resource.findMany({
    where: { active: true },
    include: { branch: { select: { name: true, code: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white font-display leading-tight">
            Study <span className="text-blue-600">Resources</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Download high-quality notes, syllabus PDFs, and e-books for all B.Tech branches to prepare for your semester exams and LEET.
          </p>
        </div>

        {/* Filters and Search - Static for now, can be client-side filtered later */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search resources..." 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Branches</option>
            <option value="CSE">Computer Science</option>
            <option value="IT">Information Tech</option>
            <option value="ECE">Electronics</option>
            <option value="ME">Mechanical</option>
          </select>
          <select className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Types</option>
            <option value="NOTES">Notes</option>
            <option value="SYLLABUS">Syllabus</option>
            <option value="BOOK">E-Book</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800">
              <Library className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No resources found</h3>
              <p className="text-gray-500 mt-2">Check back later for new study materials.</p>
            </div>
          ) : (
            resources.map((res: any) => (
              <div key={res.id} className="group flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-colors shadow-sm hover:shadow-md">
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                      {res.type === 'NOTES' ? <FileText size={24} /> : res.type === 'BOOK' ? <Book size={24} /> : <Library size={24} />}
                    </div>
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      {res.type}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {res.title}
                  </h3>
                  {res.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                      {res.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-md">
                      {res.branch?.code || 'General'}
                    </span>
                    {res.semester && (
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-md">
                        Sem {res.semester}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 mt-auto">
                  <a
                    href={res.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors"
                  >
                    <Download size={16} />
                    Download PDF
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
