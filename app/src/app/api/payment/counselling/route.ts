import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";
import { sendCounsellingEmail } from "@/lib/email";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const { name, mobile, leetExam, rank } = await req.json();

    if (!name || !mobile || !leetExam) {
      return apiError("Name, mobile, and LEET exam details are required", 422);
    }

    // Fetch the counselling price setting
    const setting = await prisma.setting.findUnique({
      where: { key: "counselling_price" },
    });
    const amount = setting ? (setting.value as any).price : 999;

    // Check if the user is already successfully registered
    const existing = await prisma.counsellingRegistration.findFirst({
      where: {
        userId: auth.userId,
        status: "SUCCESSFUL",
      },
    });

    if (existing) {
      return apiError("You are already registered for counselling", 409);
    }

    // If price is 0 (Free), process immediately
    if (amount <= 0) {
      const invoiceNumber = `LEET-INV-CN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

      // Create a successful registration
      const registration = await prisma.counsellingRegistration.create({
        data: {
          userId: auth.userId,
          name,
          email: auth.email || "",
          mobile,
          leetExam,
          rank: rank || null,
          status: "SUCCESSFUL",
          amountPaid: 0,
          invoiceNumber,
        },
      });

      // Create a transaction record
      const transaction = await prisma.transaction.create({
        data: {
          userId: auth.userId,
          orderId: `free_cns_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          paymentId: "FREE_COUNSELLING",
          signature: "FREE_COUNSELLING",
          amount: 0,
          currency: "INR",
          status: "SUCCESSFUL",
          purchaseType: "COUNSELLING",
          purchaseItemId: registration.id,
          purchaseName: "Premium counselling registration",
          invoiceNumber,
        },
      });

      // Send the confirmation email
      const user = await prisma.user.findUnique({ where: { id: auth.userId } });
      if (user) {
        try {
          await sendCounsellingEmail(user.email, user.name);
        } catch (mailErr) {
          console.error("Failed to send counselling welcome email:", mailErr);
        }
      }

      return apiResponse({
        free: true,
        registrationId: registration.id,
        transactionId: transaction.id,
        invoiceNumber,
      }, "Registered for counselling successfully.");
    }

    // Create a pending registration
    const registration = await prisma.counsellingRegistration.create({
      data: {
        userId: auth.userId,
        name,
        email: auth.email || "",
        mobile,
        leetExam,
        rank: rank || null,
        status: "PENDING",
        amountPaid: amount,
      },
    });

    // Create Razorpay order via REST API
    const orderPayload = {
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency: "INR",
      receipt: `rcpt_cns_${Date.now()}_${auth.userId.slice(0, 8)}`,
      notes: {
        userId: auth.userId,
        purchaseType: "COUNSELLING",
        purchaseItemId: registration.id,
      },
    };

    const razorpayRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64")}`,
      },
      body: JSON.stringify(orderPayload),
    });

    if (!razorpayRes.ok) {
      const errBody = await razorpayRes.text();
      console.error("Razorpay order creation failed for counselling:", errBody);
      return apiError("Failed to initiate payment. Please try again.", 502);
    }

    const razorpayOrder = await razorpayRes.json();

    // Create a pending transaction record
    const transaction = await prisma.transaction.create({
      data: {
        userId: auth.userId,
        orderId: razorpayOrder.id,
        amount,
        currency: "INR",
        status: "PENDING",
        purchaseType: "COUNSELLING",
        purchaseItemId: registration.id,
        purchaseName: "Premium counselling registration",
      },
    });

    // Update registration with orderId
    await prisma.counsellingRegistration.update({
      where: { id: registration.id },
      data: { orderId: razorpayOrder.id },
    });

    return apiResponse({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      transactionId: transaction.id,
      keyId: RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    console.error("Counselling payment creation error:", err);
    return apiError("Internal server error", 500);
  }
}
