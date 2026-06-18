"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Edit2, Trash2, Loader2, Save, X, Globe, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/toaster";

interface SeoMeta {
  id: string;
  pageUrl: string;
  seoTitle: string | null;
  metaDescription: string | null;
  keywords: string[];
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  indexable: boolean;
  robotsTags: string | null;
  createdAt: string;
}

export default function AdminSeoPage() {
  const [seoMetas, setSeoMetas] = useState<SeoMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pageUrl, setPageUrl] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywordsText, setKeywordsText] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [ogTitle, setOgTitle] = useState("");
  const [ogDescription, setOgDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [indexable, setIndexable] = useState(true);
  const [robotsTags, setRobotsTags] = useState("index, follow");

  const fetchSeoMetas = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/seo");
      if (!res.ok) throw new Error("Failed to fetch SEO overrides");
      const data = await res.json();
      if (data.success) {
        setSeoMetas(data.data || []);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load SEO meta configurations.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSeoMetas();
  }, []);

  const handleStartEdit = (seo: SeoMeta) => {
    setEditingId(seo.id);
    setPageUrl(seo.pageUrl);
    setSeoTitle(seo.seoTitle || "");
    setMetaDescription(seo.metaDescription || "");
    setKeywordsText(seo.keywords.join(", "));
    setCanonicalUrl(seo.canonicalUrl || "");
    setOgTitle(seo.ogTitle || "");
    setOgDescription(seo.ogDescription || "");
    setOgImage(seo.ogImage || "");
    setIndexable(seo.indexable);
    setRobotsTags(seo.robotsTags || "index, follow");
  };

  const handleResetForm = () => {
    setEditingId(null);
    setPageUrl("");
    setSeoTitle("");
    setMetaDescription("");
    setKeywordsText("");
    setCanonicalUrl("");
    setOgTitle("");
    setOgDescription("");
    setOgImage("");
    setIndexable(true);
    setRobotsTags("index, follow");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageUrl.trim()) {
      toast({ title: "Validation Error", description: "Page URL path is required.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    const keywords = keywordsText
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const payload = {
      pageUrl: pageUrl.trim(),
      seoTitle: seoTitle.trim() || null,
      metaDescription: metaDescription.trim() || null,
      keywords,
      canonicalUrl: canonicalUrl.trim() || null,
      ogTitle: ogTitle.trim() || null,
      ogDescription: ogDescription.trim() || null,
      ogImage: ogImage.trim() || null,
      indexable,
      robotsTags: robotsTags.trim() || null,
    };

    try {
      const url = editingId ? `/api/admin/seo/${editingId}` : "/api/admin/seo";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save SEO config");

      toast({
        title: "Success",
        description: editingId ? "SEO meta overrides updated." : "SEO meta overrides created.",
      });

      handleResetForm();
      fetchSeoMetas();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Operation failed.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this SEO meta override mapping?")) return;

    try {
      const res = await fetch(`/api/admin/seo/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete SEO config");

      setSeoMetas(seoMetas.filter((seo) => seo.id !== id));
      toast({
        title: "Deleted",
        description: "SEO meta mapping deleted successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
          <Globe className="text-blue-500" size={24} />
          SEO Meta Tags Manager
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Configure title tags, description overrides, and robots indexability filters on a per-page URL mapping basis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-55 dark:border-gray-800 pb-2">
            {editingId ? "Edit SEO Mapping" : "New SEO Mapping"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Page URL */}
            <div className="space-y-1">
              <label htmlFor="seo-page-url" className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Page URL Path
              </label>
              <input
                id="seo-page-url"
                type="text"
                required
                value={pageUrl}
                onChange={(e) => setPageUrl(e.target.value)}
                placeholder="/exams/haryana-leet"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
              <span className="text-[10px] text-gray-400 block">Relative path starting with a forward slash.</span>
            </div>

            {/* SEO Title */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label htmlFor="seo-title" className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  SEO Title
                </label>
                <span className={`text-[10px] font-bold ${seoTitle.length > 70 ? "text-red-500" : "text-gray-400"}`}>
                  {seoTitle.length} / 70
                </span>
              </div>
              <input
                id="seo-title"
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Haryana LEET Prep Guide | BTech LEET"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Meta Description */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label htmlFor="seo-desc" className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Meta Description
                </label>
                <span className={`text-[10px] font-bold ${metaDescription.length > 160 ? "text-red-500" : "text-gray-400"}`}>
                  {metaDescription.length} / 160
                </span>
              </div>
              <textarea
                id="seo-desc"
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Get latest mock tests, syllabus, and study resources for Haryana Lateral Entry exams."
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            {/* Keywords */}
            <div className="space-y-1">
              <label htmlFor="seo-keywords" className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Keywords
              </label>
              <input
                id="seo-keywords"
                type="text"
                value={keywordsText}
                onChange={(e) => setKeywordsText(e.target.value)}
                placeholder="leet exam, haryana leet prep"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
              <span className="text-[10px] text-gray-400 block">Separate keywords with commas.</span>
            </div>

            {/* Canonical URL */}
            <div className="space-y-1">
              <label htmlFor="seo-canonical" className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Canonical URL (Optional)
              </label>
              <input
                id="seo-canonical"
                type="url"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                placeholder="https://btechleet.in/exams/haryana-leet"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* OG Metadata */}
            <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <h3 className="text-xs font-bold text-gray-450 uppercase tracking-wider">Social / OG Meta (Optional)</h3>
              
              <div className="space-y-1">
                <label htmlFor="seo-og-title" className="text-[10px] font-bold text-gray-400 uppercase block">OG Title</label>
                <input
                  id="seo-og-title"
                  type="text"
                  value={ogTitle}
                  onChange={(e) => setOgTitle(e.target.value)}
                  placeholder="Haryana LEET Guide"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="seo-og-desc" className="text-[10px] font-bold text-gray-400 uppercase block">OG Description</label>
                <textarea
                  id="seo-og-desc"
                  rows={2}
                  value={ogDescription}
                  onChange={(e) => setOgDescription(e.target.value)}
                  placeholder="Open Graph description..."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent text-gray-900 dark:text-white focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="seo-og-image" className="text-[10px] font-bold text-gray-400 uppercase block">OG Image URL</label>
                <input
                  id="seo-og-image"
                  type="text"
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  placeholder="https://example.com/banner.webp"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent text-gray-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Indexable & Robots */}
            <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <input
                  id="seo-indexable"
                  type="checkbox"
                  checked={indexable}
                  onChange={(e) => setIndexable(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="seo-indexable" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Allow Search Engines to Index (Indexable)
                </label>
              </div>

              <div className="space-y-1">
                <label htmlFor="seo-robots" className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Robots Tags
                </label>
                <input
                  id="seo-robots"
                  type="text"
                  value={robotsTags}
                  onChange={(e) => setRobotsTags(e.target.value)}
                  placeholder="index, follow"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-gray-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : editingId ? (
                  <>
                    <Save size={16} /> Save Changes
                  </>
                ) : (
                  <>
                    <Plus size={16} /> Create SEO Mapping
                  </>
                )}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* SEO Mappings list Column */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-55 dark:border-gray-800 pb-2">
            SEO Overrides ({seoMetas.length})
          </h2>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 size={28} className="animate-spin text-blue-500" />
            </div>
          ) : seoMetas.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-16 text-center text-gray-400 shadow-sm max-w-lg mx-auto">
              <Globe className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={48} />
              <h3 className="font-bold text-gray-800 dark:text-gray-200">No SEO Configurations</h3>
              <p className="text-xs text-gray-500 mt-1">Start by adding your first URL override mapping on the left.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {seoMetas.map((seo) => (
                <div
                  key={seo.id}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-lg">
                        {seo.pageUrl}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 border rounded-full ${
                        seo.indexable
                          ? "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400 border-green-200 dark:border-green-900/20"
                          : "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-900/20"
                      }`}>
                        {seo.indexable ? (
                          <>
                            <Eye size={10} /> Indexable
                          </>
                        ) : (
                          <>
                            <EyeOff size={10} /> No-Index
                          </>
                        )}
                      </span>
                    </div>

                    <span className="text-[10px] text-gray-400">
                      Modified: {new Date(seo.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>

                  <div className="text-xs space-y-1.5 text-gray-500 dark:text-gray-400 bg-gray-50/55 dark:bg-gray-950/30 p-3 rounded-xl border border-gray-100 dark:border-gray-850/50">
                    <p>
                      Title: <strong className="text-gray-800 dark:text-white">{seo.seoTitle || "(Inherited)"}</strong>
                    </p>
                    {seo.metaDescription && (
                      <p className="line-clamp-2">
                        Description: <span className="text-gray-600 dark:text-gray-300">{seo.metaDescription}</span>
                      </p>
                    )}
                    {seo.keywords.length > 0 && (
                      <p className="flex items-center gap-1 flex-wrap">
                        Keywords:{" "}
                        {seo.keywords.map((k, idx) => (
                          <span
                            key={idx}
                            className="bg-gray-150 dark:bg-gray-800 text-gray-650 dark:text-gray-400 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                          >
                            {k}
                          </span>
                        ))}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 justify-end pt-2 border-t border-gray-50 dark:border-gray-855/40">
                    <button
                      onClick={() => handleStartEdit(seo)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(seo.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
