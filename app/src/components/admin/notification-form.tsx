"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Textarea, FormField, Select } from "@/components/ui/input";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface Exam { id: string; name: string; }

interface NotificationFormProps {
  initialData?: {
    id?: string;
    title?: string;
    content?: string;
    examId?: string | null;
    priority?: string;
    published?: boolean;
    pinned?: boolean;
    expiresAt?: Date | null;
  };
  exams: Exam[];
  mode: "create" | "edit";
}

export function NotificationForm({ initialData, exams, mode }: NotificationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: initialData?.title || "",
    content: initialData?.content || "",
    examId: initialData?.examId || "",
    priority: initialData?.priority || "MEDIUM",
    published: initialData?.published ?? true,
    pinned: initialData?.pinned ?? false,
    expiresAt: initialData?.expiresAt ? new Date(initialData.expiresAt).toISOString().slice(0, 16) : "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      ...form,
      examId: form.examId || null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    };

    const res = await fetch(
      mode === "create" ? "/api/notifications" : `/api/notifications/${initialData?.id}`,
      {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();
    if (data.success) {
      router.push("/admin/notifications");
      router.refresh();
    } else {
      setError(data.message || "Failed to save");
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/notifications" className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors" aria-label="Back to notifications">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-bold text-white">
          {mode === "create" ? "Add Notification" : "Edit Notification"}
        </h1>
      </div>

      {error && <div className="mb-4 p-4 bg-red-950/30 border border-red-800 rounded-xl text-red-400 text-sm" role="alert">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
          <FormField label="Title" id="notif-title" required>
            <Input id="notif-title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Notification title" required className="bg-gray-800 border-gray-700 text-white" />
          </FormField>

          <FormField label="Content" id="notif-content" required>
            <Textarea id="notif-content" value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} placeholder="Notification details..." rows={5} required className="bg-gray-800 border-gray-700 text-white" />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Priority" id="notif-priority">
              <Select id="notif-priority" value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))} className="bg-gray-800 border-gray-700 text-white">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </Select>
            </FormField>

            <FormField label="Related Exam" id="notif-exam">
              <Select id="notif-exam" value={form.examId} onChange={(e) => setForm((p) => ({ ...p, examId: e.target.value }))} className="bg-gray-800 border-gray-700 text-white">
                <option value="">No specific exam</option>
                {exams.map((ex) => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
              </Select>
            </FormField>
          </div>

          <FormField label="Expires At (optional)" id="notif-expires">
            <Input id="notif-expires" type="datetime-local" value={form.expiresAt} onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))} className="bg-gray-800 border-gray-700 text-white" />
          </FormField>

          <div className="flex flex-wrap gap-6">
            {[
              { key: "published", label: "Published" },
              { key: "pinned", label: "Pinned (show at top)" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form[key as keyof typeof form] as boolean} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.checked }))} className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600" />
                <span className="text-sm text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" loading={loading} className="flex items-center gap-2">
            <Save size={16} aria-hidden="true" /> {mode === "create" ? "Create" : "Save Changes"}
          </Button>
          <Link href="/admin/notifications"><Button type="button" variant="secondary">Cancel</Button></Link>
        </div>
      </form>
    </div>
  );
}
