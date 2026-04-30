import nodemailer from "nodemailer";
import { Resend } from "resend";
import { env } from "@/lib/env";

// ─── Lazy provider instances ──────────────────────────────────────────────────

let _smtp: nodemailer.Transporter | null = null;
let _resend: Resend | null = null;

function getSmtp(): nodemailer.Transporter {
  if (!_smtp) {
    if (!env.SMTP_HOST) {
      throw new Error(
        "[email] SMTP_HOST is required when EMAIL_PROVIDER=smtp",
      );
    }
    _smtp = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth:
        env.SMTP_USER && env.SMTP_PASS
          ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
          : undefined,
      connectionTimeout: 10_000,
      socketTimeout: 15_000,
    });
  }
  return _smtp;
}

function getResend(): Resend {
  if (!_resend) {
    if (!env.RESEND_API_KEY) {
      throw new Error(
        "[email] RESEND_API_KEY is required when EMAIL_PROVIDER=resend",
      );
    }
    _resend = new Resend(env.RESEND_API_KEY);
  }
  return _resend;
}

// ─── Unified send helper ──────────────────────────────────────────────────────

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<string> {
  if (env.EMAIL_PROVIDER === "resend") {
    console.log(`[email] Resend → sending "${subject}" to ${to} from ${env.EMAIL_FROM}`);
    const response = await getResend().emails.send({
      from: `Fixpenses <${env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
    console.log(`[email] Resend raw response:`, JSON.stringify(response));
    const { data, error } = response;
    if (error) {
      console.error(`[email] Resend API error:`, JSON.stringify(error));
      throw new Error(`Resend error [${error.name}]: ${error.message}`);
    }
    console.log(`[email] Resend success — id: ${data?.id}`);
    return data?.id ?? "resend";
  }

  console.log(`[email] SMTP → sending "${subject}" to ${to}`);
  const info = await getSmtp().sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
  });
  return info.messageId as string;
}

// ─── Email template wrapper ───────────────────────────────────────────────────

const emailWrapper = (content: string) => `
  <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
    ${content}
    <p style="color:#71717a;font-size:12px;margin-top:32px;border-top:1px solid #e4e4e7;padding-top:16px;">
      Fixpenses · If you didn't request this email, you can safely ignore it.
    </p>
  </div>
`;

// ─── Auth emails ──────────────────────────────────────────────────────────────

export async function sendPasswordResetEmail({
  to,
  url,
}: {
  to: string;
  url: string;
}) {
  try {
    const id = await sendEmail({
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
    console.log(`[email] Password reset email sent to ${to} — id: ${id}`);
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
    const id = await sendEmail({
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
    console.log(`[email] Verification email sent to ${to} — id: ${id}`);
  } catch (err) {
    console.error(`[email] Failed to send verification email to ${to}:`, err);
    throw err;
  }
}

// ─── Subscription lifecycle emails ────────────────────────────────────────────

const appUrl = env.BETTER_AUTH_URL || "http://localhost:3000";

export async function sendTrialStartedEmail({
  to,
  name,
  trialEndsAt,
}: {
  to: string;
  name: string;
  trialEndsAt: Date;
}) {
  const endDateStr = trialEndsAt.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  try {
    const id = await sendEmail({
      to,
      subject: "Welcome to Fixpenses — Your free trial has started!",
      html: emailWrapper(`
        <h2 style="margin-top:0;">Welcome, ${name}! 🎉</h2>
        <p>Your <strong>14-day free trial</strong> is now active. You have full access to all Premium features, including:</p>
        <ul style="color:#3f3f46;line-height:1.8;">
          <li>Unlimited credit cards &amp; bank accounts</li>
          <li>Unlimited transactions</li>
          <li>CSV &amp; PDF exports</li>
          <li>Goals, spending limits &amp; reports</li>
        </ul>
        <p>Your trial ends on <strong>${endDateStr}</strong>.</p>
        <p style="margin: 24px 0;">
          <a href="${appUrl}/dashboard" style="background:#18181b;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
            Go to Dashboard
          </a>
        </p>
      `),
    });
    console.log(`[email] Trial started email sent to ${to} — id: ${id}`);
  } catch (err) {
    console.error(`[email] Failed to send trial started email to ${to}:`, err);
  }
}

export async function sendTrialExpiringEmail({
  to,
  name,
  daysLeft,
  trialEndsAt,
}: {
  to: string;
  name: string;
  daysLeft: number;
  trialEndsAt: Date;
}) {
  const endDateStr = trialEndsAt.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const daysWord = daysLeft === 1 ? "1 day" : `${daysLeft} days`;
  try {
    const id = await sendEmail({
      to,
      subject: `Your free trial ends in ${daysWord}`,
      html: emailWrapper(`
        <h2 style="margin-top:0;">Your trial is ending soon ⏰</h2>
        <p>Hi ${name},</p>
        <p>Your Fixpenses free trial expires on <strong>${endDateStr}</strong> — that's only <strong>${daysWord}</strong> away.</p>
        <p>After the trial ends, your account will revert to the Free plan with limited features. Upgrade now to keep your premium access.</p>
        <p style="margin: 24px 0;">
          <a href="${appUrl}/billing" style="background:#18181b;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
            Upgrade now
          </a>
        </p>
        <p style="color:#71717a;font-size:13px;">
          <strong>Free plan limits:</strong> 1 credit card, 1 bank account, 100 transactions/month, no exports.
        </p>
      `),
    });
    console.log(
      `[email] Trial expiring email sent to ${to} (${daysWord} left) — id: ${id}`,
    );
  } catch (err) {
    console.error(`[email] Failed to send trial expiring email to ${to}:`, err);
  }
}

export async function sendSubscriptionActivatedEmail({
  to,
  name,
  planName,
}: {
  to: string;
  name: string;
  planName: string;
}) {
  try {
    const id = await sendEmail({
      to,
      subject: `You're now on the ${planName} plan!`,
      html: emailWrapper(`
        <h2 style="margin-top:0;">Subscription confirmed ✅</h2>
        <p>Hi ${name},</p>
        <p>Your <strong>${planName}</strong> subscription is now active. Thank you for supporting Fixpenses!</p>
        <p>You can manage your subscription, update your payment method, or download invoices anytime from the billing page.</p>
        <p style="margin: 24px 0;">
          <a href="${appUrl}/billing" style="background:#18181b;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
            Manage billing
          </a>
        </p>
      `),
    });
    console.log(
      `[email] Subscription activated email sent to ${to} — id: ${id}`,
    );
  } catch (err) {
    console.error(
      `[email] Failed to send subscription activated email to ${to}:`,
      err,
    );
  }
}

