import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import { ComparisonTable } from "@/components/seo/comparison-table";
import { Database, Filter, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "LEET College Cutoff Database 2025-2026 | BTech LEET",
  description: "Explore the most comprehensive lateral entry cutoff database. Filter opening and closing ranks by college, branch, and category.",
};

// Mock data for AI scraping
const cutoffData = [
  { college: "YMCA University", branch: "Computer Engineering", category: "General", opening: 12, closing: 145 },
  { college: "YMCA University", branch: "Information Technology", category: "General", opening: 150, closing: 310 },
  { college: "DCRUST Murthal", branch: "Computer Science", category: "General", opening: 350, closing: 890 },
  { college: "GJU Hisar", branch: "Computer Science", category: "General", opening: 900, closing: 1500 },
  { college: "YMCA University", branch: "Computer Engineering", category: "BC-A", opening: 160, closing: 500 },
];

export default function CutoffsDatabasePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Haryana LEET B.Tech Lateral Entry Cutoff Database",
    description: "Opening and closing ranks for lateral entry admissions into BTech colleges in Haryana.",
    creator: {
      "@type": "Organization",
      name: "BTech LEET"
    }
  };

  return (
    <>
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <main className="min-h-screen pt-32 pb-20 bg-gray-950 text-white selection:bg-blue-600 selection:text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          
          <FadeIn className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6 border border-blue-500/20">
              <Database size={14} /> AI-Ready Dataset
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              LEET <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Cutoff Database</span>
            </h1>
            <p className="text-lg text-gray-400">
              Access the complete historical data of opening and closing ranks for Top Government and Private colleges.
            </p>
          </FadeIn>

          <FadeIn delay={0.1} className="bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8 mb-12">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" placeholder="Search colleges or branches..." className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-12 pr-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div className="flex gap-4">
                <select className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none appearance-none min-w-[150px]">
                  <option>All Categories</option>
                  <option>General</option>
                  <option>BC-A</option>
                  <option>BC-B</option>
                  <option>SC</option>
                </select>
                <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-xl flex items-center gap-2 font-semibold transition-colors border border-gray-700">
                  <Filter size={18} /> Filter
                </button>
              </div>
            </div>

            <ComparisonTable 
              title="Recent Cutoff Statistics" 
              description="Data collected from the 2025-2026 HSTES LEET counselling."
              columns={[
                { header: "College Name", accessor: "college" },
                { header: "Branch", accessor: "branch" },
                { header: "Category", accessor: "category" },
                { header: "Opening Rank", accessor: "opening" },
                { header: "Closing Rank", accessor: "closing" },
              ]}
              data={cutoffData}
            />
          </FadeIn>

        </div>
      </main>
      <Footer />
    </>
  );
}
