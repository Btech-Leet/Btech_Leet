"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ToastData {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
}

const ToastContext = React.createContext<{
  toasts: ToastData[];
  toast: (data: Omit<ToastData, "id">) => void;
  dismiss: (id: string) => void;
} | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within Toaster");
  return ctx;
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  const toast = React.useCallback((data: Omit<ToastData, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...data, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={cn(
              "flex items-start gap-3 p-4 rounded-xl shadow-lg border animate-slide-up",
              t.variant === "destructive"
                ? "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                : t.variant === "success"
                ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                : "bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700"
            )}
          >
            <div className="flex-1 min-w-0">
              {t.title && (
                <p className={cn(
                  "text-sm font-semibold",
                  t.variant === "destructive" ? "text-red-800 dark:text-red-200" :
                  t.variant === "success" ? "text-green-800 dark:text-green-200" :
                  "text-gray-900 dark:text-gray-100"
                )}>
                  {t.title}
                </p>
              )}
              {t.description && (
                <p className={cn(
                  "text-sm mt-0.5",
                  t.variant === "destructive" ? "text-red-700 dark:text-red-300" :
                  t.variant === "success" ? "text-green-700 dark:text-green-300" :
                  "text-gray-600 dark:text-gray-400"
                )}>
                  {t.description}
                </p>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0 text-lg leading-none"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
