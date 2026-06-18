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

    // Extract tracking data from request body (optional fields)
    const trackingData = {
      sourcePage: typeof body.sourcePage === "string" ? body.sourcePage : null,
      sourceUrl: typeof body.sourceUrl === "string" ? body.sourceUrl : null,
      landingPage: typeof body.landingPage === "string" ? body.landingPage : null,
      referrerPage: typeof body.referrerPage === "string" ? body.referrerPage : null,
      utmSource: typeof body.utmSource === "string" ? body.utmSource : null,
      utmMedium: typeof body.utmMedium === "string" ? body.utmMedium : null,
      utmCampaign: typeof body.utmCampaign === "string" ? body.utmCampaign : null,
    };

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

    // Auto-create a Lead record for CRM tracking
    try {
      await prisma.lead.create({
        data: {
          name,
          email,
          userId: user.id,
          status: "NEW",
          sourcePage: trackingData.sourcePage,
          sourceUrl: trackingData.sourceUrl,
          landingPage: trackingData.landingPage,
          referrerPage: trackingData.referrerPage,
          utmSource: trackingData.utmSource,
          utmMedium: trackingData.utmMedium,
          utmCampaign: trackingData.utmCampaign,
        },
      });
    } catch (leadErr) {
      // Non-critical — don't block registration if lead creation fails
      console.error("Failed to auto-create lead record:", leadErr);
    }

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
  } catch (err: any) {
    console.error("Register error:", err);
    
    const isDbError = 
      err?.code?.startsWith("P1") ||
      err?.message?.includes("Can't reach database") ||
      err?.message?.includes("database connection") ||
      err?.message?.includes("failed to connect") ||
      err?.name === "PrismaClientInitializationError";
      
    if (isDbError) {
      return apiError("Database connection failed. Please ensure your database is running and DATABASE_URL is set correctly in your environment variables.", 500);
    }
    
    return apiError(err instanceof Error ? err.message : "Internal server error", 500);
  }
}
