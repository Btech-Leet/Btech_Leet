import { prisma } from "@/lib/prisma";
import { CollegeForm } from "@/components/admin/college-form";

export const dynamic = "force-dynamic";

export default async function NewCollegePage() {
  const states = await prisma.state.findMany({
    orderBy: { name: "asc" },
  });

  return <CollegeForm states={states} mode="create" />;
}
