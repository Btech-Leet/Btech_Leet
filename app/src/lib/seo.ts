import { Metadata } from "next";
import { prisma } from "./prisma";

export async function getSeoMeta(pageUrl: string) {
  try {
    // Normalize path by stripping trailing slashes
    const normalizedUrl = pageUrl === "/" ? "/" : pageUrl.replace(/\/$/, "");
    
    return await prisma.seoMeta.findUnique({
      where: { pageUrl: normalizedUrl },
    });
  } catch (err) {
    console.error("Failed to query SEO meta mapping:", err);
    return null;
  }
}

export async function mergeSeoMetadata(
  pageUrl: string,
  fallbackMetadata: Metadata
): Promise<Metadata> {
  const override = await getSeoMeta(pageUrl);

  const metadata: Metadata = { ...fallbackMetadata };

  // Auto-generate canonical URL if not explicitly set
  const canonicalUrl = override?.canonicalUrl || (pageUrl === "/" ? "https://btechleet.com" : `https://btechleet.com${pageUrl}`);
  metadata.alternates = {
    ...metadata.alternates,
    canonical: canonicalUrl,
  };

  // Determine fallback title and description
  const titleVal = fallbackMetadata.title;
  let fallbackTitle = "BTech LEET";
  if (typeof titleVal === "string") {
    fallbackTitle = titleVal;
  } else if (titleVal && "default" in titleVal && typeof titleVal.default === "string") {
    fallbackTitle = titleVal.default;
  }
  
  const resolvedTitle = override?.seoTitle || fallbackTitle;
  const resolvedDescription = override?.metaDescription || fallbackMetadata.description || "India's most comprehensive portal for BTech Lateral Entry Exam (LEET).";

  // Handle OG metadata
  const ogTitle = override?.ogTitle || resolvedTitle;
  const ogDescription = override?.ogDescription || resolvedDescription;
  const ogImage = override?.ogImage || "/og-image.jpg";

  metadata.openGraph = {
    ...metadata.openGraph,
    title: ogTitle as string,
    description: ogDescription as string,
    url: canonicalUrl,
    images: [{ url: ogImage }],
  };

  metadata.twitter = {
    card: "summary_large_image",
    ...metadata.twitter,
    title: ogTitle as string,
    description: ogDescription as string,
    images: [ogImage],
  };

  if (!override) return metadata;

  if (override.seoTitle) {
    metadata.title = override.seoTitle;
  }
  // Always ensure description is set (resolvedDescription already incorporates override + fallback)
  metadata.description = resolvedDescription;
  if (override.keywords && override.keywords.length > 0) {
    metadata.keywords = override.keywords;
  }

  // Handle robots tags
  if (!override.indexable) {
    metadata.robots = {
      index: false,
      follow: false,
    };
  } else if (override.robotsTags) {
    metadata.robots = override.robotsTags; // Could be parsed if it's a JSON string, assuming it's structured correctly
  }

  return metadata;
}
