import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Users, Award, GraduationCap, Briefcase } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Expert Faculty & Mentors | BTech LEET",
  description: "Meet the experienced faculty members, subject experts, and mentors who guide students for B.Tech Lateral Entry Examinations across India.",
};

export default async function ExpertsPage() {
  const experts = await prisma.expert.findMany({
    where: { active: true },
    orderBy: [
      { order: "asc" },
      { createdAt: "desc" },
    ],
  });

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-20 bg-gradient-to-b from-violet-50/50 to-transparent dark:from-violet-950/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-bold border border-violet-500/20">
            <Award size={14} className="text-violet-500" /> Expert Faculty
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Meet Our Expert Mentors
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-500 dark:text-gray-400">
            Learn from experienced educators and industry professionals who have helped thousands of students crack B.Tech Lateral Entry Exams.
          </p>
        </div>
      </section>

      {/* Experts Grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {experts.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center text-gray-500 shadow-sm max-w-lg mx-auto">
            <Users className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={48} />
            <h3 className="font-bold text-gray-800 dark:text-gray-200">Expert Profiles Coming Soon</h3>
            <p className="text-xs text-gray-500 mt-1">We are currently onboarding our expert faculty. Stay tuned!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experts.map((expert) => (
              <div
                key={expert.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-300 group"
              >
                <div className="p-6 sm:p-7 space-y-5">
                  {/* Avatar + Name */}
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-20 h-20 rounded-full bg-violet-50 dark:bg-violet-950/40 border-2 border-violet-100 dark:border-violet-900/50 overflow-hidden flex-shrink-0 flex items-center justify-center relative shadow-inner group-hover:scale-105 transition-transform duration-500">
                      {expert.photo ? (
                        <img
                          src={expert.photo}
                          alt={expert.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="text-violet-500" size={32} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                        {expert.name}
                      </h3>
                      {expert.designation && (
                        <p className="text-xs text-violet-600 dark:text-violet-400 font-semibold mt-0.5">
                          {expert.designation}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Qualification */}
                  {expert.qualification && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                      <GraduationCap size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                        {expert.qualification}
                      </p>
                    </div>
                  )}

                  {/* Experience */}
                  {expert.experience && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                      <Briefcase size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                        {expert.experience}
                      </p>
                    </div>
                  )}

                  {/* Description */}
                  {expert.description && (
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed text-center">
                      {expert.description}
                    </p>
                  )}
                </div>

                {/* Footer with LinkedIn */}
                {expert.linkedinUrl && (
                  <div className="px-6 py-3.5 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800/80 flex justify-center">
                    <a
                      href={expert.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg> View LinkedIn Profile
                    </a>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
