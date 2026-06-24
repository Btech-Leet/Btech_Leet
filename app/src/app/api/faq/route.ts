import { NextResponse } from "next";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, question } = body;

    if (!name || !email || !question) {
      return NextResponse.json(
        { message: "Name, email, and question are required." },
        { status: 400 }
      );
    }

    const userQuestion = await prisma.userQuestion.create({
      data: {
        name,
        email,
        question,
      },
    });

    return NextResponse.json(
      { message: "Question submitted successfully", question: userQuestion },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting question:", error);
    return NextResponse.json(
      { message: "Failed to submit question" },
      { status: 500 }
    );
  }
}
