import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { mockTestSchema, testAttemptSchema } from "@/lib/validations";
import { requireAuth, requireAdminOrEditor, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError, slugify } from "@/lib/utils";
import { checkAndAwardBadges } from "@/lib/badgeHelper";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let isAdmin = false;
  try {
    const auth = await requireAdminOrEditor(req);
    if (!isAuthResponse(auth)) {
      isAdmin = true;
    }
  } catch (e) {
    // Ignore and fallback to student/public access controls
  }

  const test = await prisma.mockTest.findFirst({
    where: isAdmin 
      ? { OR: [{ slug }, { id: slug }] }
      : { OR: [{ slug }, { id: slug }], status: "PUBLISHED" },
    include: {
      questions: {
        orderBy: { order: "asc" },
        select: isAdmin ? undefined : {
          id: true,
          text: true,
          type: true,
          options: true,
          marks: true,
          order: true,
        },
      },
    },
  });

  if (!test) return apiError("Test not found", 404);
  return apiResponse(test);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireAdminOrEditor(req);
  if (isAuthResponse(auth)) return auth;

  const { slug } = await params;
  const body = await req.json();
  const parsed = mockTestSchema.partial().safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0].message, 422);

  const test = await prisma.mockTest.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
  });
  if (!test) return apiError("Test not found", 404);

  const data = parsed.data;
  if (data.title && !data.slug) {
    data.slug = slugify(data.title);
  }

  const updatedTest = await prisma.mockTest.update({
    where: { id: test.id },
    data: data as any,
  });

  return apiResponse(updatedTest, "Mock test updated successfully");
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireAdminOrEditor(req);
  if (isAuthResponse(auth)) return auth;

  const { slug } = await params;
  const test = await prisma.mockTest.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
  });
  if (!test) return apiError("Test not found", 404);

  await prisma.mockTest.delete({
    where: { id: test.id },
  });

  return apiResponse(null, "Mock test deleted successfully");
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireAuth(req);
  if (isAuthResponse(auth)) return auth;

  const { slug } = await params;
  const test = await prisma.mockTest.findFirst({
    where: { OR: [{ slug }, { id: slug }], status: "PUBLISHED" },
    include: { questions: true },
  });
  if (!test) return apiError("Test not found", 404);

  const body = await req.json();
  const parsed = testAttemptSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0].message, 422);

  // Calculate score
  let score = 0;
  const correctAnswers: Record<string, string> = {};

  for (const question of test.questions) {
    correctAnswers[question.id] = question.answer;
    if (parsed.data.answers[question.id] === question.answer) {
      score += question.marks;
    }
  }

  const attempt = await prisma.testAttempt.create({
    data: {
      userId: auth.userId,
      testId: test.id,
      answers: parsed.data.answers as Record<string, string>,
      score,
      totalMarks: test.totalMarks,
      timeTaken: parsed.data.timeTaken,
    },
  });

  // Asynchronously evaluate badges (non-blocking for the response)
  let newBadges: string[] = [];
  try {
    newBadges = await checkAndAwardBadges(auth.userId);
  } catch (err) {
    console.error("Badge evaluation error:", err);
  }

  return apiResponse({
    attempt,
    score,
    totalMarks: test.totalMarks,
    percentage: Math.round((score / test.totalMarks) * 100),
    passed: test.passMark ? score >= test.passMark : null,
    correctAnswers,
    newBadges,
  });
}
