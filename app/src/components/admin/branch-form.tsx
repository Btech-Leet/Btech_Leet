"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, FormField, Textarea } from "@/components/ui/input";

export function BranchForm({ initialData, mode = "create" }: { 
  initialData?: any;
  mode?: "create" | "edit";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [form, setForm] = useState(initialData || {
    name: "",
    code: "",
    description: "",
    active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = mode === "create" ? "/api/branches" : `/api/branches/${initialData.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save branch");

      router.push("/admin/branches");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-white mb-6">
        {mode === "create" ? "Add Engineering Branch" : "Edit Branch"}
      </h2>

      {error && (
        <div className="mb-6 p-3.5 rounded-xl bg-red-950/30 border border-red-800 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Branch Name" id="name" required>
          <Input id="name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="e.g. Computer Science and Engineering" />
        </FormField>

        <FormField label="Short Code" id="code" required>
          <Input id="code" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required placeholder="e.g. CSE" className="uppercase" />
        </FormField>

        <FormField label="Description" id="description">
          <Textarea id="description" value={form.description || ""} onChange={e => setForm({...form, description: e.target.value})} placeholder="Brief overview of the branch..." rows={4} />
        </FormField>

        <div className="flex items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} className="rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-blue-600" />
            <span className="text-sm font-medium text-gray-300">Active</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={loading}>{mode === "create" ? "Add Branch" : "Save Changes"}</Button>
        </div>
      </form>
    </div>
  );
}
