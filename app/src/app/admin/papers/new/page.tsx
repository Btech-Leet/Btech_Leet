import { prisma } from "@/lib/prisma";
import { PaperForm } from "@/components/admin/paper-form";

export const dynamic = "force-dynamic";

export default async function NewPaperPage() {
  const exams = await prisma.exam.findMany({
    where: { active: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return <PaperForm exams={exams} />;
}
