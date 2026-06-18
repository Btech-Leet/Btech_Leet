import { prisma } from "@/lib/prisma";
import { ExamForm } from "@/components/admin/exam-form";

export const dynamic = "force-dynamic";

export default async function NewExamPage() {
  const states = await prisma.state.findMany({ orderBy: { name: "asc" } });
  return <ExamForm states={states} mode="create" />;
}
