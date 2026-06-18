import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const [
      totalUsers,
      premiumUsers,
      totalReviews,
      pendingReviews,
      activeCoupons,
      totalContacts,
      newContacts,
      totalBooks,
      totalToppers,
      totalExperts,
      totalBlogPosts,
      totalMockTests,
      totalLeads,
      totalPremiumGrants,
      emailCampaignsSent,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { premiumStatus: true } }),
      prisma.review.count(),
      prisma.review.count({ where: { status: "PENDING" } }),
      prisma.coupon.count({ where: { active: true } }),
      prisma.contactInquiry.count(),
      prisma.contactInquiry.count({ where: { status: "NEW" } }),
      prisma.book.count({ where: { active: true } }),
      prisma.topper.count({ where: { active: true } }),
      prisma.expert.count({ where: { active: true } }),
      prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
      prisma.mockTest.count({ where: { status: "PUBLISHED" } }),
      prisma.lead.count(),
      prisma.premiumAccess.count({ where: { status: "ACTIVE" } }),
      prisma.emailCampaign.count({ where: { status: "SENT" } }),
    ]);

    // Recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRegistrations = await prisma.user.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    });

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyRegistrations = await prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    return apiResponse({
      totalUsers,
      premiumUsers,
      recentRegistrations,
      monthlyRegistrations,
      totalReviews,
      pendingReviews,
      activeCoupons,
      totalContacts,
      newContacts,
      totalBooks,
      totalToppers,
      totalExperts,
      totalBlogPosts,
      totalMockTests,
      totalLeads,
      totalPremiumGrants,
      emailCampaignsSent,
    });
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch overview analytics", 500);
  }
}
