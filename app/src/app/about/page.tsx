import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import { Users, GraduationCap, Target, Award } from "lucide-react";
import Image from "next/image";

import { mergeSeoMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const fallback: Metadata = {
    title: "About Us | BTech LEET",
    description: "Learn about BTech LEET, our mission, and the team behind India's #1 platform for diploma lateral entry students.",
  };
  return mergeSeoMetadata("/about", fallback);
}

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 pb-20 bg-gray-950 text-gray-300 selection:bg-blue-600 selection:text-white">
        <div className="max-w-6xl mx-auto px-6">
          
          <FadeIn className="text-center max-w-3xl mx-auto mb-20">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
              Empowering <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Diploma</span> Students
            </h1>
            <p className="text-lg md:text-xl text-gray-400 leading-relaxed">
              BTech LEET was founded with a single mission: to democratize access to quality education and guidance for diploma students aiming for lateral entry into top B.Tech colleges across India.
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {[
              { icon: Target, title: "Our Mission", desc: "To provide accurate cutoffs, comprehensive mock tests, and actionable insights to ensure every diploma student reaches their dream college." },
              { icon: GraduationCap, title: "Our Vision", desc: "A future where lateral entry is seamless, transparent, and entirely merit-driven, powered by data and expert mentorship." },
              { icon: Award, title: "Why Us?", desc: "Built by former LEET toppers who understand the exact struggles, syllabus gaps, and counselling complexities that students face." },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <StaggerItem key={idx} className="p-8 rounded-3xl bg-gray-900 border border-gray-800 text-center hover:border-blue-500/50 transition-colors">
                  <div className="w-16 h-16 mx-auto bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
                    <Icon size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </StaggerItem>
              )
            })}
          </StaggerContainer>

          <FadeIn className="bg-gray-900 border border-gray-800 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/3">
              <div className="relative w-48 h-48 mx-auto md:mx-0 rounded-full overflow-hidden border-4 border-gray-800">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 opacity-20 z-10" />
                <Image src="/images/nishant-profile.jpg" alt="Nishant - Founder" fill className="object-cover" />
              </div>
            </div>
            <div className="md:w-2/3 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-500/20">
                <Users size={14} /> Founder
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Meet Nishant</h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Nishant founded BTech LEET in 2026 after realizing the massive information gap existing for diploma students. 
                With a passion for tech and education, he built this platform to bring transparency to the chaotic LEET admission process.
              </p>
              <a href="/author/nishant" className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1">
                View Full Profile &rarr;
              </a>
            </div>
          </FadeIn>

        </div>
      </main>
      <Footer />
    </>
  );
}