export async function sendSubscriptionCancelledEmail({
  to,
  name,
  endsAt,
}: {
  to: string;
  name: string;
  endsAt: Date | null;
}) {
  const endInfo = endsAt
    ? `Your premium access remains active until <strong>${endsAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</strong>. After that, your account will switch to the Free plan.`
    : "Your account has been switched to the Free plan.";
  try {
    const id = await sendEmail({
      to,
      subject: "Your subscription has been cancelled",
      html: emailWrapper(`
        <h2 style="margin-top:0;">Subscription cancelled</h2>
        <p>Hi ${name},</p>
        <p>We're sorry to see you go. Your Fixpenses subscription has been cancelled.</p>
        <p>${endInfo}</p>
        <p>You can resubscribe anytime to regain full access.</p>
        <p style="margin: 24px 0;">
          <a href="${appUrl}/billing" style="background:#18181b;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
            Resubscribe
          </a>
        </p>
      `),
    });
    console.log(
      `[email] Subscription cancelled email sent to ${to} — id: ${id}`,
    );
  } catch (err) {
    console.error(
      `[email] Failed to send subscription cancelled email to ${to}:`,
      err,
    );
  }
}

export async function sendPaymentFailedEmail({
  to,
  name,
}: {
  to: string;
  name: string;
}) {
  try {
    const id = await sendEmail({
      to,
      subject: "⚠️ Payment failed — action required",
      html: emailWrapper(`
        <h2 style="margin-top:0;">Payment failed</h2>
        <p>Hi ${name},</p>
        <p>We were unable to process your latest subscription payment. Please update your payment method to avoid interruption to your service.</p>
        <p>Stripe will automatically retry the charge, but if the issue persists your subscription may be cancelled.</p>
        <p style="margin: 24px 0;">
          <a href="${appUrl}/billing" style="background:#dc2626;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
            Update payment method
          </a>
        </p>
      `),
    });
    console.log(`[email] Payment failed email sent to ${to} — id: ${id}`);
  } catch (err) {
    console.error(`[email] Failed to send payment failed email to ${to}:`, err);
  }
}

