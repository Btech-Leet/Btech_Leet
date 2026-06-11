import { BranchForm } from "@/components/admin/branch-form";

export const dynamic = "force-dynamic";

export default function NewBranchPage() {
  return <BranchForm mode="create" />;
}
