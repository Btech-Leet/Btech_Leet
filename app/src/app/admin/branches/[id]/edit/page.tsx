import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BranchForm } from "@/components/admin/branch-form";

export const dynamic = "force-dynamic";

export default async function EditBranchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const branch = await prisma.branch.findUnique({
    where: { id },
  });

  if (!branch) notFound();

  return (
    <BranchForm
      initialData={{
        ...branch,
        description: branch.description || "",
      }}
      mode="edit"
    />
  );
}
