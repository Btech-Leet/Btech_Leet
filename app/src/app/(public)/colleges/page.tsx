import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Globe, Star, Search, Filter } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "BTech Colleges with Lateral Entry – College Directory",
  description: "Browse colleges offering BTech Lateral Entry admission across India with branches, fees, intake, and accreditation details.",
};

async function getColleges(params: Record<string, string>) {
  const where: Record<string, unknown> = { active: true };
  if (params.stateId) where.stateId = params.stateId;
  if (params.q) where.name = { contains: params.q, mode: "insensitive" };

  try {
    return await Promise.all([
      prisma.college.findMany({
        where,
        include: {
          state: { select: { name: true } },
          branches: { include: { branch: { select: { name: true, code: true } } } },
        },
        orderBy: [{ featured: "desc" }, { ranking: "asc" }, { name: "asc" }],
      }),
      prisma.state.findMany({ orderBy: { name: "asc" } }),
    ]);
  } catch (err) {
    console.error("Failed to load colleges:", err);
    return [[], []];
  }
}

export default async function CollegesPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const [colleges, states] = await getColleges(params);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">College Directory</h1>
        <p className="text-gray-500 dark:text-gray-400">Engineering colleges offering BTech lateral entry admission</p>
      </div>

      <form className="flex flex-col sm:flex-row gap-3 mb-8" method="GET">
        <div className="flex flex-1 items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-xl px-4 bg-white dark:bg-gray-900">
          <Search size={15} className="text-gray-400" aria-hidden="true" />
          <input name="q" defaultValue={params.q} placeholder="Search colleges..." className="flex-1 py-2.5 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none" aria-label="Search colleges" />
        </div>
        <select name="stateId" defaultValue={params.stateId || ""} className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none" aria-label="Filter by state">
          <option value="">All States</option>
          {states.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2" aria-label="Apply filters">
          <Filter size={14} aria-hidden="true" /> Filter
        </button>
      </form>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{colleges.length} college{colleges.length !== 1 ? "s" : ""} found</p>

      {colleges.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Building2 size={40} className="mx-auto mb-4 opacity-30" aria-hidden="true" />
          <p className="text-lg font-medium">No colleges found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {colleges.map((college: any) => (
            <Link key={college.id} href={`/colleges/${college.slug}`} className="group flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all" aria-label={`View ${college.name}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0">
                  <Building2 size={20} className="text-blue-600 dark:text-blue-400" aria-hidden="true" />
                </div>
                {college.featured && <Star size={16} className="text-yellow-500 fill-yellow-500" aria-label="Featured" />}
              </div>

              <h2 className="font-bold text-gray-900 dark:text-white text-base mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {college.name}
              </h2>

              <div className="space-y-1 mb-3">
                {college.state && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <MapPin size={11} aria-hidden="true" /> {college.state.name}{college.city ? `, ${college.city}` : ""}
                  </div>
                )}
                {college.affiliation && (
                  <p className="text-xs text-gray-400">{college.affiliation}</p>
                )}
              </div>

              {college.branches.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {college.branches.slice(0, 3).map((cb: any) => (
                    <span key={cb.branchId} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                      {cb.branch.code}
                    </span>
                  ))}
                  {college.branches.length > 3 && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full">+{college.branches.length - 3}</span>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
