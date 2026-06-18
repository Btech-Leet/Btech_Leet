import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { profileUpdateSchema } from "@/lib/validations";
import { calculateProfileCompletion } from "@/lib/profile";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (isAuthResponse(auth)) return auth;

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      mobile: true,
      state: true,
      collegeName: true,
      branch: true,
      passingYear: true,
      examTargets: true,
      profileComplete: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) return apiError("User not found", 404);

  return apiResponse(user);
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const body = await req.json();
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    // Get current user to keep fields for profileCompletion if they are not updated
    const currentUser = await prisma.user.findUnique({
      where: { id: auth.userId },
    });

    if (!currentUser) return apiError("User not found", 404);

    const updateData = parsed.data;

    // Construct full representation for completion calculation
    const mergedUser = {
      name: updateData.name !== undefined ? updateData.name : currentUser.name,
      avatar: currentUser.avatar, // avatar is updated via separate avatar upload endpoint
      mobile: updateData.mobile !== undefined ? updateData.mobile : currentUser.mobile,
      state: updateData.state !== undefined ? updateData.state : currentUser.state,
      collegeName: updateData.collegeName !== undefined ? updateData.collegeName : currentUser.collegeName,
      branch: updateData.branch !== undefined ? updateData.branch : currentUser.branch,
      passingYear: updateData.passingYear !== undefined ? updateData.passingYear : currentUser.passingYear,
      examTargets: updateData.examTargets !== undefined ? updateData.examTargets : currentUser.examTargets,
    };

    const profileComplete = calculateProfileCompletion(mergedUser);

    const updatedUser = await prisma.user.update({
      where: { id: auth.userId },
      data: {
        ...updateData,
        profileComplete,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        mobile: true,
        state: true,
        collegeName: true,
        branch: true,
        passingYear: true,
        examTargets: true,
        profileComplete: true,
        role: true,
        createdAt: true,
      },
    });

    return apiResponse(updatedUser, "Profile updated successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to update profile", 500);
  }
}
