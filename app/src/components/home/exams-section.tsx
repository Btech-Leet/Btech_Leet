import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowRight, MapPin, Globe } from "lucide-react";

async function getExams() {
  try {
    return prisma.exam.findMany({
      where: { active: true, featured: true },
      include: { state: { select: { name: true } } },
      orderBy: { name: "asc" },
      take: 8,
    });
  } catch {
    return [];
  }
}

export async function ExamsSection() {
  const exams = await getExams();

  return (
    <section className="py-20 bg-white dark:bg-gray-950" aria-labelledby="exams-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <h2 id="exams-heading" className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Featured LEET Exams
            </h2>
            <p className="text-gray-500 dark:text-gray-400">Most popular state and central lateral entry exams</p>
          </div>
          <Link
            href="/exams"
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:gap-3 transition-all text-sm"
            aria-label="View all exams"
          >
            View All Exams <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        {exams.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium">No exams added yet</p>
            <p className="text-sm mt-1">Check back soon for LEET exam listings</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {exams.map((exam: any) => (
              <Link
                key={exam.id}
                href={`/exams/${exam.slug}`}
                className="group p-5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200"
                aria-label={`View ${exam.name} details`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    exam.type === "STATE"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                      : exam.type === "CENTRAL"
                      ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  }`}>
                    {exam.type}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {exam.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{exam.fullName}</p>
                {exam.state && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <MapPin size={12} aria-hidden="true" />
                    {exam.state.name}
                  </div>
                )}
                {exam.officialWebsite && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                    <Globe size={12} aria-hidden="true" />
                    <span className="truncate">{new URL(exam.officialWebsite).hostname}</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
