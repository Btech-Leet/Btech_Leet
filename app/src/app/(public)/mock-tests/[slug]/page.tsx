import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MockTestClient } from "@/components/mock-test/mock-test-client";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const test = await prisma.mockTest.findFirst({ where: { OR: [{ slug }, { id: slug }] } });
  if (!test) return { title: "Test Not Found" };
  return { title: `${test.title} – Mock Test`, description: test.description || undefined };
}

export default async function MockTestPage({ params }: { params: Params }) {
  const { slug } = await params;
  const test = await prisma.mockTest.findFirst({
    where: { OR: [{ slug }, { id: slug }], status: "PUBLISHED" },
    include: {
      questions: {
        orderBy: { order: "asc" },
        select: { id: true, text: true, type: true, options: true, marks: true, order: true },
      },
    },
  });

  if (!test) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <MockTestClient test={test as any} />
    </div>
  );
}
