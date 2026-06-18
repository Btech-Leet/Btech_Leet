"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300"
    >
      <div className="max-w-container-max mx-auto px-gutter">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="text-headline-md font-headline-md font-bold text-slate-900 dark:text-white flex items-center gap-2" aria-label="BTech LEET Home">
            <span className="material-symbols-outlined text-orange-600" style={{ fontVariationSettings: "'FILL' 1" }}>
              school
            </span>
            BTech LEET
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "pb-1 transition-colors duration-200 text-label-md font-label-md",
                    pathname.startsWith(link.href)
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
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
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 p-2"
              title="Toggle Theme"
              suppressHydrationWarning
            >
              {mounted && theme === "dark" ? (
                <span className="material-symbols-outlined">light_mode</span>
              ) : (
                <span className="material-symbols-outlined">dark_mode</span>
              )}
            </button>

            {/* Search icon */}
            <Link
              href="/exams"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 p-2"
              aria-label="Search exams"
            >
              <span className="material-symbols-outlined">search</span>
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
                      <div className="w-7 h-7 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs font-semibold">
                        {user.name[0].toUpperCase()}
                      </div>
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
                      className="text-label-md font-label-md bg-orange-700 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors duration-200 shadow-sm"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-slate-900 dark:text-white p-2"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <span className="material-symbols-outlined">close</span>
            ) : (
              <span className="material-symbols-outlined">menu</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 fade-in">
          <nav className="px-4 py-3 space-y-1" aria-label="Mobile navigation">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    pathname.startsWith(link.href)
                      ? "text-orange-600 dark:text-orange-400 bg-slate-100 dark:bg-slate-800"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Auth */}
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800">
            {user ? (
              <div className="space-y-1">
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  >
                    <LayoutDashboard size={18} /> Admin Dashboard
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <User size={18} /> My Dashboard
                </Link>
                <Link
                  href="/dashboard/performance"
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <BarChart3 size={18} /> My Performance
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-950/30 rounded-lg w-full"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/auth/login" className="flex-1 py-2.5 text-center text-sm font-medium border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  Sign In
                </Link>
                <Link href="/auth/register" className="flex-1 py-2.5 text-center text-sm font-semibold bg-orange-700 text-white rounded-lg hover:bg-orange-600 transition-colors">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
