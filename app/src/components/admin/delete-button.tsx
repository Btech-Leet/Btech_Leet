"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface DeleteButtonProps {
  endpoint: string;
  label: string;
  onSuccess?: () => void;
}

export function DeleteButton({ endpoint, label, onSuccess }: DeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      if (res.ok) {
        onSuccess?.();
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message || "Delete failed");
      }
    } catch {
      alert("Network error");
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={`p-1.5 rounded-lg transition-colors ${
        confirming
          ? "text-red-400 bg-red-950/50 hover:bg-red-950"
          : "text-gray-400 hover:text-red-400 hover:bg-gray-700"
      }`}
      aria-label={confirming ? `Confirm delete ${label}` : `Delete ${label}`}
      title={confirming ? "Click again to confirm delete" : `Delete ${label}`}
    >
      <Trash2 size={15} aria-hidden="true" />
    </button>
  );
}
