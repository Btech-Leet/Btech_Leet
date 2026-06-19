import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isAuthResponse } from "@/lib/middleware";
import { apiError } from "@/lib/utils";

// GET: Generate a styled HTML invoice for a transaction
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(req);
  if (isAuthResponse(auth)) return auth;

  const { id } = await params;

  const transaction = await prisma.transaction.findFirst({
    where: {
      OR: [
        { id },
        { purchaseItemId: id }
      ]
    },
    include: { user: { select: { name: true, email: true, mobile: true, state: true } } },
  });

  if (!transaction) return apiError("Transaction not found", 404);
  if (transaction.userId !== auth.userId && auth.role !== "ADMIN") {
    return apiError("Unauthorized", 403);
  }
  if (transaction.status !== "SUCCESSFUL") {
    return apiError("Invoice available only for successful transactions", 400);
  }

  const invoiceDate = new Date(transaction.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric"
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${transaction.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0a0a0a; color: #e5e7eb; padding: 40px 20px; }
    .invoice { max-width: 700px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1e40af, #7c3aed); padding: 40px 32px; }
    .header h1 { font-size: 28px; font-weight: 800; color: white; }
    .header p { color: rgba(255,255,255,0.7); font-size: 13px; margin-top: 4px; }
    .badge { display: inline-block; background: rgba(255,255,255,0.15); color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; margin-top: 12px; }
    .body { padding: 32px; }
    .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #1f2937; font-size: 14px; }
    .row:last-child { border-bottom: none; }
    .row .label { color: #9ca3af; font-weight: 500; }
    .row .value { color: #f3f4f6; font-weight: 600; text-align: right; }
    .total-row { background: #0d1117; margin: 24px -32px -32px; padding: 24px 32px; border-top: 2px solid #3b82f6; display: flex; justify-content: space-between; align-items: center; }
    .total-label { font-size: 16px; color: #9ca3af; font-weight: 600; }
    .total-amount { font-size: 28px; font-weight: 800; color: #3b82f6; }
    .footer { text-align: center; padding: 20px; font-size: 11px; color: #6b7280; }
    @media print {
      body { background: white; color: #111; padding: 0; }
      .invoice { border: 1px solid #e5e7eb; box-shadow: none; }
      .header { background: #1e40af !important; -webkit-print-color-adjust: exact; }
      .body .row .label { color: #6b7280; }
      .body .row .value { color: #111; }
      .total-row { background: #f9fafb; }
      .total-amount { color: #1e40af; }
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <h1>LEET</h1>
      <p>BTech Lateral Entry Exam Toolkit</p>
      <div class="badge">INVOICE</div>
    </div>
    <div class="body">
      <div class="row"><span class="label">Invoice Number</span><span class="value">${transaction.invoiceNumber}</span></div>
      <div class="row"><span class="label">Date</span><span class="value">${invoiceDate}</span></div>
      <div class="row"><span class="label">Customer Name</span><span class="value">${transaction.user.name}</span></div>
      <div class="row"><span class="label">Email</span><span class="value">${transaction.user.email}</span></div>
      ${transaction.user.mobile ? `<div class="row"><span class="label">Mobile</span><span class="value">${transaction.user.mobile}</span></div>` : ""}
      ${transaction.user.state ? `<div class="row"><span class="label">State</span><span class="value">${transaction.user.state}</span></div>` : ""}
      <div class="row"><span class="label">Item</span><span class="value">${transaction.purchaseName}</span></div>
      <div class="row"><span class="label">Type</span><span class="value">${transaction.purchaseType}</span></div>
      <div class="row"><span class="label">Order ID</span><span class="value" style="font-size:12px">${transaction.orderId}</span></div>
      <div class="row"><span class="label">Payment ID</span><span class="value" style="font-size:12px">${transaction.paymentId || "—"}</span></div>
      <div class="row"><span class="label">Status</span><span class="value" style="color:#10b981">✓ ${transaction.status}</span></div>
      <div class="total-row">
        <span class="total-label">Amount Paid</span>
        <span class="total-amount">₹${transaction.amount.toLocaleString("en-IN")}</span>
      </div>
    </div>
    <div class="footer">
      This is a computer-generated invoice. No signature required. &copy; ${new Date().getFullYear()} BTech LEET
    </div>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
