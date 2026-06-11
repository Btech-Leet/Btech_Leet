"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, FormField, Textarea } from "@/components/ui/input";

export function CollegeForm({ states, initialData, mode = "create" }: { 
  states: { id: string; name: string }[];
  initialData?: any;
  mode?: "create" | "edit";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [form, setForm] = useState(initialData || {
    name: "",
    stateId: "",
    city: "",
    type: "GOVERNMENT",
    affiliation: "",
    website: "",
    description: "",
    accreditation: "",
    ranking: "",
    established: "",
    featured: false,
    active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = mode === "create" ? "/api/colleges" : `/api/colleges/${initialData.slug}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          established: form.established ? parseInt(form.established) : undefined,
          ranking: form.ranking ? parseInt(form.ranking) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save college");

      router.push("/admin/colleges");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-white mb-6">
        {mode === "create" ? "Add New College" : "Edit College"}
      </h2>

      {error && (
        <div className="mb-6 p-3.5 rounded-xl bg-red-950/30 border border-red-800 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="College Name" id="name" required>
          <Input id="name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="e.g. Indian Institute of Technology Delhi" />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField label="State" id="stateId" required>
            <select
              id="stateId"
              value={form.stateId}
              onChange={e => setForm({...form, stateId: e.target.value})}
              required
              className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select State</option>
              {states.map((st: any) => <option key={st.id} value={st.id}>{st.name}</option>)}
            </select>
          </FormField>

          <FormField label="City" id="city" required>
            <Input id="city" value={form.city} onChange={e => setForm({...form, city: e.target.value})} required placeholder="e.g. New Delhi" />
          </FormField>

          <FormField label="Institution Type" id="type" required>
            <select
              id="type"
              value={form.type}
              onChange={e => setForm({...form, type: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="GOVERNMENT">Government</option>
              <option value="PRIVATE">Private</option>
              <option value="SEMI_GOVERNMENT">Semi Government</option>
            </select>
          </FormField>

          <FormField label="Established Year" id="established">
            <Input id="established" type="number" value={form.established || ""} onChange={e => setForm({...form, established: e.target.value})} placeholder="e.g. 1961" />
          </FormField>

          <FormField label="Affiliation / University" id="affiliation">
            <Input id="affiliation" value={form.affiliation || ""} onChange={e => setForm({...form, affiliation: e.target.value})} placeholder="e.g. Autonomous / State University" />
          </FormField>

          <FormField label="Official Website" id="website">
            <Input id="website" type="url" value={form.website || ""} onChange={e => setForm({...form, website: e.target.value})} placeholder="https://..." />
          </FormField>
        </div>

        <FormField label="About / Description" id="description">
          <Textarea id="description" value={form.description || ""} onChange={e => setForm({...form, description: e.target.value})} placeholder="Brief overview of the college..." rows={4} />
        </FormField>

        <div className="flex items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} className="rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-blue-600" />
            <span className="text-sm font-medium text-gray-300">Published & Active</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} className="rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-blue-600" />
            <span className="text-sm font-medium text-gray-300">Featured College</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={loading}>{mode === "create" ? "Add College" : "Save Changes"}</Button>
        </div>
      </form>
    </div>
  );
}
