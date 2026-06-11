import { prisma } from "@/lib/prisma";
import { ResourceForm } from "@/components/admin/resource-form";

export const dynamic = "force-dynamic";

export default async function NewResourcePage() {
  const branches = await prisma.branch.findMany({
    where: { active: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return <ResourceForm branches={branches} />;
}
