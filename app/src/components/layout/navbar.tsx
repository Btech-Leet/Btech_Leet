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
  GitBranch,
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
} from "lucide-react";

const navLinks = [
  { href: "/exams", label: "Exams", icon: BookOpen },
  { href: "/papers", label: "Papers", icon: FileText },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/counselling", label: "Counselling", icon: GraduationCap },
  { href: "/colleges", label: "Colleges", icon: Building2 },
  { href: "/resources", label: "Resources", icon: Library },
  { href: "/blog", label: "Blog", icon: PenSquare },
  { href: "/mock-tests", label: "Mock Tests", icon: ClipboardList },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
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

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
        scrolled
          ? "bg-white/90 dark:bg-gray-950/90 backdrop-blur-lg border-b border-gray-200/80 dark:border-gray-800/80 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0" aria-label="BTech LEET Home">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center overflow-hidden border border-blue-500/20">
              <img src="/favicon.webp" alt="Logo" className="w-5 h-5 object-contain" />
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white font-display">
              BTech <span className="text-blue-600">LEET</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname.startsWith(link.href)
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60"
                )}
                aria-current={pathname.startsWith(link.href) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Auth */}
            {!loading && (
              <>
                {user ? (
                  <div className="relative hidden lg:block">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      aria-expanded={userMenuOpen}
                      aria-haspopup="true"
                    >
                      <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                        {user.name[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
                        {user.name}
                      </span>
                      <ChevronDown size={14} className="text-gray-400" />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 z-50">
                        {user.role === "ADMIN" && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <LayoutDashboard size={15} /> Admin Dashboard
                          </Link>
                        )}
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <User size={15} /> My Dashboard
                        </Link>
                        <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 w-full text-left"
                        >
                          <LogOut size={15} /> Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="hidden lg:flex items-center gap-2">
                    <Link
                      href="/auth/login"
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/register"
                      className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 fade-in">
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
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Auth */}
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
            {user ? (
              <div className="space-y-1">
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                  >
                    <LayoutDashboard size={18} /> Admin Dashboard
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                >
                  <User size={18} /> My Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg w-full"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/auth/login" className="flex-1 py-2.5 text-center text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Sign In
                </Link>
                <Link href="/auth/register" className="flex-1 py-2.5 text-center text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
