import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FadeIn } from "@/components/ui/fade-in";
import { ComparisonTable } from "@/components/seo/comparison-table";
import { Database, Filter, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "LEET Seat Matrix Database 2025 | BTech LEET",
  description: "Check lateral entry seat availability across various BTech colleges and branches.",
};

const seatData = [
  { college: "YMCA University", branch: "Computer Engineering", total: 12, general: 5, sc: 2, bc: 3, other: 2 },
  { college: "DCRUST Murthal", branch: "Computer Science", total: 18, general: 8, sc: 4, bc: 4, other: 2 },
  { college: "GJU Hisar", branch: "Information Tech", total: 15, general: 7, sc: 3, bc: 3, other: 2 },
];

export default function SeatMatrixDatabasePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Haryana LEET B.Tech Seat Matrix",
    description: "Total available seats for BTech Lateral Entry.",
  };

  return (
    <>
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen pt-32 pb-20 bg-gray-950 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6 border border-emerald-500/20">
              <Database size={14} /> AI-Ready Dataset
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">Seat <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Matrix</span></h1>
            <p className="text-lg text-gray-400">Accurate distribution of vacant seats for 2nd Year Lateral Entry.</p>
          </FadeIn>
          <FadeIn delay={0.1} className="bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8">
            <ComparisonTable 
              title="Available Seats" 
              columns={[
                { header: "College Name", accessor: "college" },
                { header: "Branch", accessor: "branch" },
                { header: "Total Seats", accessor: "total" },
                { header: "General", accessor: "general" },
                { header: "SC", accessor: "sc" },
                { header: "BC", accessor: "bc" },
              ]}
              data={seatData}
            />
          </FadeIn>
        </div>
      </main>
      <Footer />
    </>
  );
}
