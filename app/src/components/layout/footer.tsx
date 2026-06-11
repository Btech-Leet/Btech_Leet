import Link from "next/link";
import { BookOpen, Mail } from "lucide-react";

const footerLinks = {
  Exams: [
    { href: "/exams", label: "All Exams" },
    { href: "/exams?type=STATE", label: "State LEET" },
    { href: "/exams?type=CENTRAL", label: "Central LEET" },
    { href: "/notifications", label: "Notifications" },
  ],
  Resources: [
    { href: "/papers", label: "Previous Year Papers" },
    { href: "/mock-tests", label: "Mock Tests" },
    { href: "/resources", label: "Study Material" },
    { href: "/counselling", label: "Counselling" },
  ],
  Explore: [
    { href: "/colleges", label: "Colleges" },
    { href: "/blog", label: "Blog" },
    { href: "/branches", label: "Branches" },
  ],
  Account: [
    { href: "/auth/register", label: "Get Started" },
    { href: "/auth/login", label: "Sign In" },
    { href: "/dashboard", label: "Dashboard" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 border-t border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Top */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center overflow-hidden border border-blue-500/20">
                <img src="/favicon.webp" alt="Logo" className="w-5 h-5 object-contain" />
              </div>
              <span className="font-bold text-lg text-white">BTech LEET</span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-500 mb-4">
              India&apos;s comprehensive platform for BTech Lateral Entry Exam (LEET) — helping diploma students succeed.
            </p>
            <div className="flex gap-3">
              <a href="mailto:contact@btechleet.com" className="p-2 rounded-lg hover:bg-gray-800 transition-colors" aria-label="Email">
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-sm font-semibold text-gray-200 mb-3">{section}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} BTech LEET. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-gray-600">
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
