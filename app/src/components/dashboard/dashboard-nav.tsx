"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  TrendingUp, Award, CreditCard, User, LayoutDashboard, LogOut, ArrowLeft, ClipboardList, BookOpen, FileText, Bell, Menu, X 
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";

interface DashboardNavProps {
  user: {
    name: string;
    email: string;
    avatar: string | null;
    premiumStatus: boolean;
    profileComplete: number;
  };
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const links = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/performance", label: "Performance", icon: TrendingUp },
    { href: "/dashboard/badges", label: "Badges & Trophy", icon: Award },
    { href: "/dashboard/billing", label: "Billing & Invoices", icon: CreditCard },
    { href: "/dashboard/profile", label: "Edit Profile", icon: User },
  ];

  const quickBrowseLinks = [
    { href: "/mock-tests", label: "Mock Tests", icon: ClipboardList },
    { href: "/exams", label: "Exams Directory", icon: BookOpen },
    { href: "/papers", label: "Question Papers", icon: FileText },
    { href: "/notifications", label: "Notifications", icon: Bell },
  ];

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  /* Shared sidebar content (used by both desktop sidebar and mobile drawer) */
  const SidebarContent = () => (
    <>
      {/* User Card */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white text-base font-bold flex-shrink-0 overflow-hidden border border-blue-500/10">
            {user.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user.name[0].toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{user.name}</span>
              {user.premiumStatus && (
                <span className="inline-flex text-[9px] px-1 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold">
                  ★
                </span>
              )}
            </div>
            <p className="text-slate-400 text-xs truncate">{user.email}</p>
          </div>
        </div>

        {/* Profile Progress */}
        <div className="mt-4 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
            <span>Profile Complete</span>
            <span className="text-blue-600 dark:text-blue-400">{user.profileComplete}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${user.profileComplete}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Dashboard
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href, link.exact);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                active 
                  ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              }`}
            >
              <Icon size={16} />
              {link.label}
            </Link>
          );
        })}

        <div className="pt-4 px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-100 dark:border-slate-800/50 mt-4">
          Practice & Browse
        </div>
        {quickBrowseLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all"
            >
              <Icon size={16} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer/Logout Action */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/60 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all"
        >
          <ArrowLeft size={16} />
          Go to Portal Home
        </Link>
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 w-full text-left transition-all"
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* ─── Mobile: Top Bar with hamburger + horizontal nav pills ─── */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-30">
        <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-none">
          {/* Hamburger button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="flex-shrink-0 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu size={18} />
          </button>

          {/* Quick nav pills */}
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href, link.exact);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  active 
                    ? "bg-blue-600 text-white" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <Icon size={12} />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ─── Mobile: Slide-out Drawer ─── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer panel */}
          <aside className="absolute left-0 top-0 h-full w-[280px] max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl flex flex-col animate-slideInLeft">
            {/* Close button */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-sm font-bold text-slate-800 dark:text-white">Dashboard Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}

