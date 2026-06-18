import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils";
import { contactInquirySchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = contactInquirySchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 422);
    }

    const { name, email, mobile, subject, message } = parsed.data;

    const inquiry = await prisma.contactInquiry.create({
      data: {
        name,
        email,
        mobile,
        subject,
        message,
        status: "NEW",
      },
    });

    return apiResponse(inquiry, "Your message has been sent successfully. We will contact you soon.", 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to submit contact inquiry", 500);
  }
}
