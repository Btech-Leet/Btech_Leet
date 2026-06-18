"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Verification token is missing. Please check your verification link.");
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Email verification failed.");
        }

        setSuccess(true);
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      } catch (err: any) {
        setError(err.message || "An error occurred during verification.");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4 py-12 sm:px-6 lg:px-8 selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-gray-900 border border-gray-800 p-10 shadow-2xl animate-slide-up text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white">
            Email Verification
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Verifying your account details...
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center min-h-[120px]">
          {loading && (
            <div className="space-y-4">
              <Loader2 className="animate-spin text-blue-500 h-10 w-10 mx-auto" />
              <p className="text-sm text-gray-400">Verifying your email address, please wait...</p>
            </div>
          )}

          {error && !loading && (
            <div className="space-y-4">
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg flex items-center justify-center gap-2">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
              <a
                href="/auth/login"
                className="inline-block px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl text-sm transition-all"
              >
                Back to Login
              </a>
            </div>
          )}

          {success && !loading && (
            <div className="space-y-4">
              <CheckCircle2 size={48} className="text-green-500 mx-auto" />
              <h3 className="text-white font-bold text-lg">Verification Successful!</h3>
              <p className="text-xs text-gray-400">
                Your email has been verified. Redirecting you to login...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        <Loader2 className="animate-spin text-blue-500 h-8 w-8" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
