"use client";

import { useEffect, useState, useRef } from "react";
import { Users, Plus, Edit2, Loader2, Save, Trash2, Camera, Check, X, Globe } from "lucide-react";
import { useToast } from "@/components/ui/toaster";

interface Expert {
  id: string;
  name: string;
  photo?: string | null;
  designation?: string | null;
  qualification?: string | null;
  experience?: string | null;
  description?: string | null;
  linkedinUrl?: string | null;
  socialLinks?: Record<string, string> | null;
  active: boolean;
  order: number;
}

export default function AdminExpertsPage() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [editingExpert, setEditingExpert] = useState<Expert | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [qualification, setQualification] = useState("");
  const [experience, setExperience] = useState("");
  const [description, setDescription] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [active, setActive] = useState(true);
  const [order, setOrder] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchExperts = async () => {
    try {
      const res = await fetch("/api/admin/experts");
      if (res.ok) {
        const data = await res.json();
        setExperts(data.data);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load experts list",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperts();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "experts");

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setPhoto(data.data.url);
        toast({
          title: "Success",
          description: "Photo uploaded successfully",
          variant: "success",
        });
      } else {
        toast({
          title: "Upload Failed",
          description: data.message || "Failed to upload photo",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to upload photo",
        variant: "destructive",
      });
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const isEdit = !!editingExpert;
    const url = isEdit ? `/api/admin/experts/${editingExpert.id}` : "/api/admin/experts";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          designation: designation || null,
          qualification: qualification || null,
          experience: experience || null,
          description: description || null,
          linkedinUrl: linkedinUrl || null,
          photo: photo || null,
          active,
          order: Number(order),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Success",
          description: isEdit ? "Expert updated successfully" : "Expert created successfully",
          variant: "success",
        });
        resetForm();
        fetchExperts();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to save expert",
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

  const handleEdit = (expert: Expert) => {
    setEditingExpert(expert);
    setName(expert.name);
    setDesignation(expert.designation || "");
    setQualification(expert.qualification || "");
    setExperience(expert.experience || "");
    setDescription(expert.description || "");
    setLinkedinUrl(expert.linkedinUrl || "");
    setPhoto(expert.photo || null);
    setActive(expert.active);
    setOrder(expert.order);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expert profile?")) return;

    try {
      const res = await fetch(`/api/admin/experts/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast({
          title: "Success",
          description: "Expert profile deleted",
          variant: "success",
        });
        fetchExperts();
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

  const toggleActiveStatus = async (expert: Expert) => {
    try {
      const res = await fetch(`/api/admin/experts/${expert.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !expert.active }),
      });

      if (res.ok) {
        setExperts(prev =>
          prev.map(e => e.id === expert.id ? { ...e, active: !e.active } : e)
        );
        toast({
          title: "Success",
          description: "Expert status updated",
          variant: "success",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update expert status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingExpert(null);
    setName("");
    setDesignation("");
    setQualification("");
    setExperience("");
    setDescription("");
    setLinkedinUrl("");
    setPhoto(null);
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
            <Users size={24} className="text-violet-500" />
            Manage Experts
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Add faculty, mentors, and subject experts to showcase on the website</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form panel */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 h-fit shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {editingExpert ? <Edit2 size={18} className="text-blue-500" /> : <Plus size={18} className="text-blue-500" />}
            {editingExpert ? "Edit Expert Profile" : "Add Expert"}
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            
            {/* Photo upload */}
            <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl gap-3">
              <div className="relative w-24 h-24 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-500 text-3xl font-bold overflow-hidden shadow-inner">
                {imageUploading ? (
                  <Loader2 className="animate-spin text-blue-500" size={24} />
                ) : photo ? (
                  <img src={photo} alt="Upload preview" className="w-full h-full object-cover" />
                ) : (
                  <Users size={32} className="text-gray-700" />
                )}
              </div>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={imageUploading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800 transition-colors"
              >
                <Camera size={14} /> Upload Photo
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
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Amit Sharma"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 placeholder-gray-700"
              />
            </div>

            {/* Designation */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Designation</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Senior Faculty - Mathematics"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 placeholder-gray-700"
              />
            </div>

            {/* Qualification */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Qualification</label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="Ph.D. in Mathematics, IIT Delhi"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 placeholder-gray-700"
              />
            </div>

            {/* LinkedIn URL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">LinkedIn URL</label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 placeholder-gray-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Order */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Display Order</label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Active toggle */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Status</label>
                <button
                  type="button"
                  onClick={() => setActive(!active)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                    active
                      ? "bg-green-950/40 text-green-400 border-green-800/40"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-500 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  {active ? <Check size={12} /> : <X size={12} />}
                  {active ? "Active" : "Inactive"}
                </button>
              </div>
            </div>

            {/* Experience */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Experience / Specialization</label>
              <textarea
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="15+ years in teaching Engineering Mathematics, Calculus, and Linear Algebra..."
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 placeholder-gray-700 resize-none"
              />
            </div>

            {/* Description/Bio */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Short Bio / Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Award-winning educator known for making complex concepts simple..."
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 placeholder-gray-700 resize-none"
              />
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
                Save Expert
              </button>

              {editingExpert && (
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

        {/* Experts list */}
        <div className="lg:col-span-2 space-y-4">
          {experts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500 dark:text-slate-500 shadow-sm">
              No expert profiles added yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {experts.map((expert) => (
                <div key={expert.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between shadow-sm">
                  
                  {/* Expert Card Header */}
                  <div className="p-5 flex gap-4 items-start">
                    <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {expert.photo ? (
                        <img src={expert.photo} alt={expert.name} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="text-violet-500" size={24} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-700 dark:text-slate-200 text-base truncate">{expert.name}</h3>
                      {expert.designation && (
                        <p className="text-xs text-violet-400 font-semibold mt-0.5 truncate">{expert.designation}</p>
                      )}
                      {expert.qualification && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{expert.qualification}</p>
                      )}
                      {expert.linkedinUrl && (
                        <a
                          href={expert.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-1 transition-colors"
                        >
                          <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                          </svg> LinkedIn
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Body description */}
                  {expert.description && (
                    <div className="px-5 pb-4">
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{expert.description}</p>
                    </div>
                  )}

                  {/* Actions footer */}
                  <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => toggleActiveStatus(expert)}
                      className={`text-xs font-bold transition-all px-2.5 py-1 rounded-full border ${
                        expert.active
                          ? "bg-green-950/30 text-green-400 border-green-900/30 hover:bg-green-900/40"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      {expert.active ? "Active" : "Inactive"}
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(expert)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Expert"
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        onClick={() => handleDelete(expert.id)}
                        className="p-1.5 rounded-lg border border-red-950/40 text-red-400 hover:text-white hover:bg-red-950/40 transition-colors"
                        title="Delete Expert"
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
