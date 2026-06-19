"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, FormField, Textarea } from "@/components/ui/input";
import { parseMarkdown } from "@/lib/markdown";

function nullableText(value: unknown) {
  return typeof value === "string" && value.trim() === "" ? null : value;
}

type BlogFormValues = {
  title: string;
  slug?: string;
  excerpt: string | null;
  content: string;
  categoryId: string | null;
  coverImage: string | null;
  tags: string | string[];
  authorName: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured: boolean;
};

const defaultForm: BlogFormValues = {
  title: "",
  excerpt: "",
  content: "",
  categoryId: "",
  coverImage: "",
  tags: "",
  authorName: "",
  status: "PUBLISHED",
  featured: false,
};

export function BlogForm({ categories, initialData, mode = "create" }: { 
  categories: { id: string; name: string }[];
  initialData?: Partial<BlogFormValues>;
  mode?: "create" | "edit";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  
  const [form, setForm] = useState<BlogFormValues>({ ...defaultForm, ...initialData });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = mode === "create" ? "/api/blog" : `/api/blog/${initialData?.slug}`;
      const method = mode === "create" ? "POST" : "PUT";

      const tagsArray = typeof form.tags === 'string' 
        ? (form.tags as string).split(",").map((t: string) => t.trim()).filter(Boolean)
        : form.tags;

      const payload = {
        ...form,
        title: form.title.trim(),
        excerpt: nullableText(form.excerpt),
        content: form.content.trim(),
        categoryId: form.categoryId || null,
        coverImage: nullableText(form.coverImage),
        authorName: nullableText(form.authorName),
        tags: tagsArray,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to save post");

      router.push("/admin/blog");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save post");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-white mb-6">
        {mode === "create" ? "Write New Post" : "Edit Post"}
      </h2>

      {error && (
        <div className="mb-6 p-3.5 rounded-xl bg-red-950/30 border border-red-800 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Post Title" id="title" required>
          <Input id="title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="Enter an engaging title..." />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField label="Category" id="categoryId">
            <select
              id="categoryId"
              value={form.categoryId || ""}
              onChange={e => setForm({...form, categoryId: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="">{categories.length ? "Uncategorized" : "No categories yet"}</option>
              {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
            {categories.length === 0 && (
              <p className="mt-1 text-xs text-amber-400">
                Add blog categories from the Blog Posts page to show them here.
              </p>
            )}
          </FormField>

          <FormField label="Status" id="status" required>
            <select
              id="status"
              value={form.status}
              onChange={e => setForm({...form, status: e.target.value as BlogFormValues["status"]})}
              className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </FormField>

          <FormField label="Author Name" id="authorName">
            <Input id="authorName" value={form.authorName || ""} onChange={e => setForm({...form, authorName: e.target.value})} placeholder="e.g. John Doe" />
          </FormField>

          <FormField label="Tags (Comma separated)" id="tags">
            <Input id="tags" value={typeof form.tags === 'object' ? form.tags.join(", ") : form.tags || ""} onChange={e => setForm({...form, tags: e.target.value})} placeholder="e.g. LEET, Prep, Math" />
          </FormField>
        </div>

        <FormField label="Cover Image URL" id="coverImage">
          <Input id="coverImage" value={form.coverImage || ""} onChange={e => setForm({...form, coverImage: e.target.value})} placeholder="https://..." />
        </FormField>

        <FormField label="Excerpt / Short Summary" id="excerpt">
          <Textarea id="excerpt" value={form.excerpt || ""} onChange={e => setForm({...form, excerpt: e.target.value})} placeholder="A brief summary for the blog card..." rows={2} />
        </FormField>

        <FormField label="Content (Markdown supported)" id="content" required>
          <div className="space-y-3">
            <div className="flex bg-gray-950 border border-gray-800 p-0.5 rounded-lg text-xs w-fit">
              <button
                type="button"
                onClick={() => setActiveTab("write")}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  activeTab === "write" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  activeTab === "preview" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Preview
              </button>
            </div>

            {activeTab === "write" ? (
              <Textarea
                id="content"
                value={form.content || ""}
                onChange={e => setForm({ ...form, content: e.target.value })}
                required
                placeholder="Write your post content in Markdown here..."
                rows={16}
                className="font-mono text-sm bg-gray-950 border-gray-800 text-gray-200 focus:border-blue-500 focus:outline-none"
              />
            ) : (
              <div className="min-h-[400px] max-h-[600px] overflow-y-auto px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-gray-200">
                {form.content ? (
                  <div
                    className="prose prose-invert max-w-none prose-headings:font-bold prose-a:text-blue-400 prose-img:rounded-xl text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(form.content) }}
                  />
                ) : (
                  <p className="text-sm text-gray-500 italic">Nothing to preview yet. Write some markdown content first.</p>
                )}
              </div>
            )}
          </div>
        </FormField>

        <div className="flex items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} className="rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-blue-600" />
            <span className="text-sm font-medium text-gray-300">Featured Post</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={loading}>{mode === "create" ? "Publish Post" : "Save Changes"}</Button>
        </div>
      </form>
    </div>
  );
}
