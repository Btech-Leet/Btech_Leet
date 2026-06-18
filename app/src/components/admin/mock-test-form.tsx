"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, FormField, Textarea } from "@/components/ui/input";

export function MockTestForm({ exams, initialData, mode = "create" }: { 
  exams: { id: string; name: string }[];
  initialData?: any;
  mode?: "create" | "edit";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [form, setForm] = useState(initialData || {
    title: "",
    examId: "",
    description: "",
    duration: "60",
    totalMarks: "100",
    passMark: "40",
    status: "PUBLISHED",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = mode === "create" ? "/api/mock-tests" : `/api/mock-tests/${initialData.slug}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          duration: parseInt(form.duration),
          totalMarks: parseInt(form.totalMarks),
          passMark: form.passMark ? parseInt(form.passMark) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save test");

      router.push("/admin/mock-tests");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-white mb-6">
        {mode === "create" ? "Create New Mock Test" : "Edit Mock Test"}
      </h2>

      {error && (
        <div className="mb-6 p-3.5 rounded-xl bg-red-950/30 border border-red-800 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Test Title" id="title" required>
          <Input id="title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="e.g. Haryana LEET Grand Mock 1" />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField label="Related Exam" id="examId">
            <select
              id="examId"
              value={form.examId || ""}
              onChange={e => setForm({...form, examId: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="">General (No specific exam)</option>
              {exams.map((ex: any) => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
            </select>
          </FormField>

          <FormField label="Status" id="status" required>
            <select
              id="status"
              value={form.status}
              onChange={e => setForm({...form, status: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-3 gap-5">
          <FormField label="Duration (Minutes)" id="duration" required>
            <Input id="duration" type="number" min="1" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} required />
          </FormField>

          <FormField label="Total Marks" id="totalMarks" required>
            <Input id="totalMarks" type="number" min="1" value={form.totalMarks} onChange={e => setForm({...form, totalMarks: e.target.value})} required />
          </FormField>

          <FormField label="Passing Marks" id="passMark">
            <Input id="passMark" type="number" min="0" value={form.passMark || ""} onChange={e => setForm({...form, passMark: e.target.value})} />
          </FormField>
        </div>

        <FormField label="Description / Instructions" id="description">
          <Textarea id="description" value={form.description || ""} onChange={e => setForm({...form, description: e.target.value})} placeholder="General instructions for the students..." rows={4} />
        </FormField>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={loading}>{mode === "create" ? "Create Test" : "Save Changes"}</Button>
        </div>
      </form>
    </div>
  );
}
