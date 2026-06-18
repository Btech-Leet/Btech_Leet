import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const books = await prisma.book.findMany({
      where: { active: true },
      orderBy: [
        { featured: "desc" },
        { createdAt: "desc" },
      ],
      include: {
        author: { select: { id: true, name: true, slug: true } },
      },
    });

    return apiResponse(books);
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch books", 500);
  }
}
