import { NextRequest } from "next/server";
import { getAuthUser, JWTPayload } from "./auth";
import { apiError } from "./utils";

export async function requireAuth(req: NextRequest): Promise<JWTPayload | Response> {
  const user = await getAuthUser(req);
  if (!user) return apiError("Unauthorized", 401);
  return user;
}

export async function requireAdmin(req: NextRequest): Promise<JWTPayload | Response> {
  const user = await getAuthUser(req);
  if (!user) return apiError("Unauthorized", 401);
  if (user.role !== "ADMIN") return apiError("Forbidden: Admin access required", 403);
  return user;
}

export async function requireAdminOrEditor(req: NextRequest): Promise<JWTPayload | Response> {
  const user = await getAuthUser(req);
  if (!user) return apiError("Unauthorized", 401);
  if (!["ADMIN", "EDITOR"].includes(user.role)) return apiError("Forbidden", 403);
  return user;
}

export function isAuthResponse(value: JWTPayload | Response): value is Response {
  return value instanceof Response;
}

// In-memory rate limiter (use Redis in production)
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  ip: string,
  maxRequests = 100,
  windowMs = 60 * 1000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const key = ip;
  const record = requestCounts.get(key);

  if (!record || now > record.resetAt) {
    requestCounts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

export function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
