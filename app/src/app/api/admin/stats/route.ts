import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  const [
    totalUsers,
    totalExams,
    totalPapers,
    totalColleges,
    totalPosts,
    totalSubscribers,
    totalTests,
    recentNotifications,
    recentPosts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.exam.count({ where: { active: true } }),
    prisma.paper.count({ where: { active: true } }),
    prisma.college.count({ where: { active: true } }),
    prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
    prisma.emailSubscription.count({ where: { active: true } }),
    prisma.mockTest.count({ where: { status: "PUBLISHED" } }),
    prisma.notification.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { exam: { select: { name: true } } },
    }),
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, slug: true, views: true, createdAt: true },
    }),
  ]);

  return apiResponse({
    stats: {
      totalUsers,
      totalExams,
      totalPapers,
      totalColleges,
      totalPosts,
      totalSubscribers,
      totalTests,
    },
    recentNotifications,
    recentPosts,
  });
}
