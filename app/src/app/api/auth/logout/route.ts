import { NextRequest } from "next/server";
import { clearAuthCookie } from "@/lib/auth";
import { apiResponse } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const cookie = clearAuthCookie();
  const response = apiResponse(null, "Logged out successfully");
  (response as Response).headers.set(
    "Set-Cookie",
    `${cookie.name}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`
  );
  return response;
}
