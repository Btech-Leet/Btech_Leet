import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  Preparation: [
    { href: "/exams", label: "Exams" },
    { href: "/papers", label: "Papers" },
    { href: "/mock-tests", label: "Mock Tests" },
    { href: "/books", label: "Books" },
    { href: "/leet-rank-predictor", label: "Rank Predictor" },
  ],
  Information: [
    { href: "/notifications", label: "Notifications" },
    { href: "/counselling", label: "Counselling" },
    { href: "/colleges", label: "Colleges" },
    { href: "/resources", label: "Resources" },
    { href: "/leet-counselling-guide", label: "Counselling Guide" },
  ],
  Connect: [
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact Us" },
    { href: "/toppers", label: "Toppers" },
    { href: "/experts", label: "Experts" },
    { href: "/authors", label: "Authors" },
  ],
  "Quick Links": [
    { href: "/faq", label: "FAQ" },
    { href: "/what-is-leet", label: "What is LEET?" },
    { href: "/diploma-to-btech", label: "Diploma to BTech" },
  ],
};

export function Footer() {
  return (
    <footer
      className="relative overflow-hidden bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300"
      aria-label="Site footer"
    >
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-orange-500/5 dark:bg-orange-500/3 rounded-full blur-[120px] -z-10" />

      <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-16">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-16">
          {/* Brand */}
          <div className="w-full lg:max-w-[380px]">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-slate-900 dark:text-white"
            >
              <Image src="/logo.png" alt="BTech LEET Logo" width={36} height={36} className="rounded-xl object-cover shadow-sm" />
              <span className="text-2xl font-black tracking-tight">
                BTech <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">LEET</span>
              </span>
            </Link>

            <p className="mt-6 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Empowering Diploma Engineers to achieve academic excellence and
              seamlessly transition into premier BTech institutions.
            </p>
          </div>

          {/* Links */}
          <div className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
              {Object.entries(footerLinks).map(([section, links]) => (
                <div key={section}>
                  <span className="block text-slate-900 dark:text-white text-[11px] font-black uppercase tracking-[0.2em] mb-5">
                    {section}
                  </span>

                  <ul className="space-y-3">
                    {links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-sm text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} BTech LEET. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 justify-center md:justify-end">
            {[
              { href: "/legal/privacy-policy", label: "Privacy Policy" },
              { href: "/legal/terms-and-conditions", label: "Terms" },
              { href: "/legal/disclaimer", label: "Disclaimer" },
              { href: "/legal/editorial-policy", label: "Editorial" },
              { href: "/legal/refund-policy", label: "Refund" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
