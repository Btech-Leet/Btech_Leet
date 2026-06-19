import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY || "");
  }
  return _resend;
}
const FROM = process.env.RESEND_FROM_EMAIL || "noreply@btechleet.com";
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "BTech LEET";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://btechleet.com";

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const link = `${APP_URL}/auth/verify-email?token=${token}`;

  const { data, error } = await getResend().emails.send({
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

  if (error) {
    throw new Error(`Resend verification email error: ${error.message} (Type: ${error.name})`);
  }
  return data;
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const link = `${APP_URL}/auth/reset-password?token=${token}`;

  const { data, error } = await getResend().emails.send({
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

  if (error) {
    throw new Error(`Resend password reset email error: ${error.message} (Type: ${error.name})`);
  }
  return data;
}

export async function sendNotificationEmail(
  to: string[],
  subject: string,
  content: string
) {
  const { data, error } = await getResend().emails.send({
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

  if (error) {
    throw new Error(`Resend notification email error: ${error.message} (Type: ${error.name})`);
  }
  return data;
}

export async function sendWelcomeEmail(email: string) {
  const { data, error } = await getResend().emails.send({
    from: FROM,
    to: email,
    subject: `Welcome to the ${APP_NAME} Newsletter!`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #0f172a; font-size: 24px; font-weight: 700; margin: 0;">${APP_NAME}</h1>
          <p style="color: #64748b; font-size: 14px; margin: 8px 0 0;">LEET Exam Platform</p>
        </div>
        <div style="background: #f8fafc; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
          <h2 style="color: #0f172a; font-size: 20px; margin: 0 0 12px;">Thanks for subscribing!</h2>
          <p style="color: #475569; line-height: 1.6; margin: 0 0 24px;">You have successfully subscribed to the ${APP_NAME} newsletter. We will send you updates, study tips, and exam alerts directly to your inbox.</p>
          <p style="color: #94a3b8; font-size: 13px; margin: 20px 0 0;">If you ever want to unsubscribe, you can do so by clicking the link in any of our emails or contacting support.</p>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend welcome email error: ${error.message} (Type: ${error.name})`);
  }
  return data;
}

export async function sendCounsellingEmail(email: string, name: string) {
  const { data, error } = await getResend().emails.send({
    from: FROM,
    to: email,
    subject: `Counselling Registration Successful – ${APP_NAME}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #2563eb; font-size: 28px; font-weight: 800; margin: 0;">${APP_NAME}</h1>
          <p style="color: #64748b; font-size: 14px; margin: 8px 0 0;">Expert Counselling Services</p>
        </div>
        <div style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; margin-bottom: 24px;">
          <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 0 0 8px;">Thank You, ${name}!</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0;">
            Your registration for the Premium LEET Counselling program has been successfully processed! We are extremely thrilled to help you guide through your lateral entry admission process and secure a seat in your dream college.
          </p>
        </div>
        <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #f1f5f9;">
          <h3 style="color: #0f172a; font-size: 16px; font-weight: 700; margin: 0 0 12px;">Your Personal Point of Contact</h3>
          <p style="color: #475569; font-size: 14px; margin: 0 0 8px; line-height: 1.5;">
            Our expert counselling lead, <strong>Nishant</strong>, has been assigned to personally monitor and curate your choice lists, choice filling strategy, and document verification.
          </p>
          <p style="color: #0f172a; font-size: 15px; font-weight: 600; margin: 12px 0 4px;">
             Nishant (Counselling Expert)
          </p>
          <p style="color: #2563eb; font-size: 15px; font-weight: 700; margin: 0;">
            Mobile / WhatsApp: <a href="tel:+917988316241" style="color: #2563eb; text-decoration: none;">+91 7988316241</a>
          </p>
        </div>
        <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
          We are always here to support you at every phase of choice locking, document verification, and seat allotment rounds. You will receive a callback within the next 24 hours.
        </p>
        <div style="text-align: center; border-top: 1px solid #f1f5f9; padding-top: 24px;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend counselling email error: ${error.message}`);
  }
  return data;
}
