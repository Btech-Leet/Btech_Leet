import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";
import { reviewSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pageUrl = searchParams.get("pageUrl");

    const whereClause: any = {
      status: "APPROVED",
    };

    if (pageUrl) {
      whereClause.pageUrl = pageUrl;
    }

    const reviews = await prisma.review.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return apiResponse(reviews);
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch reviews", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const authUser = await getAuthUser(req);
    const userId = authUser ? authUser.userId : null;

    const review = await prisma.review.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        rating: parsed.data.rating,
        text: parsed.data.text,
        pageUrl: parsed.data.pageUrl,
        userId: userId,
        status: "PENDING", // reviews always start as pending
      },
    });

    return apiResponse(review, "Review submitted successfully and is pending approval", 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to submit review", 500);
  }
}
