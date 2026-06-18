import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Telescope, Home, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "404 - Page Not Found | BTech LEET",
  description: "Oops! We couldn't find the page you're looking for.",
};

export default function NotFoundPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center bg-gray-950 px-6 text-center overflow-hidden">
        
        {/* Background ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-2xl">
          <div className="w-24 h-24 mx-auto bg-blue-600/10 border border-blue-500/20 text-blue-500 rounded-3xl flex items-center justify-center animate-bounce">
            <Telescope size={48} />
          </div>

          <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-indigo-600 tracking-tighter">
            404
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-bold text-white">Looks like you're lost in space!</h2>
          
          <p className="text-gray-400 text-lg leading-relaxed max-w-md mx-auto">
            The page or college cutoff you're looking for might have been moved, deleted, or never existed in the first place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <a 
              href="/" 
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
            >
              <Home size={18} /> Return Home
            </a>
            <a 
              href="/datasets/cutoffs" 
              className="w-full sm:w-auto px-8 py-3.5 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Search size={18} /> Search Cutoffs
            </a>
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
