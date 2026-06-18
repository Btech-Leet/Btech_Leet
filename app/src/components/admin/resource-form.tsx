"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, FormField, Textarea } from "@/components/ui/input";
import { UploadCloud } from "lucide-react";

export function ResourceForm({ branches }: { branches: { id: string; name: string }[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const [paymentType, setPaymentType] = useState<"free" | "paid">("free");

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "NOTES",
    branchId: "",
    semester: "",
    price: 0,
    active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("metadata", JSON.stringify({
      ...form,
      price: paymentType === "paid" ? Number(form.price) : 0,
      semester: form.semester ? parseInt(form.semester) : undefined,
      branchId: form.branchId || undefined,
    }));

    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload resource");

      router.push("/admin/resources");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-white mb-6">Upload Resource</h2>

      {error && (
        <div className="mb-6 p-3.5 rounded-xl bg-red-950/30 border border-red-800 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Resource Title" id="title" required>
          <Input id="title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="e.g. Applied Mathematics II Notes" />
        </FormField>

        <div className="grid grid-cols-2 gap-5">
          <FormField label="Resource Type" id="type" required>
            <select
              id="type"
              value={form.type}
              onChange={e => setForm({...form, type: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="SYLLABUS">Syllabus</option>
              <option value="NOTES">Notes / Study Material</option>
              <option value="BOOK">E-Book</option>
              <option value="OTHER">Other</option>
            </select>
          </FormField>

          <FormField label="Semester (1-8)" id="semester">
            <Input id="semester" type="number" min="1" max="8" value={form.semester} onChange={e => setForm({...form, semester: e.target.value})} placeholder="e.g. 3" />
          </FormField>
        </div>

        <FormField label="Related Branch" id="branchId">
          <select
            id="branchId"
            value={form.branchId}
            onChange={e => setForm({...form, branchId: e.target.value})}
            className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
          >
            <option value="">General (All Branches)</option>
            {branches.map(br => <option key={br.id} value={br.id}>{br.name}</option>)}
          </select>
        </FormField>

        <div className="grid grid-cols-2 gap-5">
          <FormField label="Access Type" id="paymentType">
            <div className="flex bg-gray-950 border border-gray-800 rounded-xl p-0.5 w-full h-[42px] items-center">
              <button
                type="button"
                onClick={() => {
                  setPaymentType("free");
                  setForm({ ...form, price: 0 });
                }}
                className={`flex-1 h-[36px] text-xs font-bold rounded-lg transition-colors ${
                  paymentType === "free"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Free
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentType("paid");
                  if (form.price === 0) {
                    setForm({ ...form, price: 99 });
                  }
                }}
                className={`flex-1 h-[36px] text-xs font-bold rounded-lg transition-colors ${
                  paymentType === "paid"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Paid
              </button>
            </div>
          </FormField>

          {paymentType === "paid" ? (
            <FormField label="Price (₹)" id="price" required>
              <Input
                id="price"
                type="number"
                min="1"
                required
                value={form.price}
                onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                placeholder="Enter price"
              />
            </FormField>
          ) : (
            <div />
          )}
        </div>

        <FormField label="Description (Optional)" id="description">
          <Textarea id="description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Short description of the content..." rows={2} />
        </FormField>

        <FormField label="Document File" id="file" required>
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
            <input type="checkbox" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} className="rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-blue-600" />
            <span className="text-sm font-medium text-gray-300">Published & Active</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={loading}>Upload Resource</Button>
        </div>
      </form>
    </div>
  );
}
