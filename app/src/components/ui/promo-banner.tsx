import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { X } from "lucide-react";

export async function PromoBanner() {
  const now = new Date();
  
  const banners = await prisma.promoBanner.findMany({
    where: {
      active: true,
      OR: [
        { startDate: null, endDate: null },
        { startDate: { lte: now }, endDate: { gte: now } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 1,
  });

  if (banners.length === 0) return null;

  const banner = banners[0];

  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white overflow-hidden shadow-md">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          {banner.imageUrl && (
            <div className="w-12 h-12 rounded overflow-hidden shadow-sm hidden sm:block bg-white/10 flex-shrink-0">
              <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            <h3 className="font-bold text-sm sm:text-base leading-tight">
              {banner.title}
            </h3>
          </div>
        </div>

        {banner.linkUrl && (
          <Link
            href={banner.linkUrl}
            className="whitespace-nowrap px-4 py-1.5 bg-white text-blue-700 text-xs font-extrabold rounded-full hover:bg-gray-100 transition-colors shadow-sm"
          >
            Learn More
          </Link>
        )}
      </div>
    </div>
  );
}
