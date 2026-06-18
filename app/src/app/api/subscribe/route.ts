import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { subscribeSchema } from "@/lib/validations";
import { apiResponse, apiError } from "@/lib/utils";
import { getAuthUser } from "@/lib/auth";
import { rateLimit, getIP } from "@/lib/middleware";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  const { allowed } = rateLimit(ip, 5, 60 * 1000);
  if (!allowed) return apiError("Too many requests", 429);

  const body = await req.json();
  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0].message, 422);

  const user = await getAuthUser(req);

  const existing = await prisma.emailSubscription.findUnique({
    where: { email: parsed.data.email },
  });

  if (existing) {
    if (!existing.active) {
      await prisma.emailSubscription.update({
        where: { email: parsed.data.email },
        data: { active: true },
      });
      try {
        await sendWelcomeEmail(parsed.data.email);
      } catch (err) {
        console.error("Failed to send welcome email:", err);
      }
      return apiResponse(null, "Successfully resubscribed");
    }
    return apiError("Email already subscribed", 409);
  }

  await prisma.emailSubscription.create({
    data: {
      ...parsed.data,
      userId: user?.userId,
    },
  });

  try {
    await sendWelcomeEmail(parsed.data.email);
  } catch (err) {
    console.error("Failed to send welcome email:", err);
  }

  return apiResponse(null, "Successfully subscribed", 201);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return apiError("Email is required", 400);

  await prisma.emailSubscription.update({
    where: { email },
    data: { active: false },
  });

  return apiResponse(null, "Unsubscribed successfully");
}
