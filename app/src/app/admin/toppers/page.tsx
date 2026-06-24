"use client";

import { useEffect, useState, useRef } from "react";
import { Trophy, Plus, Edit2, Loader2, Save, Trash2, Camera, Star, StarOff, Check, X } from "lucide-react";
import { useToast } from "@/components/ui/toaster";

interface Topper {
  id: string;
  name: string;
  image?: string | null;
  rank?: number | null;
  score?: string | null;
  collegeName?: string | null;
  branch?: string | null;
  year?: number | null;
  successStory?: string | null;
  description?: string | null;
  active: boolean;
  order: number;
}

export default function AdminToppersPage() {
  const [toppers, setToppers] = useState<Topper[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [editingTopper, setEditingTopper] = useState<Topper | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [rank, setRank] = useState<number | "">("");
  const [score, setScore] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState<number | "">("");
  const [successStory, setSuccessStory] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [active, setActive] = useState(true);
  const [order, setOrder] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchToppers = async () => {
    try {
      const res = await fetch("/api/admin/toppers");
      if (res.ok) {
        const data = await res.json();
        setToppers(data.data);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load toppers list",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToppers();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "toppers");

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setImage(data.data.url);
        toast({
          title: "Success",
          description: "Image uploaded successfully",
          variant: "success",
        });
      } else {
        toast({
          title: "Upload Failed",
          description: data.message || "Failed to upload image",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const isEdit = !!editingTopper;
    const url = isEdit ? `/api/admin/toppers/${editingTopper.id}` : "/api/admin/toppers";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          rank: rank ? Number(rank) : null,
          score: score || null,
          collegeName: collegeName || null,
          branch: branch || null,
          year: year ? Number(year) : null,
          successStory: successStory || null,
          description: description || null,
          image: image || null,
          active,
          order: Number(order),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Success",
          description: isEdit ? "Topper updated successfully" : "Topper created successfully",
          variant: "success",
        });
        resetForm();
        fetchToppers();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to save topper",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (topper: Topper) => {
    setEditingTopper(topper);
    setName(topper.name);
    setRank(topper.rank || "");
    setScore(topper.score || "");
    setCollegeName(topper.collegeName || "");
    setBranch(topper.branch || "");
    setYear(topper.year || "");
    setSuccessStory(topper.successStory || "");
    setDescription(topper.description || "");
    setImage(topper.image || null);
    setActive(topper.active);
    setOrder(topper.order);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this topper profile?")) return;

    try {
      const res = await fetch(`/api/admin/toppers/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast({
          title: "Success",
          description: "Topper profile deleted",
          variant: "success",
        });
        fetchToppers();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete profile",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    }
  };

  const toggleActiveStatus = async (topper: Topper) => {
    try {
      const res = await fetch(`/api/admin/toppers/${topper.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !topper.active }),
      });

      if (res.ok) {
        setToppers(prev =>
          prev.map(t => t.id === topper.id ? { ...t, active: !t.active } : t)
        );
        toast({
          title: "Success",
          description: "Topper status updated",
          variant: "success",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update topper status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingTopper(null);
    setName("");
    setRank("");
    setScore("");
    setCollegeName("");
    setBranch("");
    setYear("");
    setSuccessStory("");
    setDescription("");
    setImage(null);
    setActive(true);
    setOrder(0);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy size={24} className="text-amber-500" />
            Manage Toppers
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Publish student success stories and examination ranks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form panel */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 h-fit shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {editingTopper ? <Edit2 size={18} className="text-blue-500" /> : <Plus size={18} className="text-blue-500" />}
            {editingTopper ? "Edit Topper Profile" : "Add Topper"}
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            
            {/* Image upload */}
            <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl gap-3">
              <div className="relative w-24 h-24 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-500 text-3xl font-bold overflow-hidden shadow-inner">
                {imageUploading ? (
                  <Loader2 className="animate-spin text-blue-500" size={24} />
                ) : image ? (
                  <img src={image} alt="Upload preview" className="w-full h-full object-cover" />
                ) : (
                  <Trophy size={32} className="text-gray-700" />
                )}
              </div>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={imageUploading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800 transition-colors"
              >
                <Camera size={14} /> Upload Photograph
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Student Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rahul Kumar"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 placeholder-gray-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Rank */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">LEET Rank</label>
                <input
                  type="number"
                  value={rank}
                  onChange={(e) => setRank(e.target.value ? Number(e.target.value) : "")}
                  placeholder="1"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 placeholder-gray-700"
                />
              </div>

              {/* Score */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Score/Marks</label>
                <input
                  type="text"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="92/100"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 placeholder-gray-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Year */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value ? Number(e.target.value) : "")}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Year</option>
                  {Array.from({ length: 10 }, (_, i) => 2020 + i).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Order */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Order</label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* College & Branch */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">College</label>
                <input
                  type="text"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="YMCA Faridabad"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 placeholder-gray-700"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Branch</label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="CSE"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 placeholder-gray-700"
                />
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Brief Subtitle/Tagline</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Secured Admission in YMCA, Faridabad"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 placeholder-gray-700"
              />
            </div>

            {/* Success story */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Success Story / Preparation Tips</label>
              <textarea
                value={successStory}
                onChange={(e) => setSuccessStory(e.target.value)}
                placeholder="Rahul's strategy was solving previous year question papers and attending daily tests..."
                rows={4}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 placeholder-gray-700 resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActive(!active)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                  active
                    ? "bg-green-950/40 text-green-400 border-green-800/40"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-500 border-slate-200 dark:border-slate-800"
                }`}
              >
                {active ? <Check size={12} /> : <X size={12} />}
                {active ? "Active" : "Inactive"}
              </button>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? (
                  <Loader2 className="animate-spin mr-2" size={16} />
                ) : (
                  <Save size={16} className="mr-2" />
                )}
                Save Topper
              </button>

              {editingTopper && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-bold rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>

          </form>
        </div>

        {/* Toppers list */}
        <div className="lg:col-span-2 space-y-4">
          {toppers.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500 dark:text-slate-500 shadow-sm">
              No topper profiles uploaded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {toppers.map((topper) => (
                <div key={topper.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between shadow-sm">
                  
                  {/* Topper Card Header */}
                  <div className="p-5 flex gap-4 items-start">
                    <div className="w-16 h-16 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {topper.image ? (
                        <img src={topper.image} alt={topper.name} className="w-full h-full object-cover" />
                      ) : (
                        <Trophy className="text-amber-500" size={24} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-700 dark:text-slate-200 text-base flex items-center gap-1.5">
                        {topper.name}
                        {topper.rank && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold border border-amber-500/20">
                            Rank {topper.rank}
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {topper.collegeName} • {topper.branch} ({topper.year})
                      </p>
                      {topper.score && (
                        <p className="text-xs text-blue-400 font-semibold mt-1">
                          Score: {topper.score}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Body description */}
                  {topper.description && (
                    <div className="px-5 pb-4">
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic font-medium">"{topper.description}"</p>
                    </div>
                  )}

                  {/* Actions footer */}
                  <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => toggleActiveStatus(topper)}
                      className={`text-xs font-bold transition-all px-2.5 py-1 rounded-full border ${
                        topper.active
                          ? "bg-green-950/30 text-green-400 border-green-900/30 hover:bg-green-900/40"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      {topper.active ? "Active" : "Inactive"}
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(topper)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Topper Details"
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        onClick={() => handleDelete(topper.id)}
                        className="p-1.5 rounded-lg border border-red-950/40 text-red-400 hover:text-white hover:bg-red-950/40 transition-colors"
                        title="Delete Topper Details"
                      >
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
