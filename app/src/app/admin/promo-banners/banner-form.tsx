"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Upload } from "lucide-react";

export function BannerForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [preview, setPreview] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("file", file);
      if (linkUrl) formData.append("linkUrl", linkUrl);

      const res = await fetch("/api/admin/promo-banners", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setIsOpen(false);
        setTitle("");
        setFile(null);
        setPreview("");
        setLinkUrl("");
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.message || "Upload failed");
      }
    } catch (e) {
      console.error(e);
      alert("Something went wrong");
    }
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)} 
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm"
      >
        <Plus size={16} /> Add Banner
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100 dark:border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-slate-900 dark:text-white">Create New Banner</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="banner-title" className="block text-sm font-bold text-gray-700 dark:text-slate-600 dark:text-slate-300 mb-1">Banner Title *</label>
            <input 
              id="banner-title"
              type="text" 
              required 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-300 dark:border-slate-700 bg-transparent text-gray-900 dark:text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20" 
              placeholder="e.g. Join the Mock Test Series!" 
            />
          </div>
          <div>
            <span className="block text-sm font-bold text-gray-700 dark:text-slate-600 dark:text-slate-300 mb-1">Banner Image *</span>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-slate-300 dark:border-slate-700 border-dashed rounded-xl relative overflow-hidden group">
              {preview ? (
                <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-opacity" />
              ) : null}
              <div className="space-y-1 text-center relative z-10">
                <Upload className="mx-auto h-8 w-8 text-slate-500 dark:text-slate-400" />
                <div className="flex text-sm text-gray-600 dark:text-slate-500 dark:text-slate-400 justify-center">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-white dark:bg-slate-900 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-2 py-0.5 shadow-sm">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" required onChange={handleFileChange} />
                  </label>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-500 font-medium bg-white/50 dark:bg-white dark:bg-slate-900/50 px-2 rounded-lg mt-2 inline-block shadow-sm">PNG, JPG, WEBP up to 10MB</p>
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="banner-link" className="block text-sm font-bold text-gray-700 dark:text-slate-600 dark:text-slate-300 mb-1">Link URL (Optional)</label>
            <input 
              id="banner-link"
              type="url" 
              value={linkUrl} 
              onChange={e => setLinkUrl(e.target.value)} 
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-300 dark:border-slate-700 bg-transparent text-gray-900 dark:text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20" 
              placeholder="Where should the banner link to?" 
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-200 dark:border-slate-800">
            <button 
              type="button" 
              onClick={() => setIsOpen(false)} 
              className="px-4 py-2 text-slate-500 dark:text-slate-500 font-bold hover:bg-gray-100 dark:hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-sm"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading || !file} 
              className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-sm disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Save & Activate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
