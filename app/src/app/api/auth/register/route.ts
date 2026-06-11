import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth";
import { apiResponse, apiError, slugify } from "@/lib/utils";
import { sendVerificationEmail } from "@/lib/email";
import { rateLimit, getIP } from "@/lib/middleware";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  const { allowed } = rateLimit(ip, 5, 60 * 1000);
  if (!allowed) return apiError("Too many requests. Try again in a minute.", 429);

  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return apiError("Email already registered", 409);

    const hashed = await hashPassword(password);
    const verificationToken = randomBytes(32).toString("hex");

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        verificationToken,
      },
    });

    try {
      await sendVerificationEmail(email, name, verificationToken);
    } catch (emailErr) {
      console.error("Failed to send verification email:", emailErr);
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    const cookie = setAuthCookie(token);

    const response = apiResponse(
      { id: user.id, name: user.name, email: user.email, role: user.role, emailVerified: user.emailVerified },
      "Registration successful",
      201
    );

    (response as Response).headers.set(
      "Set-Cookie",
      `${cookie.name}=${cookie.value}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`
    );

    return response;
  } catch (err) {
    console.error("Register error:", err);
    return apiError("Internal server error", 500);
  }
}
