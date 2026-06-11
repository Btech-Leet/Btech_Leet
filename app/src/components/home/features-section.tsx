import { BookOpen, FileText, Bell, GraduationCap, Building2, Library, PenSquare, ClipboardList } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "LEET Exam Directory",
    desc: "State-wise and central LEET exam details including eligibility, syllabus, important dates, and official links.",
    color: "blue",
  },
  {
    icon: FileText,
    title: "Previous Year Papers",
    desc: "Download previous year question papers with solutions for better exam preparation.",
    color: "violet",
  },
  {
    icon: Bell,
    title: "Real-time Notifications",
    desc: "Never miss important exam notifications, application dates, or result announcements.",
    color: "amber",
  },
  {
    icon: GraduationCap,
    title: "Counselling Info",
    desc: "Complete counselling schedule, document requirements, seat allotment details, and helpline numbers.",
    color: "green",
  },
  {
    icon: Building2,
    title: "College Directory",
    desc: "Explore participating colleges with branches, fees, intake, accreditation, and contact details.",
    color: "pink",
  },
  {
    icon: Library,
    title: "Study Resources",
    desc: "Branch-wise study materials, notes, and reference books organized by semester.",
    color: "orange",
  },
  {
    icon: PenSquare,
    title: "Expert Blog",
    desc: "Expert tips, preparation strategies, and latest updates on LEET exams written by toppers.",
    color: "teal",
  },
  {
    icon: ClipboardList,
    title: "Mock Tests",
    desc: "Practice with real exam pattern mock tests and get instant results with detailed analysis.",
    color: "indigo",
  },
];

const colorMap: Record<string, string> = {
  blue: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
  violet: "bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400",
  amber: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400",
  green: "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400",
  pink: "bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400",
  orange: "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400",
  teal: "bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400",
  indigo: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400",
};

export function FeaturesSection() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900/50" aria-labelledby="features-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 id="features-heading" className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need to Crack LEET
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            A complete ecosystem built for diploma students targeting BTech lateral entry admission.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-md transition-all duration-200 group"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${colorMap[feature.color]}`}>
                  <Icon size={22} aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-base">{feature.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
