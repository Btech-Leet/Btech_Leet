import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations";
import { hashPassword } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit, getIP } from "@/lib/middleware";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  const { allowed } = rateLimit(ip, 3, 60 * 60 * 1000);
  if (!allowed) return apiError("Too many requests. Try again later.", 429);

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  if (action === "request") {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 422);

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (!user) return apiResponse(null, "If that email exists, a reset link was sent.");

    const token = randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    try {
      await sendPasswordResetEmail(user.email, user.name, token);
    } catch (err) {
      console.error("Reset email error:", err);
    }

    return apiResponse(null, "If that email exists, a reset link was sent.");
  }

  if (action === "reset") {
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 422);

    const user = await prisma.user.findFirst({
      where: {
        resetToken: parsed.data.token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) return apiError("Invalid or expired reset token", 400);

    const hashed = await hashPassword(parsed.data.password);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, resetToken: null, resetTokenExpiry: null },
    });

    return apiResponse(null, "Password reset successfully");
  }

  return apiError("Invalid action", 400);
}
