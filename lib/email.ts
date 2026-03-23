import { Resend } from "resend";
import { env } from "@/lib/env";

const resend = new Resend(env.RESEND_API_KEY ?? "");

const FROM_ADDRESS = env.EMAIL_FROM;

export async function sendPasswordResetEmail({
  to,
  url,
}: {
  to: string;
  url: string;
}) {
  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Reset your password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>We received a request to reset the password for your account.</p>
        <p>Click the button below to choose a new password. This link expires in 1 hour.</p>
        <p style="margin: 24px 0;">
          <a href="${url}" style="background:#18181b;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
            Reset password
          </a>
        </p>
        <p style="color:#71717a;font-size:13px;">
          If you didn't request this, you can safely ignore this email. Your password won't change.
        </p>
        <p style="color:#71717a;font-size:13px;">
          Or copy and paste this URL into your browser:<br/>
          <a href="${url}" style="color:#18181b;">${url}</a>
        </p>
      </div>
    `,
  });
}
