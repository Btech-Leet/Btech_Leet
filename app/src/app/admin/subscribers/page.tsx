import { prisma } from "@/lib/prisma";
import { Mail, Bell } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSubscribersPage() {
  const subscribers = await prisma.emailSubscription.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Mail size={24} className="text-blue-500" />
            Email Subscribers
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage newsletter and updates subscribers</p>
        </div>
        <a
          href="/admin/email-marketing"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Bell size={16} />
          Send Newsletter
        </a>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Email Address</th>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Tags</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Subscribed On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500 dark:text-slate-500">
                    No subscribers yet.
                  </td>
                </tr>
              ) : (
                subscribers.map((sub: any) => (
                  <tr key={sub.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-700 dark:text-slate-200">
                      {sub.email}
                    </td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                      {sub.name || "N/A"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {sub.tags.map((tag: string) => (
                          <span key={tag} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${sub.active ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                        {sub.active ? 'Subscribed' : 'Unsubscribed'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                      {new Date(sub.createdAt).toLocaleDateString()}
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
