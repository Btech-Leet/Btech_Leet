"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Textarea, FormField, Select } from "@/components/ui/input";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface State {
  id: string;
  name: string;
  code: string;
}

interface ExamFormData {
  name: string;
  fullName: string;
  type: string;
  stateId: string;
  description: string;
  officialWebsite: string;
  applicationFee: string;
  eligibility: string;
  featured: boolean;
  active: boolean;
}

interface ExamFormProps {
  initialData?: Partial<ExamFormData & { id: string; slug: string }>;
  states: State[];
  mode: "create" | "edit";
  examSlug?: string;
}

export function ExamForm({ initialData, states, mode, examSlug }: ExamFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<ExamFormData>({
    name: initialData?.name || "",
    fullName: initialData?.fullName || "",
    type: initialData?.type || "STATE",
    stateId: initialData?.stateId || "",
    description: initialData?.description || "",
    officialWebsite: initialData?.officialWebsite || "",
    applicationFee: initialData?.applicationFee || "",
    eligibility: initialData?.eligibility || "",
    featured: initialData?.featured ?? false,
    active: initialData?.active ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      ...form,
      stateId: form.stateId || null,
      officialWebsite: form.officialWebsite || null,
    };

    const res = await fetch(
      mode === "create" ? "/api/exams" : `/api/exams/${examSlug}`,
      {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();
    if (data.success) {
      router.push("/admin/exams");
      router.refresh();
    } else {
      setError(data.message || "Failed to save exam");
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/exams" className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors" aria-label="Back to exams">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{mode === "create" ? "Add Exam" : "Edit Exam"}</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {mode === "create" ? "Create a new LEET exam entry" : "Update exam information"}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-950/30 border border-red-800 rounded-xl text-red-400 text-sm" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-white text-base border-b border-gray-800 pb-3">Basic Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Exam Short Name" id="exam-name" required>
              <Input
                id="exam-name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g., AP LEET, OJEE"
                required
                className="bg-gray-800 border-gray-700 text-white"
              />
            </FormField>

            <FormField label="Exam Type" id="exam-type" required>
              <Select
                id="exam-type"
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white"
              >
                <option value="STATE">State LEET</option>
                <option value="CENTRAL">Central LEET</option>
                <option value="PRIVATE">Private</option>
              </Select>
            </FormField>
          </div>

          <FormField label="Full Name" id="exam-fullname" required>
            <Input
              id="exam-fullname"
              value={form.fullName}
              onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
              placeholder="e.g., Andhra Pradesh Lateral Entry Test"
              required
              className="bg-gray-800 border-gray-700 text-white"
            />
          </FormField>

          <FormField label="State" id="exam-state">
            <Select
              id="exam-state"
              value={form.stateId}
              onChange={(e) => setForm((p) => ({ ...p, stateId: e.target.value }))}
              className="bg-gray-800 border-gray-700 text-white"
            >
              <option value="">Select State</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Description" id="exam-desc">
            <Textarea
              id="exam-desc"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Brief overview of the exam..."
              rows={4}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </FormField>

          <FormField label="Eligibility" id="exam-eligibility">
            <Textarea
              id="exam-eligibility"
              value={form.eligibility}
              onChange={(e) => setForm((p) => ({ ...p, eligibility: e.target.value }))}
              placeholder="Minimum qualifications required..."
              rows={3}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Official Website" id="exam-website">
              <Input
                id="exam-website"
                type="url"
                value={form.officialWebsite}
                onChange={(e) => setForm((p) => ({ ...p, officialWebsite: e.target.value }))}
                placeholder="https://..."
                className="bg-gray-800 border-gray-700 text-white"
              />
            </FormField>

            <FormField label="Application Fee" id="exam-fee">
              <Input
                id="exam-fee"
                value={form.applicationFee}
                onChange={(e) => setForm((p) => ({ ...p, applicationFee: e.target.value }))}
                placeholder="e.g., ₹500 (General)"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </FormField>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-white text-base border-b border-gray-800 pb-3">Settings</h2>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                id="exam-featured"
              />
              <span className="text-sm text-gray-300" id="exam-featured-label">Featured exam</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                id="exam-active"
              />
              <span className="text-sm text-gray-300">Active (visible on site)</span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button type="submit" loading={loading} className="flex items-center gap-2" aria-label="Save exam">
            <Save size={16} aria-hidden="true" />
            {mode === "create" ? "Create Exam" : "Save Changes"}
          </Button>
          <Link href="/admin/exams">
            <Button type="button" variant="secondary">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
