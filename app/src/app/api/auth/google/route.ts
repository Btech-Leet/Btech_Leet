import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const isPlaceholder = !clientId || clientId === "your-google-client-id" || clientId.trim() === "";

  if (isPlaceholder) {
    const referer = _req.headers.get("referer") || "/auth/login";
    const redirectUrl = new URL(referer, _req.nextUrl.origin);
    redirectUrl.searchParams.set("error", "Google Sign-In is not configured. Please set GOOGLE_CLIENT_ID in your environment variables.");
    return NextResponse.redirect(redirectUrl.toString());
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}
