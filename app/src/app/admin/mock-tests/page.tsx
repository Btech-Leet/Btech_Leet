import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, ClipboardList, Edit } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";

export const dynamic = "force-dynamic";

export default async function AdminMockTestsPage() {
  const tests = await prisma.mockTest.findMany({
    include: { 
      exam: { select: { name: true } },
      _count: { select: { questions: true, attempts: true } }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ClipboardList size={24} className="text-blue-500" />
            Mock Tests
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage online practice tests and exams</p>
        </div>
        <Link
          href="/admin/mock-tests/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Create Test
        </Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-950/50 text-gray-400">
              <tr>
                <th className="px-5 py-3 font-medium">Test Name</th>
                <th className="px-5 py-3 font-medium">Exam</th>
                <th className="px-5 py-3 font-medium">Details</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {tests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-500">
                    No mock tests created yet.
                  </td>
                </tr>
              ) : (
                tests.map((test: any) => (
                  <tr key={test.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-200">{test.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{test._count.attempts} attempts</p>
                    </td>
                    <td className="px-5 py-4 text-gray-300">
                      {test.exam?.name || "General"}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-gray-300">{test.duration} mins • {test.totalMarks} marks</p>
                      <p className="text-xs text-gray-500 mt-1">{test._count.questions} questions</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${test.status === 'PUBLISHED' ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                        {test.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link href={`/admin/mock-tests/${test.slug}/edit`} className="text-gray-400 hover:text-white transition-colors">
                          <Edit size={16} />
                        </Link>
                        <DeleteButton endpoint={`/api/mock-tests/${test.slug}`} label={test.title} />
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
