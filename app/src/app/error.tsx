"use client";

import { useEffect } from "react";
import { AlertOctagon, RefreshCcw } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-gray-950 px-4">
        <div className="max-w-md w-full text-center space-y-6 bg-gray-900 border border-gray-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-red-600/10 blur-3xl rounded-full pointer-events-none" />
          
          <div className="w-20 h-20 bg-red-600/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10">
            <AlertOctagon size={40} />
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Something went wrong!</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              {error.message || "We encountered an unexpected internal server error while loading this page."}
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => reset()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCcw size={18} /> Try Again
              </button>
              <a 
                href="/"
                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center transition-colors"
              >
                Return to Home
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
