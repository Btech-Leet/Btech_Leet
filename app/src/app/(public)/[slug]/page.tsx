import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface CmsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: CmsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.cmsPage.findUnique({
    where: { slug },
  });

  if (!page) {
    return {
      title: "Page Not Found | BTech LEET",
    };
  }

  return {
    title: page.metaTitle || `${page.title} | BTech LEET`,
    description: page.metaDesc || `Read ${page.title} on BTech LEET.`,
    keywords: page.keywords || [],
  };
}

export default async function CmsPageDetail({ params }: CmsPageProps) {
  const { slug } = await params;
  const page = await prisma.cmsPage.findUnique({
    where: { slug },
  });

  if (!page || page.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <div className="pb-24">
      {/* Featured Image Banner (If available) */}
      {page.featuredImage && (
        <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden bg-gray-150 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-900">
          <img
            src={page.featuredImage}
            alt={page.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-end">
            <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-8 text-white">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-sm leading-tight">
                {page.title}
              </h1>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-10 shadow-sm">
          {/* Header if there's no featured image */}
          {!page.featuredImage && (
            <div className="border-b border-gray-100 dark:border-gray-850 pb-6 mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                {page.title}
              </h1>
            </div>
          )}

          {/* HTML Rendered Content */}
          <article 
            className="prose prose-sm sm:prose max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-img:rounded-xl text-gray-800 dark:text-gray-200"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </div>
    </div>
  );
}
