import { prisma } from "@/lib/prisma";
import { Users as UsersIcon, Shield, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <UsersIcon size={24} className="text-blue-500" />
            Registered Users
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage user accounts and roles</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-950/50 text-gray-400">
              <tr>
                <th className="px-5 py-3 font-medium">User Details</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Joined Date</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-gray-500">
                    No users registered yet.
                  </td>
                </tr>
              ) : (
                users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 font-bold shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-200">{user.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail size={12} /> {user.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                        user.role === 'ADMIN' ? 'bg-purple-900/40 text-purple-400 border border-purple-800' :
                        user.role === 'EDITOR' ? 'bg-blue-900/40 text-blue-400 border border-blue-800' :
                        'bg-gray-800 text-gray-400 border border-gray-700'
                      }`}>
                        {user.role === 'ADMIN' && <Shield size={12} />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      {user.emailVerified ? (
                        <span className="text-green-400 text-xs">Verified</span>
                      ) : (
                        <span className="text-yellow-500 text-xs">Unverified</span>
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
