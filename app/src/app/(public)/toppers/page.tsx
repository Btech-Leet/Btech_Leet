import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Trophy, Award, School, MapPin } from "lucide-react";
import Image from "next/image";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Toppers Success Stories | BTech LEET",
  description: "Read success stories and preparation strategies from toppers of Haryana LEET, Punjab LEET, and other lateral entry engineering examinations.",
};

export default async function ToppersPage() {
  const toppers = await prisma.topper.findMany({
    where: { active: true },
    orderBy: [
      { year: "desc" },
      { order: "asc" }
    ],
  });

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-24">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 sm:py-20 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-500/20">
              <Trophy size={14} className="text-amber-500 animate-bounce" /> Hall of Fame
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Meet Our LEET Toppers
            </h1>
            <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-500 dark:text-gray-400">
              Be inspired by the preparation strategies, dedication, and success stories of students who cracked B.Tech Lateral Entry Exams and secured top engineering colleges.
            </p>
          </div>
        </section>

        {/* Toppers Cards Grid */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          {toppers.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center text-gray-500 shadow-sm max-w-lg mx-auto">
              <Award className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={48} />
              <h3 className="font-bold text-gray-800 dark:text-gray-200">Stories Coming Soon</h3>
              <p className="text-xs text-gray-500 mt-1">We are currently gathering success stories. Stay tuned!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {toppers.map((topper: any) => (
                <div
                  key={topper.id}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <div className="p-6 sm:p-8 space-y-6">
                    {/* Header */}
                    <div className="flex gap-4 items-start sm:items-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 overflow-hidden flex-shrink-0 flex items-center justify-center relative shadow-inner">
                        {topper.image ? (
                          <img
                            src={topper.image}
                            alt={topper.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <Trophy className="text-amber-500" size={32} />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg sm:text-xl">
                            {topper.name}
                          </h3>
                          {topper.rank && (
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-xs font-bold border border-amber-500/20">
                              Rank {topper.rank}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <School size={13} className="text-gray-400" /> YMCA Faridabad
                          </span>
                          <span className="hidden sm:inline text-gray-300 dark:text-gray-700">•</span>
                          <span>{topper.branch} ({topper.year})</span>
                        </div>
                      </div>
                    </div>

                    {/* Tagline */}
                    {topper.description && (
                      <div className="border-l-2 border-blue-500 pl-4 py-0.5">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          "{topper.description}"
                        </p>
                      </div>
                    )}

                    {/* Success Story */}
                    {topper.successStory && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                          Preparation Strategy & Story
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                          {topper.successStory}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Score badge at footer */}
                  {topper.score && (
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800/80 flex justify-between items-center text-xs">
                      <span className="text-gray-400 dark:text-gray-500 font-medium">Exam Performance Score</span>
                      <span className="px-2 py-0.5 rounded-md font-extrabold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/15">
                        {topper.score}
                      </span>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </section>

      </main>
      <Footer />
    </>
  );
}
