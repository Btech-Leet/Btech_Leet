"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Power, PowerOff } from "lucide-react";

export function BannerActions({ banner }: { banner: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggleActive = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/promo-banners/${banner.id}`, {
        method: "PATCH",
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to toggle banner");
      }
    } catch (err) {
      console.error(err);
      alert("Error toggling banner");
    } finally {
      setLoading(false);
    }
  };

  const deleteBanner = async () => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/promo-banners/${banner.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to delete banner");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting banner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-200 dark:border-slate-800 flex justify-between items-center">
      <div className="flex gap-2">
        <button
          onClick={toggleActive}
          disabled={loading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors disabled:opacity-50 ${
            banner.active 
              ? "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50" 
              : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
          }`}
        >
          {banner.active ? <PowerOff size={14} /> : <Power size={14} />}
          {banner.active ? "Deactivate" : "Activate"}
        </button>
      </div>
      
      <button
        onClick={deleteBanner}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
      >
        <Trash2 size={14} />
        Delete
      </button>
    </div>
  );
}
