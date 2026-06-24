import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckCircle2, Clock, XCircle, Eye, EyeOff } from "lucide-react";

export const metadata: Metadata = {
  title: "Manage FAQs | Admin",
};

export default async function AdminFaqPage() {
  const questions = await prisma.userQuestion.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-900 dark:text-white">User Questions (FAQ)</h1>
          <p className="text-sm text-slate-500 dark:text-slate-500">Manage and answer questions submitted by users.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-100 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Question</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Visibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {questions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-500 text-sm">
                    No questions found.
                  </td>
                </tr>
              ) : (
                questions.map((q: any) => (
                  <tr key={q.id} className="hover:bg-gray-50 dark:hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-500">
                      {new Date(q.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900 dark:text-slate-900 dark:text-white">{q.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-500">{q.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-800 dark:text-slate-700 dark:text-slate-200 line-clamp-2 max-w-xs">{q.question}</p>
                      {q.answer && <p className="text-xs text-green-600 mt-1 line-clamp-1">Ans: {q.answer}</p>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        q.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                        q.status === "ANSWERED" ? "bg-green-100 text-green-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {q.status === "PENDING" && <Clock size={12} />}
                        {q.status === "ANSWERED" && <CheckCircle2 size={12} />}
                        {q.status === "REJECTED" && <XCircle size={12} />}
                        {q.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {q.displayOnSite ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                          <Eye size={12} /> Public
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                          <EyeOff size={12} /> Hidden
                        </span>
                      )}
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
