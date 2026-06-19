import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, GitBranch, Edit } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";

export const dynamic = "force-dynamic";

export default async function AdminBranchesPage() {
  const branches = await prisma.branch.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <GitBranch size={24} className="text-blue-500" />
            Engineering Branches
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage B.Tech specializations and streams</p>
        </div>
        <Link
          href="/admin/branches/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add Branch
        </Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-950/50 text-gray-400">
              <tr>
                <th className="px-5 py-3 font-medium">Branch Name</th>
                <th className="px-5 py-3 font-medium">Code</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {branches.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-gray-500">
                    No branches added yet.
                  </td>
                </tr>
              ) : (
                branches.map((branch: any) => (
                  <tr key={branch.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-200">{branch.name}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-blue-400 font-mono text-xs bg-blue-950/50 px-2 py-1 rounded">
                        {branch.code}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${branch.active ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                        {branch.active ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link href={`/admin/branches/${branch.id}/edit`} className="text-gray-400 hover:text-white transition-colors">
                          <Edit size={16} />
                        </Link>
                        <DeleteButton endpoint={`/api/branches/${branch.id}`} label={branch.name} />
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
