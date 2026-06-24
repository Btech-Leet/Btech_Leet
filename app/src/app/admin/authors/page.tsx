"use client";

import { useEffect, useState, useRef } from "react";
import { PenTool, Plus, Edit2, Loader2, Save, Trash2, Camera, Check, X, BookOpen } from "lucide-react";
import { useToast } from "@/components/ui/toaster";

interface Author {
  id: string;
  name: string;
  slug: string;
  photo?: string | null;
  designation?: string | null;
  biography?: string | null;
  experience?: string | null;
  linkedinUrl?: string | null;
  active: boolean;
  _count?: { books: number };
}

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [biography, setBiography] = useState("");
  const [experience, setExperience] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [active, setActive] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchAuthors = async () => {
    try {
      const res = await fetch("/api/admin/authors");
      if (res.ok) {
        const data = await res.json();
        setAuthors(data.data);
      }
    } catch {
      toast({ title: "Error", description: "Failed to load authors", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAuthors(); }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "authors");

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setPhoto(data.data.url);
        toast({ title: "Success", description: "Photo uploaded", variant: "success" });
      } else {
        toast({ title: "Upload Failed", description: data.message || "Failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to upload", variant: "destructive" });
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const isEdit = !!editingAuthor;
    const url = isEdit ? `/api/admin/authors/${editingAuthor.id}` : "/api/admin/authors";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          designation: designation || null,
          biography: biography || null,
          experience: experience || null,
          linkedinUrl: linkedinUrl || null,
          photo: photo || null,
          active,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast({ title: "Success", description: isEdit ? "Author updated" : "Author created", variant: "success" });
        resetForm();
        fetchAuthors();
      } else {
        toast({ title: "Error", description: data.message || "Failed to save", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (author: Author) => {
    setEditingAuthor(author);
    setName(author.name);
    setDesignation(author.designation || "");
    setBiography(author.biography || "");
    setExperience(author.experience || "");
    setLinkedinUrl(author.linkedinUrl || "");
    setPhoto(author.photo || null);
    setActive(author.active);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this author?")) return;
    try {
      const res = await fetch(`/api/admin/authors/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Success", description: "Author deleted", variant: "success" });
        fetchAuthors();
      } else {
        toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    }
  };

  const toggleActive = async (author: Author) => {
    try {
      const res = await fetch(`/api/admin/authors/${author.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !author.active }),
      });
      if (res.ok) {
        setAuthors(prev => prev.map(a => a.id === author.id ? { ...a, active: !a.active } : a));
        toast({ title: "Success", description: "Status updated", variant: "success" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setEditingAuthor(null);
    setName(""); setDesignation(""); setBiography(""); setExperience("");
    setLinkedinUrl(""); setPhoto(null); setActive(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <PenTool size={24} className="text-emerald-500" />
          Manage Authors
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Add and manage book/notes authors for the platform</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 h-fit shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {editingAuthor ? <Edit2 size={18} className="text-blue-500" /> : <Plus size={18} className="text-blue-500" />}
            {editingAuthor ? "Edit Author" : "Add Author"}
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Photo */}
            <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl gap-3">
              <div className="relative w-20 h-20 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden shadow-inner">
                {imageUploading ? (
                  <Loader2 className="animate-spin text-blue-500" size={24} />
                ) : photo ? (
                  <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <PenTool size={28} className="text-gray-700" />
                )}
              </div>
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={imageUploading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800 transition-colors">
                <Camera size={14} /> Upload Photo
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Full Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Prof. Rajesh Gupta"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 placeholder-gray-700" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Designation</label>
              <input type="text" value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="Professor, Dept. of Mathematics"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 placeholder-gray-700" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">LinkedIn URL</label>
              <input type="url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/username"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 placeholder-gray-700" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Experience</label>
              <textarea value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="20+ years in teaching..." rows={3}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 placeholder-gray-700 resize-none" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Biography</label>
              <textarea value={biography} onChange={(e) => setBiography(e.target.value)} placeholder="Short bio about the author..." rows={3}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 placeholder-gray-700 resize-none" />
            </div>

            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setActive(!active)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                  active ? "bg-green-950/40 text-green-400 border-green-800/40" : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-500 border-slate-200 dark:border-slate-800"
                }`}>
                {active ? <Check size={12} /> : <X size={12} />}
                {active ? "Active" : "Inactive"}
              </button>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={submitting}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {submitting ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save size={16} className="mr-2" />}
                Save Author
              </button>
              {editingAuthor && (
                <button type="button" onClick={resetForm}
                  className="px-4 py-2 text-sm font-bold rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Authors List */}
        <div className="lg:col-span-2 space-y-4">
          {authors.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500 dark:text-slate-500 shadow-sm">
              No authors added yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {authors.map((author) => (
                <div key={author.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between shadow-sm">
                  <div className="p-5 flex gap-4 items-start">
                    <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {author.photo ? (
                        <img src={author.photo} alt={author.name} className="w-full h-full object-cover" />
                      ) : (
                        <PenTool className="text-emerald-500" size={22} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-700 dark:text-slate-200 text-base truncate">{author.name}</h3>
                      {author.designation && (
                        <p className="text-xs text-emerald-400 font-semibold mt-0.5 truncate">{author.designation}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5">
                        {author._count && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950/40 text-blue-400 border border-blue-900/30">
                            <BookOpen size={10} /> {author._count.books} Books
                          </span>
                        )}
                        {author.linkedinUrl && (
                          <a href={author.linkedinUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors">
                            <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                            </svg> LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <button onClick={() => toggleActive(author)}
                      className={`text-xs font-bold transition-all px-2.5 py-1 rounded-full border ${
                        author.active
                          ? "bg-green-950/30 text-green-400 border-green-900/30 hover:bg-green-900/40"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}>
                      {author.active ? "Active" : "Inactive"}
                    </button>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(author)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Edit Author">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleDelete(author.id)}
                        className="p-1.5 rounded-lg border border-red-950/40 text-red-400 hover:text-white hover:bg-red-950/40 transition-colors" title="Delete Author">
                        <Trash2 size={13} />
                      </button>
                    </div>
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
