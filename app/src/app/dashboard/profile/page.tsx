"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useToast } from "@/components/ui/toaster";
import { User, Phone, MapPin, Building, GitBranch, Calendar, Trophy, ArrowLeft, Camera, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh",
  "Lakshadweep", "Puducherry"
];

const BRANCHES = [
  "Computer Science & Engineering",
  "Information Technology",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "Electronics & Communication Engineering",
  "Chemical Engineering",
  "B.Pharmacy",
  "Other"
];

const EXAM_TARGETS = [
  { id: "HARYANA_LEET", label: "Haryana LEET" },
  { id: "ALL_INDIA_LEET", label: "All India LEET" },
  { id: "PUNJAB_LEET", label: "Punjab LEET" },
  { id: "CHANDIGARH_LEET", label: "Chandigarh LEET" },
  { id: "B_PHARMACY_LEET", label: "B.Pharmacy LEET" },
  { id: "OTHER_LEET", label: "Other LEET Exams" }
];

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [state, setState] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [branch, setBranch] = useState("");
  const [passingYear, setPassingYear] = useState<number | "">("");
  const [examTargets, setExamTargets] = useState<string[]>([]);
  const [profileComplete, setProfileComplete] = useState(0);

  // Fetch full profile details
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/users/profile");
        if (res.ok) {
          const data = await res.json();
          const p = data.data;
          setName(p.name || "");
          setMobile(p.mobile || "");
          setState(p.state || "");
          setCollegeName(p.collegeName || "");
          setBranch(p.branch || "");
          setPassingYear(p.passingYear || "");
          setExamTargets(p.examTargets || []);
          setProfileComplete(p.profileComplete || 0);
        } else {
          toast({
            title: "Error",
            description: "Failed to load profile details",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadProfile();
    } else {
      // If not logged in, redirect will be handled by dashboard middleware or check
      setLoading(false);
    }
  }, [user, toast]);

  const handleCheckboxChange = (id: string) => {
    setExamTargets((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          mobile: mobile || null,
          state: state || null,
          collegeName: collegeName || null,
          branch: branch || null,
          passingYear: passingYear ? Number(passingYear) : null,
          examTargets,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
          variant: "success",
        });
        setProfileComplete(data.data.profileComplete);
        await refreshUser();
      } else {
        toast({
          title: "Update Failed",
          description: data.message || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Avatar image size must be under 2MB",
        variant: "destructive",
      });
      return;
    }

    setAvatarLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/users/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Success",
          description: "Profile picture uploaded",
          variant: "success",
        });
        setProfileComplete(data.data.profileComplete);
        await refreshUser();
      } else {
        toast({
          title: "Upload Failed",
          description: data.message || "Failed to upload avatar",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
      });
      console.error(err);
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleAvatarDelete = async () => {
    if (!confirm("Are you sure you want to remove your profile picture?")) return;

    setAvatarLoading(true);
    try {
      const res = await fetch("/api/users/avatar", {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Success",
          description: "Profile picture removed",
          variant: "success",
        });
        setProfileComplete(data.data.profileComplete);
        await refreshUser();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to remove avatar",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to remove avatar",
        variant: "destructive",
      });
      console.error(err);
    } finally {
      setAvatarLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={32} />
          <span className="text-gray-500 text-sm">Loading your profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

          {/* Page Heading */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Edit Profile</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Complete your profile to unlock customized mock tests and recommendation tools.
              </p>
            </div>
            
            {/* Completion Badge */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-center gap-3 shadow-sm min-w-[180px]">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200 dark:text-gray-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-blue-600 dark:text-blue-400 transition-all duration-500"
                    strokeDasharray={`${profileComplete}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-xs font-bold text-gray-900 dark:text-white">
                  {profileComplete}%
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Completion</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {profileComplete === 100 ? "Completed! ✨" : "Almost Done!"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Profile Picture Panel */}
            <div className="md:col-span-1 flex flex-col items-center p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm h-fit">
              <div className="relative group">
                <div className="w-32 h-32 rounded-2xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 text-4xl font-extrabold overflow-hidden border border-blue-200 dark:border-blue-900 shadow-inner">
                  {avatarLoading ? (
                    <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={32} />
                  ) : user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user?.name[0].toUpperCase()
                  )}
                </div>
                
                {/* Image Upload Trigger Overlay */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarLoading}
                  className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                  title="Upload profile picture"
                >
                  <Camera size={24} />
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />

              <div className="text-center mt-4 w-full">
                <h3 className="font-bold text-gray-800 dark:text-gray-200">{user?.name}</h3>
                <p className="text-xs text-gray-400 mt-1 truncate">{user?.email}</p>
                
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Camera size={14} /> Change
                  </button>
                  
                  {user?.avatar && (
                    <button
                      type="button"
                      onClick={handleAvatarDelete}
                      disabled={avatarLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  )}
                </div>
                
                <p className="text-[10px] text-gray-400 mt-3">
                  Upload JPG, PNG or WEBP (Max 2MB).
                </p>
              </div>
            </div>

            {/* Profile Info Form */}
            <div className="md:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm">
              <form onSubmit={handleSave} className="space-y-6">
                
                <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
                  <User size={18} className="text-blue-600" /> Personal Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nishant Sharma"
                        className="pl-9 w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Mobile */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Mobile Number</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="9876543210"
                        className="pl-9 w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* State */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">State</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="pl-9 w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500 appearance-none"
                      >
                        <option value="">Select State</option>
                        {STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* College Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">College/Institute Name</label>
                    <div className="relative">
                      <Building size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={collegeName}
                        onChange={(e) => setCollegeName(e.target.value)}
                        placeholder="Government Polytechnic"
                        className="pl-9 w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Branch */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Branch/Stream</label>
                    <div className="relative">
                      <GitBranch size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="pl-9 w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500 appearance-none"
                      >
                        <option value="">Select Branch</option>
                        {BRANCHES.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Passing Year */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Diploma Passing Year</label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <select
                        value={passingYear}
                        onChange={(e) => setPassingYear(e.target.value ? Number(e.target.value) : "")}
                        className="pl-9 w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500 appearance-none"
                      >
                        <option value="">Select Year</option>
                        {Array.from({ length: 15 }, (_, i) => 2020 + i).map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Exam Targets */}
                <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Trophy size={18} className="text-blue-600" /> Exam Targets
                  </h2>
                  <p className="text-xs text-gray-400">Select lateral entry exams you are planning to attempt.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    {EXAM_TARGETS.map((target) => {
                      const isChecked = examTargets.includes(target.id);
                      return (
                        <label
                          key={target.id}
                          className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                            isChecked
                              ? "bg-blue-50/60 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-400"
                              : "bg-gray-50 dark:bg-gray-950/40 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCheckboxChange(target.id)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <span className="text-sm font-semibold">{target.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-md focus:outline-none disabled:opacity-50 transition-colors w-full sm:w-auto"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={16} /> Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
    </div>
  );
}
