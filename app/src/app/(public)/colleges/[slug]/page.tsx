import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Globe, MapPin, Building2, Calendar, Award, Trophy, Bookmark, GraduationCap } from "lucide-react";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

import { mergeSeoMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  let fallback: Metadata = { title: "College Details" };
  try {
    const college = await prisma.college.findFirst({
      where: { OR: [{ slug }, { id: slug }], active: true },
      include: { state: { select: { name: true } } },
    });

    if (college) {
      fallback = {
        title: `${college.name} – BTech Admission & Lateral Entry Details`,
        description: `Complete details about ${college.name} in ${college.city}, ${college.state?.name || ""}. Check BTech lateral entry branches, intake, fees structure, ranking and accreditation.`,
        openGraph: {
          title: college.name,
          description: college.description || college.name,
        },
      };
    } else {
      fallback = { title: "College Not Found" };
    }
  } catch (err) {
    console.error("Failed to load metadata for college:", err);
  }
  
  return mergeSeoMetadata(`/colleges/${slug}`, fallback);
}

export default async function CollegeDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  let college = null;

  try {
    college = await prisma.college.findFirst({
      where: { OR: [{ slug }, { id: slug }], active: true },
      include: {
        state: true,
        branches: {
          include: {
            branch: true,
          },
        },
      },
    });
  } catch (err) {
    console.error("Failed to fetch college details:", err);
  }

  if (!college) notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link href="/colleges" className="hover:text-blue-600">Colleges</Link>
        <span>/</span>
        <span className="text-gray-950 dark:text-gray-200 font-medium truncate max-w-[200px] sm:max-w-xs">{college.name}</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-950/30 dark:to-violet-950/30 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-6 sm:p-8 mb-8">
        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          <Badge variant="default">{college.type || "College"}</Badge>
          {college.featured && <Badge variant="warning">Featured</Badge>}
          {college.ranking && (
            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 px-2 py-0.5 rounded">
              <Trophy size={12} />
              Rank #{college.ranking}
            </div>
          )}
          {college.state && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <MapPin size={14} aria-hidden="true" />
              {college.city && `${college.city}, `}{college.state.name}
            </div>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">{college.name}</h1>
        {college.affiliation && (
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 flex items-center gap-1.5">
            <Bookmark size={15} className="text-gray-400" />
            Affiliated to: {college.affiliation}
          </p>
        )}

        <div className="flex flex-wrap gap-4">
          {college.website && (
            <a
              href={college.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              aria-label={`Visit official website for ${college.name}`}
            >
              <Globe size={15} aria-hidden="true" />
              Visit Website
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* About / Description */}
          {college.description && (
            <section aria-labelledby="about-heading" className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <h2 id="about-heading" className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Building2 size={18} className="text-blue-600" aria-hidden="true" />
                About College
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">{college.description}</p>
            </section>
          )}

          {/* Branches / Programs Offered */}
          <section aria-labelledby="branches-heading" className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <h2 id="branches-heading" className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <GraduationCap size={18} className="text-blue-600" aria-hidden="true" />
              Branches & Intake Details
            </h2>

            {college.branches.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No branch details available for this college.
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-150 dark:border-gray-800 rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-950 text-gray-500 dark:text-gray-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Branch Name</th>
                      <th className="px-4 py-3 font-medium">Duration</th>
                      <th className="px-4 py-3 font-medium">Intake/Seats</th>
                      <th className="px-4 py-3 font-medium text-right">Fee (Approx)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                    {college.branches.map((cb: any) => (
                      <tr key={cb.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-gray-900 dark:text-white">{cb.branch.name}</p>
                          <span className="inline-block mt-0.5 text-xs font-mono text-blue-500 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded">
                            {cb.branch.code}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-sm">{cb.duration || "4 Years"}</td>
                        <td className="px-4 py-3.5 text-sm font-medium">{cb.intake || "N/A"}</td>
                        <td className="px-4 py-3.5 text-sm font-semibold text-gray-900 dark:text-white text-right">
                          {cb.fees || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar Info */}
        <aside className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Quick Information</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400">Institution Type</dt>
                <dd className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                  {college.type ? college.type.replace(/_/g, " ") : "N/A"}
                </dd>
              </div>
              {college.established && (
                <div>
                  <dt className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Calendar size={12} /> Established Year
                  </dt>
                  <dd className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{college.established}</dd>
                </div>
              )}
              {college.accreditation && (
                <div>
                  <dt className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Award size={12} /> Accreditation
                  </dt>
                  <dd className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{college.accreditation}</dd>
                </div>
              )}
              {college.state && (
                <div>
                  <dt className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <MapPin size={12} /> Location
                  </dt>
                  <dd className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                    {college.city && `${college.city}, `}{college.state.name}
                  </dd>
                </div>
              )}
              {college.ranking && (
                <div>
                  <dt className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Trophy size={12} /> National Rank
                  </dt>
                  <dd className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">#{college.ranking}</dd>
                </div>
              )}
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