// ─── Bill due reminder ────────────────────────────────────────────────────────

export async function sendBillDueReminderEmail({
  to,
  userName,
  cardName,
  dueDate,
  totalAmount,
  currency,
  daysUntilDue,
}: {
  to: string;
  userName: string;
  cardName: string;
  dueDate: Date;
  totalAmount: number;
  currency: string;
  daysUntilDue: number;
}) {
  const dueDateStr = dueDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const amountStr = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalAmount);
  const daysLabel =
    daysUntilDue === 0
      ? "today"
      : daysUntilDue === 1
        ? "tomorrow"
        : `in ${daysUntilDue} days`;
  const urgencyColor = daysUntilDue === 0 ? "#dc2626" : daysUntilDue <= 2 ? "#d97706" : "#18181b";

  try {
    const id = await sendEmail({
      to,
      subject: `💳 Bill payment due ${daysLabel} — ${cardName}`,
      html: emailWrapper(`
        <h2 style="margin-top:0;">Bill payment reminder 💳</h2>
        <p>Hi ${userName},</p>
        <p>Your credit card bill for <strong>${cardName}</strong> is due <strong style="color:${urgencyColor};">${daysLabel}</strong> on <strong>${dueDateStr}</strong>.</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#f9fafb;border-radius:10px;overflow:hidden;">
          <tr>
            <td style="padding:14px 18px;font-size:13px;color:#71717a;border-bottom:1px solid #e4e4e7;">Card</td>
            <td style="padding:14px 18px;font-size:13px;font-weight:600;color:#18181b;border-bottom:1px solid #e4e4e7;text-align:right;">${cardName}</td>
          </tr>
          <tr>
            <td style="padding:14px 18px;font-size:13px;color:#71717a;">Amount due</td>
            <td style="padding:14px 18px;font-size:15px;font-weight:700;color:${urgencyColor};text-align:right;">${amountStr}</td>
          </tr>
        </table>
        <p style="margin: 24px 0;">
          <a href="${appUrl}/invoices" style="background:#18181b;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
            View invoice &amp; pay
          </a>
        </p>
        <p style="color:#71717a;font-size:13px;">
          You can adjust how many days before the due date you receive these reminders in your
          <a href="${appUrl}/settings" style="color:#18181b;">account settings</a>.
        </p>
      `),
    });
    console.log(`[email] Bill due reminder sent to ${to} (${cardName}, due ${daysLabel}) — id: ${id}`);
  } catch (err) {
    console.error(`[email] Failed to send bill due reminder to ${to}:`, err);
    throw err;
  }
}

export async function sendSubscriptionRenewedEmail({
  to,
  name,
  planName,
  nextBillingDate,
}: {
  to: string;
  name: string;
  planName: string;
  nextBillingDate: Date | null;
}) {
  const nextDateStr = nextBillingDate
    ? nextBillingDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "your next billing cycle";
  try {
    const id = await sendEmail({
      to,
      subject: `Payment received — ${planName} subscription renewed`,
      html: emailWrapper(`
        <h2 style="margin-top:0;">Payment received 🧾</h2>
        <p>Hi ${name},</p>
        <p>Your <strong>${planName}</strong> subscription has been successfully renewed. Thank you for your continued support!</p>
        <p>Next billing date: <strong>${nextDateStr}</strong>.</p>
        <p style="margin: 24px 0;">
          <a href="${appUrl}/billing" style="background:#18181b;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
            View billing
          </a>
        </p>
      `),
    });
    console.log(
      `[email] Subscription renewed email sent to ${to} — id: ${id}`,
    );
  } catch (err) {
    console.error(
      `[email] Failed to send subscription renewed email to ${to}:`,
      err,
    );
  }
}
