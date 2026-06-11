import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { comparePassword, signToken, setAuthCookie } from "@/lib/auth";
import { apiResponse, apiError } from "@/lib/utils";
import { rateLimit, getIP } from "@/lib/middleware";

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  const { allowed } = rateLimit(ip, 10, 60 * 1000);
  if (!allowed) return apiError("Too many login attempts. Try again later.", 429);

  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return apiError("Invalid email or password", 401);

    const valid = await comparePassword(password, user.password);
    if (!valid) return apiError("Invalid email or password", 401);

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    const cookie = setAuthCookie(token);

    const response = apiResponse({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      avatar: user.avatar,
    });

    (response as Response).headers.set(
      "Set-Cookie",
      `${cookie.name}=${cookie.value}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`
    );

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return apiError("Internal server error", 500);
  }
}
