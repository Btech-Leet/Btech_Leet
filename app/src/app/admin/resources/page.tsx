import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Library, Download } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";

export const dynamic = "force-dynamic";

export default async function AdminResourcesPage() {
  const resources = await prisma.resource.findMany({
    include: { branch: { select: { name: true, code: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Library size={24} className="text-blue-500" />
            Study Resources
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage syllabus, notes, and e-books</p>
        </div>
        <Link
          href="/admin/resources/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Upload Resource
        </Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-950/50 text-gray-400">
              <tr>
                <th className="px-5 py-3 font-medium">Title & Type</th>
                <th className="px-5 py-3 font-medium">Branch</th>
                <th className="px-5 py-3 font-medium">Semester</th>
                <th className="px-5 py-3 font-medium">Downloads</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {resources.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-500">
                    No resources uploaded yet.
                  </td>
                </tr>
              ) : (
                resources.map((res: any) => (
                  <tr key={res.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-200">{res.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{res.type}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-gray-300">{res.branch?.code || 'General'}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-300">
                      {res.semester ? `Sem ${res.semester}` : 'All'}
                    </td>
                    <td className="px-5 py-4 text-gray-400">
                      {res.downloads}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <a
                          href={res.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-gray-400 hover:text-blue-400 transition-colors"
                          title="Download"
                        >
                          <Download size={16} />
                        </a>
                        <DeleteButton endpoint={`/api/resources/${res.slug}`} />
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
