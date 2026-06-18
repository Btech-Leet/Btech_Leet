import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Building2, ExternalLink } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";

export const dynamic = "force-dynamic";

export default async function AdminCollegesPage() {
  const colleges = await prisma.college.findMany({
    include: { state: { select: { name: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 size={24} className="text-blue-500" />
            Colleges
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage engineering colleges and universities</p>
        </div>
        <Link
          href="/admin/colleges/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add College
        </Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-950/50 text-gray-400">
              <tr>
                <th className="px-5 py-3 font-medium">College Name</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {colleges.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-500">
                    No colleges added yet.
                  </td>
                </tr>
              ) : (
                colleges.map((college: any) => (
                  <tr key={college.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-200">{college.name}</p>
                      {college.website && (
                        <a href={college.website} target="_blank" rel="noreferrer" className="text-xs text-blue-500 flex items-center gap-1 mt-1 hover:underline">
                          <ExternalLink size={12} /> Website
                        </a>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-gray-300">{college.city}</span>
                      <span className="ml-1 text-gray-500">, {college.state.name}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex px-2 py-1 rounded bg-gray-800 text-xs text-gray-300">
                        {college.type}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${college.active ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                        {college.active ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link href={`/admin/colleges/${college.id}/edit`} className="text-gray-400 hover:text-white transition-colors">
                          Edit
                        </Link>
                        <DeleteButton endpoint={`/api/colleges/${college.slug}`} label={college.name} />
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
