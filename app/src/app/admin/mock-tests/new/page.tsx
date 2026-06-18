import { prisma } from "@/lib/prisma";
import { MockTestForm } from "@/components/admin/mock-test-form";

export const dynamic = "force-dynamic";

export default async function NewMockTestPage() {
  const exams = await prisma.exam.findMany({
    orderBy: { name: "asc" },
  });

  return <MockTestForm exams={exams} mode="create" />;
}
