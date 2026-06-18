import { NextRequest } from "next/server";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return apiError("No file uploaded", 400);
    }

    const text = await file.text();

    // Regex to match email addresses
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailRegex) || [];

    // Deduplicate and trim
    const emails = Array.from(new Set(matches.map((email) => email.trim().toLowerCase())));

    if (emails.length === 0) {
      return apiError("No valid email addresses found in the uploaded file", 400);
    }

    return apiResponse({
      filename: file.name,
      count: emails.length,
      emails,
    }, `Successfully parsed ${emails.length} email addresses`);
  } catch (err: any) {
    return apiError(err.message || "Failed to process file upload", 500);
  }
}
