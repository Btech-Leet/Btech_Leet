import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FadeIn } from "@/components/ui/fade-in";
import Image from "next/image";
import { Mail, MapPin, Award } from "lucide-react";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Try to find author in DB, if not fallback for SEO
  const author = await prisma.author.findUnique({ where: { slug: params.slug } });
  
  if (!author && params.slug !== "nishant") return { title: "Author Not Found" };

  const name = author?.name || "Nishant";
  return {
    title: `${name} - BTech LEET Author Profile`,
    description: `Read articles and expert LEET guidance by ${name}.`,
  };
}

export default async function AuthorProfilePage({ params }: { params: { slug: string } }) {
  let author = await prisma.author.findUnique({ where: { slug: params.slug } });

  // Fallback for the founder if DB isn't seeded yet
  if (!author && params.slug === "nishant") {
    author = {
      id: "nishant-founder",
      name: "Nishant",
      slug: "nishant",
      photo: "/images/nishant-profile.jpg",
      designation: "Founder & Chief Mentor",
      biography: "Founder of BTechLeet. Helping Diploma Students since 2026. Nishant is deeply passionate about bridging the gap between diploma studies and B.Tech lateral entry.",
      experience: "5+ years in EdTech, 3 years specifically guiding LEET aspirants.",
      linkedinUrl: "https://linkedin.com/in/nishant",
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  if (!author) return notFound();

  // Create schema for author
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    jobTitle: author.designation,
    worksFor: {
      "@type": "Organization",
      name: "BTech LEET"
    },
    url: `https://btechleet.com/author/${author.slug}`,
    sameAs: author.linkedinUrl ? [author.linkedinUrl] : [],
    description: author.biography
  };

  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <main className="min-h-screen pt-32 pb-20 bg-gray-950 text-white selection:bg-blue-600 selection:text-white">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn className="bg-gray-900 border border-gray-800 rounded-3xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              
              <div className="shrink-0">
                <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-2xl overflow-hidden border border-gray-800 bg-gray-950">
                  <Image 
                    src={author.photo || "/placeholder-avatar.jpg"} 
                    alt={author.name} 
                    fill 
                    className="object-cover" 
                  />
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-4xl font-extrabold text-white tracking-tight">{author.name}</h1>
                  <p className="text-blue-400 font-semibold mt-1">{author.designation}</p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {author.linkedinUrl && (
                    <a href={author.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/10 text-blue-400 text-xs font-bold hover:bg-blue-600/20 transition-colors">
                      <span className="font-serif italic font-bold text-sm leading-none">in</span> LinkedIn
                    </a>
                  )}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-xs font-bold">
                    <Award size={14} /> Verified Expert
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Biography</h3>
                    <p className="text-gray-300 leading-relaxed text-sm">{author.biography}</p>
                  </div>
                  
                  {author.experience && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Experience</h3>
                      <p className="text-gray-300 leading-relaxed text-sm">{author.experience}</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </FadeIn>
        </div>
      </main>
      <Footer />
    </>
  );
}
