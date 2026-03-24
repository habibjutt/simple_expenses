import nodemailer from "nodemailer";
import { env } from "@/lib/env";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth:
    env.SMTP_USER && env.SMTP_PASS
      ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
      : undefined,
  // Increase timeout for slow SMTP hosts
  connectionTimeout: 10_000,
  socketTimeout: 15_000,
});

// Verify SMTP connection on module load so misconfiguration surfaces immediately
transporter.verify().then(() => {
  console.log("[email] SMTP connection verified ✓");
}).catch((err: unknown) => {
  console.error(
    "[email] SMTP connection FAILED — check SMTP_HOST / SMTP_PORT / credentials:",
    err,
  );
});

const emailWrapper = (content: string) => `
  <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
    ${content}
    <p style="color:#71717a;font-size:12px;margin-top:32px;border-top:1px solid #e4e4e7;padding-top:16px;">
      Simple Expenses · If you didn't request this email, you can safely ignore it.
    </p>
  </div>
`;

export async function sendPasswordResetEmail({
  to,
  url,
}: {
  to: string;
  url: string;
}) {
  try {
    const info = await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject: "Reset your password",
      html: emailWrapper(`
        <h2 style="margin-top:0;">Reset your password</h2>
        <p>We received a request to reset the password for your account.</p>
        <p>Click the button below to choose a new password. This link expires in 1 hour.</p>
        <p style="margin: 24px 0;">
          <a href="${url}" style="background:#18181b;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
            Reset password
          </a>
        </p>
        <p style="color:#71717a;font-size:13px;">
          Or copy and paste this URL into your browser:<br/>
          <a href="${url}" style="color:#18181b;">${url}</a>
        </p>
      `),
    });
    console.log(`[email] Password reset email sent to ${to} — messageId: ${info.messageId}`);
  } catch (err) {
    console.error(`[email] Failed to send password reset email to ${to}:`, err);
    throw err;
  }
}

export async function sendVerificationEmail({
  to,
  url,
}: {
  to: string;
  url: string;
}) {
  try {
    const info = await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject: "Verify your email address",
      html: emailWrapper(`
        <h2 style="margin-top:0;">Verify your email</h2>
        <p>Thanks for signing up! Please verify your email address to get started.</p>
        <p style="margin: 24px 0;">
          <a href="${url}" style="background:#1a9e5c;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
            Verify email address
          </a>
        </p>
        <p style="color:#71717a;font-size:13px;">
          Or copy and paste this URL into your browser:<br/>
          <a href="${url}" style="color:#18181b;">${url}</a>
        </p>
      `),
    });
    console.log(`[email] Verification email sent to ${to} — messageId: ${info.messageId}`);
  } catch (err) {
    console.error(`[email] Failed to send verification email to ${to}:`, err);
    throw err;
  }
}
