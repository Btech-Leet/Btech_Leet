import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken, setAuthCookie } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const code = new URL(req.url).searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=google_denied`);
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${appUrl}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) throw new Error("Token exchange failed");
    const { access_token } = await tokenRes.json();

    // Fetch Google user info
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userRes.ok) throw new Error("Failed to fetch user info");
    const { email, name, picture, id: googleId } = await userRes.json();

    if (!email) throw new Error("No email from Google");

    // Upsert user
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split("@")[0],
          password: `google:${googleId}`, // placeholder – can't be used for password login
          emailVerified: true,
          avatar: picture || null,
          googleId,
        },
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          avatar: picture || user.avatar,
          googleId: user.googleId || googleId,
        },
      });
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    const response = NextResponse.redirect(`${appUrl}/dashboard`);
    setAuthCookie(response, token);

    return response;
  } catch (err) {
    console.error("Google OAuth error:", err);
    return NextResponse.redirect(`${appUrl}/auth/login?error=google_failed`);
  }
}
