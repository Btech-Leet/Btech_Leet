"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type BlogCategory = {
  id: string;
  name: string;
  slug: string;
  _count?: { posts: number };
};

export function BlogCategoryManager({ categories }: { categories: BlogCategory[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const createCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/blog-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create category");

      setName("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (category: BlogCategory) => {
    setDeletingId(category.id);
    setError("");

    try {
      const res = await fetch(`/api/admin/blog-categories/${category.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete category");

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white">Blog Categories</h2>
        <p className="text-sm text-gray-400 mt-1">Create categories here, then select them while writing a post.</p>
      </div>

      <form onSubmit={createCategory} className="flex flex-col sm:flex-row gap-3">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Exam Updates"
          className="bg-gray-950 border-gray-800 text-gray-100"
          required
          minLength={2}
        />
        <Button type="submit" loading={loading} className="sm:w-auto">
          <Plus size={16} aria-hidden="true" />
          Add Category
        </Button>
      </form>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950/30 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {categories.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-700 px-4 py-6 text-center text-sm text-gray-500">
          No blog categories yet.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <div key={category.id} className="inline-flex items-center gap-2 rounded-lg bg-gray-950 border border-gray-800 px-3 py-2">
              <span className="text-sm font-medium text-gray-200">{category.name}</span>
              <span className="text-xs text-gray-500">{category._count?.posts || 0}</span>
              <button
                type="button"
                onClick={() => deleteCategory(category)}
                disabled={deletingId === category.id || Boolean(category._count?.posts)}
                className="text-gray-500 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={`Delete ${category.name}`}
                title={category._count?.posts ? "Category has posts" : `Delete ${category.name}`}
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
