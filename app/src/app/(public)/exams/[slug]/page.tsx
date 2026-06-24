import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Globe, MapPin, Phone, Calendar, BookOpen, FileText, Bell } from "lucide-react";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

import { mergeSeoMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  let fallback: Metadata = { title: "Exam Details" };
  try {
    const exam = await prisma.exam.findFirst({
      where: { OR: [{ slug }, { id: slug }], active: true },
      include: { state: { select: { name: true } } },
    });

    if (exam) {
      fallback = {
        title: `${exam.name} – ${exam.fullName}`,
        description: `Complete details about ${exam.fullName} including eligibility, syllabus, important dates, application fee, and previous year papers.`,
        openGraph: {
          title: exam.name,
          description: exam.fullName,
        },
      };
    } else {
      fallback = { title: "Exam Not Found" };
    }
  } catch (err) {
    console.error("Failed to load metadata for exam:", err);
  }
  
  return mergeSeoMetadata(`/exams/${slug}`, fallback);
}

export default async function ExamDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  let exam = null;
  try {
    exam = await prisma.exam.findFirst({
      where: { OR: [{ slug }, { id: slug }], active: true },
      include: {
        state: true,
        papers: { where: { active: true }, orderBy: [{ year: "desc" }, { createdAt: "desc" }], take: 10 },
        notifications: {
          where: { published: true },
          orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
          take: 5,
        },
        counselling: { where: { active: true } },
      },
    });
  } catch (err) {
    console.error("Failed to fetch exam details:", err);
  }

  if (!exam) notFound();

  const dates = exam.importantDates as Record<string, string> | null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link href="/exams" className="hover:text-blue-600">Exams</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-200 font-medium">{exam.name}</span>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-950/30 dark:to-violet-950/30 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-6 sm:p-8 mb-8">
        <div className="flex flex-wrap items-start gap-3 mb-4">
          <Badge variant={exam.type === "STATE" ? "default" : "secondary"}>{exam.type} LEET</Badge>
          {exam.featured && <Badge variant="warning">Featured</Badge>}
          {exam.state && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <MapPin size={14} aria-hidden="true" />
              {exam.state.name}
            </div>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">{exam.name}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">{exam.fullName}</p>

        <div className="flex flex-wrap gap-4">
          {exam.officialWebsite && (
            <a
              href={exam.officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              aria-label={`Visit official website for ${exam.name}`}
            >
              <Globe size={15} aria-hidden="true" />
              Official Website
            </a>
          )}
          <Link
            href={`/papers?examId=${exam.id}`}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            aria-label={`View papers for ${exam.name}`}
          >
            <FileText size={15} aria-hidden="true" />
            View Papers
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {exam.description && (
            <section aria-labelledby="about-heading" className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <h2 id="about-heading" className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <BookOpen size={18} className="text-blue-600" aria-hidden="true" />
                About {exam.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">{exam.description}</p>
            </section>
          )}

          {/* Eligibility */}
          {exam.eligibility && (
            <section aria-labelledby="eligibility-heading" className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <h2 id="eligibility-heading" className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                Eligibility Criteria
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">{exam.eligibility}</p>
            </section>
          )}

          {/* Important Dates */}
          {dates && Object.keys(dates).length > 0 && (
            <section aria-labelledby="dates-heading" className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <h2 id="dates-heading" className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-blue-600" aria-hidden="true" />
                Important Dates
              </h2>
              <div className="space-y-2">
                {Object.entries(dates).map(([event, date]) => (
                  <div key={event} className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{event}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{date}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Notifications */}
          {exam.notifications.length > 0 && (
            <section aria-labelledby="notifs-heading" className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <h2 id="notifs-heading" className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Bell size={18} className="text-blue-600" aria-hidden="true" />
                Notifications
              </h2>
              <div className="space-y-3">
                {exam.notifications.map((n: any) => (
                  <Link
                    key={n.id}
                    href={`/notifications/${n.id}`}
                    className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-gray-100 dark:border-gray-700"
                    aria-label={n.title}
                  >
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{n.title}</p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">{n.content}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* Quick Info */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Quick Info</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400">Exam Type</dt>
                <dd className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{exam.type} Lateral Entry</dd>
              </div>
              {exam.state && (
                <div>
                  <dt className="text-xs text-gray-500 dark:text-gray-400">State</dt>
                  <dd className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{exam.state.name}</dd>
                </div>
              )}
              {exam.applicationFee && (
                <div>
                  <dt className="text-xs text-gray-500 dark:text-gray-400">Application Fee</dt>
                  <dd className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{exam.applicationFee}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Papers */}
          {exam.papers.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText size={16} className="text-blue-600" aria-hidden="true" />
                Previous Papers
              </h2>
              <div className="space-y-2">
                {exam.papers.slice(0, 5).map((paper: any) => (
                  <a
                    key={paper.id}
                    href={paper.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                    aria-label={`Download ${paper.title}`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate group-hover:text-blue-600">
                        {paper.title}
                      </p>
                      {paper.year && <p className="text-xs text-gray-400">{paper.year}</p>}
                    </div>
                    <FileText size={14} className="text-gray-400 flex-shrink-0 ml-2" aria-hidden="true" />
                  </a>
                ))}
              </div>
              {exam.papers.length > 5 && (
                <Link href={`/papers?examId=${exam.id}`} className="block mt-3 text-center text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  View all {exam.papers.length} papers →
                </Link>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
