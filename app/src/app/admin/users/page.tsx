import { prisma } from "@/lib/prisma";
import { Users as UsersIcon } from "lucide-react";
import { UsersTable } from "./users-table";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serializedUsers = users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UsersIcon size={24} className="text-blue-500" />
            Registered Users
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage user accounts, view profiles, and grant premium access</p>
        </div>
      </div>

      <UsersTable initialUsers={serializedUsers} />
    </div>
  );
}
