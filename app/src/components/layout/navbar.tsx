"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  FileText,
  Bell,
  Building2,
  Library,
  PenSquare,
  ClipboardList,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  LayoutDashboard,
  GraduationCap,
  BarChart3,
  Book,
  Search,
} from "lucide-react";

const navLinks = [
  { href: "/exams", label: "Exams", icon: BookOpen },
  { href: "/papers", label: "Papers", icon: FileText },
  { href: "/counselling", label: "Counselling", icon: GraduationCap },
  { href: "/colleges", label: "Colleges", icon: Building2 },
  { href: "/resources", label: "Resources", icon: Library },
  { href: "/blog", label: "Blog", icon: PenSquare },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const isHome = pathname === "/";

  return (
    <header
      className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight" aria-label="BTech LEET Home">
            <Image src="/logo.png" alt="BTech LEET Logo" width={32} height={32} className="rounded-xl object-cover shadow-sm" priority />
            <span>BTech <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">LEET</span></span>
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors duration-200 relative py-1",
                    pathname.startsWith(link.href)
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                  aria-current={pathname.startsWith(link.href) ? "page" : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Toggle Theme"
              suppressHydrationWarning
            >
              {mounted && theme === "dark" ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>

            {/* Search icon */}
            <Link
              href="/exams"
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Search exams"
            >
              <Search size={18} />
            </Link>

            {/* Auth */}
            {!loading && (
              <>
                {user ? (
                  <div className="relative hidden lg:block">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      aria-expanded={userMenuOpen}
                      aria-haspopup="true"
                    >
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs font-semibold">
                          {user.name[0]?.toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
                        {user.name}
                      </span>
                      <ChevronDown size={14} className="text-slate-400" />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 z-50">
                        {user.role === "ADMIN" && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                          >
                            <LayoutDashboard size={15} /> Admin Dashboard
                          </Link>
                        )}
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                        >
                          <User size={15} /> My Dashboard
                        </Link>
                        <Link
                          href="/dashboard/performance"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                        >
                          <BarChart3 size={15} /> My Performance
                        </Link>
                        <div className="border-t border-slate-200 dark:border-slate-700 my-1" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-950/30 w-full text-left"
                        >
                          <LogOut size={15} /> Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="hidden lg:flex items-center gap-4">
                    <Link
                      href="/auth/login"
                      className="text-label-md font-label-md text-slate-700 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/register"
                      className="text-sm font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2 rounded-full hover:bg-slate-800 dark:hover:bg-slate-100 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-1 lg:hidden">
            {/* Mobile Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 p-2 rounded-xl"
              title="Toggle Theme"
              suppressHydrationWarning
            >
              {mounted && theme === "dark" ? (
                <Sun size={20} />
              ) : (
                <Moon size={20} />
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-slate-900 dark:text-white p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileOpen}
              suppressHydrationWarning
            >
              {mobileOpen ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer Menu */}
      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 z-50 w-[300px] max-w-[85vw] h-screen h-[100dvh] bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0 visible" : "translate-x-full invisible"
        )}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <Link 
            href="/" 
            className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2" 
            onClick={() => setMobileOpen(false)}
          >
            <Image src="/logo.png" alt="BTech LEET Logo" width={28} height={28} className="rounded-md object-cover" />
            BTech LEET
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="text-slate-500 dark:text-slate-400 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close menu"
            suppressHydrationWarning
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
          {/* User Profile Info */}
          {user && (
            <div className="px-3 py-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-800">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-orange-650 flex items-center justify-center text-white font-bold shadow-sm">
                  {user.name[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-950 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
              {user.role === "ADMIN" && (
                <span className="text-[10px] font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-full border border-orange-200/40 dark:border-orange-900/30">
                  Admin
                </span>
              )}
            </div>
          )}

          {/* Nav Links */}
          <nav className="space-y-1.5" aria-label="Mobile navigation">
            <span className="block px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Explore</span>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "text-orange-650 dark:text-orange-450 bg-orange-50 dark:bg-orange-950/20 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  )}
                >
                  <Icon size={18} className={isActive ? "text-orange-655" : "text-slate-500"} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User Account / Dashboard Links */}
          {user && (
            <nav className="space-y-1.5 border-t border-slate-100 dark:border-slate-800/80 pt-6">
              <span className="block px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Account</span>
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl"
                >
                  <LayoutDashboard size={18} className="text-slate-500" />
                  Admin Dashboard
                </Link>
              )}
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl"
              >
                <User size={18} className="text-slate-500" />
                My Dashboard
              </Link>
              <Link
                href="/dashboard/performance"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl"
              >
                <BarChart3 size={18} className="text-slate-500" />
                My Performance
              </Link>
            </nav>
          )}
        </div>

        {/* Drawer Footer / Theme & Sign out */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 space-y-5 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Theme</span>
            <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
              <button
                onClick={() => setTheme("light")}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                  mounted && theme === "light"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Sun size={14} /> Light
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                  mounted && theme === "dark"
                    ? "bg-slate-950 text-white shadow-sm border border-slate-800"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Moon size={14} /> Dark
              </button>
            </div>
          </div>

          {user ? (
            <button
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 rounded-xl text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors"
            >
              <LogOut size={16} /> Sign Out
            </button>
          ) : (
            <div className="space-y-2">
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center py-2.5 text-sm font-medium border border-slate-250 dark:border-slate-700 text-slate-700 dark:text-slate-350 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center py-2.5 text-sm font-semibold bg-orange-700 hover:bg-orange-600 text-white rounded-xl transition-colors shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
