import Link from "next/link";

const features = [
  {
    icon: "menu_book",
    iconColor: "text-blue-600 dark:text-blue-400",
    title: "Exam Directory",
    desc: "Detailed breakdown of state-wise and university-specific LEET exams.",
    href: "/exams",
    cta: "Explore Exams",
  },
  {
    icon: "description",
    iconColor: "text-orange-600 dark:text-orange-400",
    title: "Papers",
    desc: "Curated archive of previous year question papers with solution keys.",
    href: "/papers",
    cta: "Download Papers",
  },
  {
    icon: "notifications_active",
    iconColor: "text-teal-600 dark:text-teal-400",
    title: "Notifications",
    desc: "Real-time alerts for application deadlines, admit cards, and results.",
    href: "/notifications",
    cta: "View Updates",
  },
  {
    icon: "groups",
    iconColor: "text-purple-600 dark:text-purple-400",
    title: "Counselling",
    desc: "Expert guidance through the complex seat allocation and admission process.",
    href: "/counselling",
    cta: "Get Guidance",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-xxl bg-slate-100/50 dark:bg-slate-900/50 px-margin-mobile md:px-margin-desktop border-y border-slate-200 dark:border-slate-800 transition-colors duration-300" aria-labelledby="features-heading">
      <div className="max-w-container-max mx-auto">
        <div className="text-center mb-xl max-w-2xl mx-auto">
          <h2 id="features-heading" className="text-headline-lg-mobile md:text-headline-lg font-headline-lg-mobile md:font-headline-lg text-slate-900 dark:text-white mb-sm transition-colors duration-300">
            Comprehensive Academic Toolkit
          </h2>
          <p className="text-body-md font-body-md text-slate-650 dark:text-slate-400 transition-colors duration-300">
            Everything you need to systematically prepare, execute, and succeed in your BTech lateral entry exams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group bg-white dark:bg-slate-800 rounded-2xl p-lg border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 hover:shadow-md dark:hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center mb-md group-hover:scale-110 transition-transform duration-300 transition-colors duration-300">
                <span
                  className={`material-symbols-outlined ${feature.iconColor}`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {feature.icon}
                </span>
              </div>
              <h3 className="text-headline-md font-headline-md text-slate-900 dark:text-white mb-xs transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-body-md font-body-md text-slate-600 dark:text-slate-400 mb-md transition-colors duration-300">
                {feature.desc}
              </p>
              <Link
                href={feature.href}
                className="text-label-md font-label-md text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400 inline-flex items-center gap-1"
                aria-label={feature.cta}
              >
                {feature.cta}
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
