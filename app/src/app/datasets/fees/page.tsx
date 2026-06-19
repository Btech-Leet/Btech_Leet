import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FadeIn } from "@/components/ui/fade-in";
import { ComparisonTable } from "@/components/seo/comparison-table";
import { Database } from "lucide-react";

export const metadata: Metadata = {
  title: "LEET College Fees Database 2026 | BTech LEET",
  description: "Compare tuition, hostel, and total fees for BTech colleges admitting lateral entry students.",
};

const feeData = [
  { college: "YMCA University", type: "Govt. State", tuition: "₹35,000", hostel: "₹28,000", total: "₹75,000" },
  { college: "DCRUST Murthal", type: "Govt. State", tuition: "₹45,000", hostel: "₹25,000", total: "₹80,000" },
  { college: "GJU Hisar", type: "Govt. State", tuition: "₹65,000", hostel: "₹30,000", total: "₹1,05,000" },
  { college: "PIET Panipat", type: "Private", tuition: "₹1,20,000", hostel: "₹80,000", total: "₹2,10,000" },
];

export default function FeesDatabasePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Haryana B.Tech College Fees",
    description: "Annual fee structures for BTech Lateral Entry colleges.",
  };

  return (
    <>
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen pt-32 pb-20 bg-gray-950 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider mb-6 border border-amber-500/20">
              <Database size={14} /> AI-Ready Dataset
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">Fees <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Database</span></h1>
            <p className="text-lg text-gray-400">Comprehensive annual fee structures including tuition, hostel, and miscellaneous charges.</p>
          </FadeIn>
          <FadeIn delay={0.1} className="bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8">
            <ComparisonTable 
              title="Annual Fee Structure" 
              columns={[
                { header: "College Name", accessor: "college" },
                { header: "Type", accessor: "type" },
                { header: "Tuition Fee", accessor: "tuition" },
                { header: "Hostel Fee", accessor: "hostel" },
                { header: "Approx Total/Year", accessor: "total" },
              ]}
              data={feeData}
            />
          </FadeIn>
        </div>
      </main>
      <Footer />
    </>
  );
}
