import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, MapPin, Globe } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Manage Exams | Admin" };

export default async function AdminExamsPage() {
  const exams = await prisma.exam.findMany({
    include: { state: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Exams</h1>
          <p className="text-gray-400 text-sm mt-1">{exams.length} total exams</p>
        </div>
        <Link
          href="/admin/exams/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          aria-label="Add new exam"
        >
          <Plus size={16} aria-hidden="true" /> Add Exam
        </Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" role="table" aria-label="Exams list">
            <thead>
              <tr className="border-b border-gray-800">
                <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Exam</th>
                <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Type</th>
                <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">State</th>
                <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Status</th>
                <th scope="col" className="px-5 py-3.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-500">No exams yet. Add your first exam.</td>
                </tr>
              ) : (
                exams.map((exam: any) => (
                  <tr key={exam.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-white text-sm">{exam.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{exam.fullName}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={exam.type === "STATE" ? "default" : exam.type === "CENTRAL" ? "secondary" : "outline"}>
                        {exam.type}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-sm text-gray-300">{exam.state?.name || "–"}</span>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <Badge variant={exam.active ? "success" : "secondary"}>
                        {exam.active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/exams/${exam.id}/edit`}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                          aria-label={`Edit ${exam.name}`}
                        >
                          <Edit size={15} aria-hidden="true" />
                        </Link>
                        <DeleteButton
                          endpoint={`/api/exams/${exam.slug}`}
                          label={exam.name}
                          aria-label={`Delete ${exam.name}`}
                        />
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
