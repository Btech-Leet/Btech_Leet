import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (isAuthResponse(auth)) return auth;

  const userId = auth.userId;

  try {
    const body = await req.json();
    const { studyTime, questionsSolved, notesViewed, testsAttempted } = body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Upsert study session log for today
    const studyLog = await prisma.dailyStudy.upsert({
      where: {
        userId_date: {
          userId,
          date: today
        }
      },
      update: {
        studyTime: { increment: studyTime || 0 },
        questionsSolved: { increment: questionsSolved || 0 },
        notesViewed: { increment: notesViewed || 0 },
        testsAttempted: { increment: testsAttempted || 0 }
      },
      create: {
        userId,
        date: today,
        studyTime: studyTime || 0,
        questionsSolved: questionsSolved || 0,
        notesViewed: notesViewed || 0,
        testsAttempted: testsAttempted || 0
      }
    });

    return apiResponse({
      success: true,
      data: studyLog
    });
  } catch (err: any) {
    console.error("Failed to log study session:", err);
    return apiError(err.message || "Internal server error", 500);
  }
}
