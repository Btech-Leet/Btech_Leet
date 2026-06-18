import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return Response.json({ success: false, message: "Unauthorized", data: null }, { status: 200 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { id: true, name: true, email: true, role: true, emailVerified: true, avatar: true, createdAt: true },
  });

  if (!dbUser) return apiError("User not found", 404);
  return apiResponse(dbUser);
}
