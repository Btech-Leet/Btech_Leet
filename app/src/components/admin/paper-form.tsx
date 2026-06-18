"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, FormField, Textarea } from "@/components/ui/input";
import { UploadCloud } from "lucide-react";

export function PaperForm({ exams }: { exams: { id: string; name: string }[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const [form, setForm] = useState({
    title: "",
    examId: "",
    year: new Date().getFullYear().toString(),
    type: "PREVIOUS_YEAR",
    subject: "",
    branch: "",
    active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF file to upload.");
      return;
    }
    
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("metadata", JSON.stringify({
      ...form,
      year: form.year ? parseInt(form.year) : undefined,
    }));

    try {
      const res = await fetch("/api/papers", {
        method: "POST",
        body: formData, // form-data handles content type automatically
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload paper");

      router.push("/admin/papers");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-white mb-6">Upload Paper</h2>

      {error && (
        <div className="mb-6 p-3.5 rounded-xl bg-red-950/30 border border-red-800 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Paper Title" id="title" required>
          <Input id="title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="e.g. 2023 LEET Question Paper" />
        </FormField>

        <div className="grid grid-cols-2 gap-5">
          <FormField label="Related Exam" id="examId" required>
            <select
              id="examId"
              value={form.examId}
              onChange={e => setForm({...form, examId: e.target.value})}
              required
              className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select Exam</option>
              {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
            </select>
          </FormField>

          <FormField label="Paper Type" id="type" required>
            <select
              id="type"
              value={form.type}
              onChange={e => setForm({...form, type: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="PREVIOUS_YEAR">Previous Year</option>
              <option value="MOCK">Mock Paper</option>
              <option value="SAMPLE">Sample Paper</option>
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <FormField label="Year" id="year">
            <Input id="year" type="number" value={form.year} onChange={e => setForm({...form, year: e.target.value})} placeholder="e.g. 2023" />
          </FormField>

          <FormField label="Subject (Optional)" id="subject">
            <Input id="subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="e.g. Mathematics" />
          </FormField>
        </div>

        <FormField label="PDF File" id="file" required>
          <div className="flex items-center justify-center w-full">
            <label htmlFor="file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-800 border-dashed rounded-xl cursor-pointer bg-gray-950 hover:bg-gray-900 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-8 h-8 mb-3 text-gray-500" />
                <p className="mb-2 text-sm text-gray-400">
                  <span className="font-semibold text-blue-500">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-600">PDF, DOC, DOCX (MAX. 20MB)</p>
              </div>
              <input id="file" type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={e => setFile(e.target.files?.[0] || null)} />
            </label>
          </div>
          {file && <p className="mt-2 text-sm text-green-400 flex items-center gap-2">✓ Selected: {file.name}</p>}
        </FormField>

        <div className="flex items-center gap-3 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} className="rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-blue-600 focus:ring-offset-gray-900" />
            <span className="text-sm font-medium text-gray-300">Published & Active</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={loading}>Upload Paper</Button>
        </div>
      </form>
    </div>
  );
}
