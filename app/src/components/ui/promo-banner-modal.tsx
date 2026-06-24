"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Link from "next/link";

export function PromoBannerModal({ banner }: { banner: any }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check session storage so it doesn't pop up on every page load
    const closedBannerId = sessionStorage.getItem("closedPromoBanner");
    if (closedBannerId !== banner.id) {
      // Small delay so it pops up nicely after page load
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, [banner.id]);

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsOpen(false);
    sessionStorage.setItem("closedPromoBanner", banner.id);
  };

  if (!isOpen) return null;

  const content = (
    <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] ring-1 ring-slate-900/10 outline outline-4 outline-white/50 animate-in zoom-in-95 duration-300 p-1.5 sm:p-2.5">
      <button 
        onClick={handleClose}
        className="absolute -top-4 -right-4 sm:-top-5 sm:-right-5 z-20 flex items-center justify-center w-10 h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-xl transition-all border-4 border-white hover:scale-105 hover:rotate-90 group"
        aria-label="Close"
      >
        <X size={20} strokeWidth={2.5} className="group-hover:text-red-400 transition-colors" />
      </button>
      
      {banner.imageUrl ? (
        <div className="relative w-full max-h-[85vh] overflow-hidden rounded-xl flex items-center justify-center bg-slate-50 outline outline-1 outline-slate-200">
          <img src={banner.imageUrl} alt={banner.title} className="w-full h-auto max-h-[85vh] object-contain transition-transform duration-700 hover:scale-[1.01]" />
          <div className="absolute inset-0 rounded-xl shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] pointer-events-none" />
        </div>
      ) : (
        <div className="relative p-12 text-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl text-white shadow-inner outline outline-1 outline-indigo-500/30 overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
             <div className="absolute -top-24 -left-24 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
             <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse" style={{ animationDuration: '5s' }}></div>
           </div>
           
           <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight drop-shadow-md relative z-10">{banner.title}</h2>
           <p className="text-blue-100 text-lg md:text-xl font-medium drop-shadow-sm relative z-10">Click to learn more about this offer.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-300">
      {banner.linkUrl ? (
        <Link href={banner.linkUrl} className="relative max-w-3xl w-full flex justify-center" onClick={() => sessionStorage.setItem("closedPromoBanner", banner.id)}>
          {content}
        </Link>
      ) : (
        <div className="relative max-w-3xl w-full flex justify-center">
          {content}
        </div>
      )}
    </div>
  );
}
