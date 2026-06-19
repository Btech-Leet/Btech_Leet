import Link from "next/link";

const footerLinks = {
  Preparation: [
    { href: "/exams", label: "Exams" },
    { href: "/papers", label: "Papers" },
    { href: "/mock-tests", label: "Mock Tests" },
    { href: "/books", label: "Books" },
  ],
  Information: [
    { href: "/notifications", label: "Notifications" },
    { href: "/counselling", label: "Counselling" },
    { href: "/colleges", label: "Colleges" },
    { href: "/resources", label: "Resources" },
  ],
  Connect: [
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact Us" },
    { href: "/toppers", label: "Toppers" },
    { href: "/experts", label: "Experts" },
  ],
};

export function Footer() {
  return (
    <footer
      className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300"
      aria-label="Site footer"
    >
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-16">
          {/* Brand */}
          <div className="w-full lg:max-w-[420px]">
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-slate-900 dark:text-white"
            >
              <img src="/logo.jpeg" alt="BTech LEET Logo" className="w-9 h-9 rounded-lg object-cover" />

              <span className="text-3xl font-bold">
                BTech LEET
              </span>
            </Link>

            <p className="mt-8 text-slate-600 dark:text-slate-400 text-lg leading-8">
              Empowering Diploma Engineers to achieve academic excellence and
              seamlessly transition into premier BTech institutions.
            </p>
          </div>

          {/* Links */}
          <div className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
              {Object.entries(footerLinks).map(([section, links]) => (
                <div key={section}>
                  <h4 className="text-slate-900 dark:text-white text-sm font-bold uppercase tracking-[0.25em] mb-6">
                    {section}
                  </h4>

                  <ul className="space-y-4">
                    {links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="
                            text-slate-650
                            dark:text-slate-400
                            hover:text-orange-600
                            dark:hover:text-orange-400
                            transition-colors
                            duration-200
                          "
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
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} BTech LEET. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 justify-center md:justify-end">
            <Link
              href="/legal/privacy-policy"
              className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>

            <Link
              href="/legal/terms-and-conditions"
              className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Terms & Conditions
            </Link>

            <Link
              href="/legal/disclaimer"
              className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Disclaimer
            </Link>

            <Link
              href="/legal/editorial-policy"
              className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Editorial Policy
            </Link>

            <Link
              href="/legal/refund-policy"
              className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
