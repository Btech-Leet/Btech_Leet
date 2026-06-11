import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";

export async function GET() {
  const states = await prisma.state.findMany({ orderBy: { name: "asc" } });
  return apiResponse(states);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  const body = await req.json();
  const { name, code } = body;
  if (!name || !code) return apiError("Name and code are required", 422);

  const state = await prisma.state.create({ data: { name, code: code.toUpperCase() } });
  return apiResponse(state, "State created", 201);
}
