import { prisma } from "@/lib/prisma";
import { PromoBannerModal } from "./promo-banner-modal";

export async function PromoBanner() {
  const now = new Date();
  
  const banners = await prisma.promoBanner.findMany({
    where: {
      active: true,
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null }, { endDate: { gte: now } }] },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 1,
  });

  if (banners.length === 0) return null;

  const banner = banners[0];

  return <PromoBannerModal banner={banner} />;
}
