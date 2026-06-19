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
  if (!override) return fallbackMetadata;

  const metadata: Metadata = { ...fallbackMetadata };

  if (override.seoTitle) {
    metadata.title = override.seoTitle;
  }
  if (override.metaDescription) {
    metadata.description = override.metaDescription;
  }
  if (override.keywords && override.keywords.length > 0) {
    metadata.keywords = override.keywords;
  }
  if (override.canonicalUrl) {
    metadata.alternates = {
      ...metadata.alternates,
      canonical: override.canonicalUrl,
    };
  }

  // Handle OG metadata
  const ogTitle = override.ogTitle || override.seoTitle || undefined;
  const ogDescription = override.ogDescription || override.metaDescription || undefined;
  const ogImage = override.ogImage || undefined;

  if (ogTitle || ogDescription || ogImage) {
    metadata.openGraph = {
      ...metadata.openGraph,
      ...(ogTitle && { title: ogTitle }),
      ...(ogDescription && { description: ogDescription }),
      ...(ogImage && { images: [{ url: ogImage }] }),
    };
  }

  // Handle robots tags
  if (!override.indexable) {
    metadata.robots = {
      index: false,
      follow: false,
    };
  } else if (override.robotsTags) {
    metadata.robots = override.robotsTags;
  }

  return metadata;
}
