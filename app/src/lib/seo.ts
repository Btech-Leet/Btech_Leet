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
