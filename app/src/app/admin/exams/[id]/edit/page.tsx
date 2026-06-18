import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ExamForm } from "@/components/admin/exam-form";

export const dynamic = "force-dynamic";

export default async function EditExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [exam, states] = await Promise.all([
    prisma.exam.findUnique({ where: { id } }),
    prisma.state.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!exam) notFound();

  return (
    <ExamForm
      initialData={{
        ...exam,
        description: exam.description || "",
        eligibility: exam.eligibility || "",
        officialWebsite: exam.officialWebsite || "",
        applicationFee: exam.applicationFee || "",
        stateId: exam.stateId || "",
      }}
      states={states}
      mode="edit"
      examSlug={exam.slug}
    />
  );
}
