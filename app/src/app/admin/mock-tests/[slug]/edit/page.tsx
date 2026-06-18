import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MockTestEditClient } from "@/components/admin/mock-test-edit-client";

export const dynamic = "force-dynamic";

export default async function EditMockTestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [test, exams] = await Promise.all([
    prisma.mockTest.findUnique({
      where: { slug },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
    }),
    prisma.exam.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  if (!test) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <MockTestEditClient exams={exams} test={test} />
    </div>
  );
}
