import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { testAttemptSchema } from "@/lib/validations";
import { requireAuth, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const test = await prisma.mockTest.findFirst({
    where: { OR: [{ slug }, { id: slug }], status: "PUBLISHED" },
    include: {
      questions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          text: true,
          type: true,
          options: true,
          marks: true,
          order: true,
          // Don't expose answer in GET
        },
      },
    },
  });
  if (!test) return apiError("Test not found", 404);
  return apiResponse(test);
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

  return apiResponse({
    attempt,
    score,
    totalMarks: test.totalMarks,
    percentage: Math.round((score / test.totalMarks) * 100),
    passed: test.passMark ? score >= test.passMark : null,
    correctAnswers,
  });
}
