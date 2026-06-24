import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Plus, Image as ImageIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Manage Promo Banners | Admin",
};

export default async function AdminBannersPage() {
  const banners = await prisma.promoBanner.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Promotional Banners</h1>
          <p className="text-sm text-gray-500">Manage global promotion banners shown on public pages.</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm">
          <Plus size={16} /> Add Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center shadow-sm">
            <ImageIcon className="mx-auto text-gray-300 dark:text-gray-700 mb-3" size={40} />
            <p className="text-sm text-gray-500">No promotional banners created yet.</p>
          </div>
        ) : (
          banners.map((banner) => (
            <div key={banner.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
              <div className="aspect-[3/1] bg-gray-100 dark:bg-gray-800 relative">
                {banner.imageUrl ? (
                  <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <ImageIcon size={24} />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    banner.active ? "bg-green-500 text-white" : "bg-gray-500 text-white"
                  }`}>
                    {banner.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{banner.title}</h3>
                {banner.linkUrl && (
                  <p className="text-xs text-blue-500 truncate mt-1">{banner.linkUrl}</p>
                )}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between text-xs text-gray-500">
                  <span>Starts: {banner.startDate ? new Date(banner.startDate).toLocaleDateString() : "Anytime"}</span>
                  <span>Ends: {banner.endDate ? new Date(banner.endDate).toLocaleDateString() : "Never"}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
