import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CollegeForm } from "@/components/admin/college-form";

export const dynamic = "force-dynamic";

export default async function EditCollegePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [college, states] = await Promise.all([
    prisma.college.findUnique({ where: { id } }),
    prisma.state.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!college) notFound();

  return (
    <CollegeForm
      initialData={{
        ...college,
        description: college.description || "",
        affiliation: college.affiliation || "",
        website: college.website || "",
        logo: college.logo || "",
        accreditation: college.accreditation || "",
        city: college.city || "",
        stateId: college.stateId || "",
        established: college.established !== null ? String(college.established) : "",
        ranking: college.ranking !== null ? String(college.ranking) : "",
      }}
      states={states}
      mode="edit"
    />
  );
}
