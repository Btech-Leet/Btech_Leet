import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "noreply@btechleet.in";
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "BTech LEET";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://btechleet.in";

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const link = `${APP_URL}/auth/verify-email?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Verify your email – ${APP_NAME}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #0f172a; font-size: 24px; font-weight: 700; margin: 0;">${APP_NAME}</h1>
          <p style="color: #64748b; font-size: 14px; margin: 8px 0 0;">LEET Exam Platform</p>
        </div>
        <div style="background: #f8fafc; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
          <h2 style="color: #0f172a; font-size: 20px; margin: 0 0 12px;">Hello, ${name}!</h2>
          <p style="color: #475569; line-height: 1.6; margin: 0 0 24px;">Please verify your email address to complete your registration and access all features of ${APP_NAME}.</p>
          <a href="${link}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">Verify Email</a>
          <p style="color: #94a3b8; font-size: 13px; margin: 20px 0 0;">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const link = `${APP_URL}/auth/reset-password?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Reset your password – ${APP_NAME}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #0f172a; font-size: 24px; font-weight: 700; margin: 0;">${APP_NAME}</h1>
        </div>
        <div style="background: #f8fafc; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
          <h2 style="color: #0f172a; font-size: 20px; margin: 0 0 12px;">Password Reset</h2>
          <p style="color: #475569; line-height: 1.6; margin: 0 0 24px;">Hi ${name}, we received a request to reset your password. Click below to set a new password.</p>
          <a href="${link}" style="display: inline-block; background: #dc2626; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">Reset Password</a>
          <p style="color: #94a3b8; font-size: 13px; margin: 20px 0 0;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
      </div>
    `,
  });
}

export async function sendNotificationEmail(
  to: string[],
  subject: string,
  content: string
) {
  await resend.emails.send({
    from: FROM,
    to: to.length === 1 ? to[0] : FROM,
    bcc: to.length > 1 ? to : undefined,
    subject,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #0f172a; font-size: 20px;">${APP_NAME} – ${subject}</h1>
        <div style="color: #475569; line-height: 1.7;">${content}</div>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">© ${new Date().getFullYear()} ${APP_NAME}</p>
      </div>
    `,
  });
}
