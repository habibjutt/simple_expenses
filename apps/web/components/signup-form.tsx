"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signUp, signIn, sendVerificationEmail } from "@/lib/auth-client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Mail, CheckCircle2, RefreshCw } from "lucide-react";

const RESEND_COOLDOWN_SECONDS = 60;

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Email-sent success state
  const [emailSent, setEmailSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState("");

  // Resend cooldown
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState("");
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const startCooldown = () => {
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleEmailPasswordSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      await signUp.email(
        {
          email,
          password,
          name,
          callbackURL: "/onboarding",
        },
        {
          onSuccess: () => {
            setSentToEmail(email);
            setEmailSent(true);
            startCooldown();
          },
          onError: (ctx) => {
            setError(ctx.error.message || "Signup failed");
          },
        },
      );
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setLoading(true);

    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/onboarding",
      });
    } catch {
      setError("Google signup failed");
      setLoading(false);
    }
  };

  const handleGitHubSignup = async () => {
    setError("");
    setLoading(true);

    try {
      await signIn.social({
        provider: "github",
        callbackURL: "/onboarding",
      });
    } catch {
      setError("GitHub signup failed");
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0 || resendLoading) return;

    setResendLoading(true);
    setResendSuccess(false);
    setResendError("");

    try {
      await sendVerificationEmail(
        {
          email: sentToEmail,
          callbackURL: "/onboarding",
        },
        {
          onSuccess: () => {
            setResendSuccess(true);
            startCooldown();
          },
          onError: (ctx) => {
            const message = ctx.error.message || "Failed to resend email";
            if (
              ctx.error.status === 429 ||
              message.toLowerCase().includes("rate limit") ||
              message.toLowerCase().includes("too many")
            ) {
              setResendError(
                "Too many requests. Please wait a minute before trying again.",
              );
            } else {
              setResendError(message);
            }
          },
        },
      );
    } catch {
      setResendError("Failed to resend. Please try again later.");
    } finally {
      setResendLoading(false);
    }
  };

  if (emailSent) {
    return (
      <Card {...props}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <Mail className="h-7 w-7 text-green-600" aria-hidden="true" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Check your inbox</h2>
              <p className="text-sm text-muted-foreground">
                If this email is registered, we&apos;ve sent a verification link
                to
              </p>
              <p className="text-sm font-medium">{sentToEmail}</p>
            </div>

            <p className="text-sm text-muted-foreground max-w-xs">
              Click the link in that email to verify your account and get
              started. Check your spam folder if you don&apos;t see it.
            </p>

            <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 w-full">
              <p className="font-medium">Already have an account?</p>
              <p className="mt-1 text-amber-700">
                If you&apos;ve signed up before, no new verification email will
                be sent. Please sign in instead.
              </p>
            </div>

            {resendSuccess && (
              <div
                className="flex items-center gap-2 rounded-md bg-green-50 px-4 py-2.5 text-sm text-green-800 w-full"
                role="status"
                aria-live="polite"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                Verification email resent successfully.
              </div>
            )}

            {resendError && (
              <div
                className="rounded-md bg-red-50 px-4 py-2.5 text-sm text-red-800 w-full"
                role="alert"
                aria-live="assertive"
              >
                {resendError}
              </div>
            )}

            <div className="flex flex-col gap-2 w-full pt-2">
              <Button asChild className="w-full">
                <Link href="/login">Sign in to your account</Link>
              </Button>

              <Button
                variant="outline"
                onClick={handleResendEmail}
                disabled={resendCooldown > 0 || resendLoading}
                className="w-full"
                aria-label={
                  resendCooldown > 0
                    ? `Resend available in ${resendCooldown} seconds`
                    : "Resend verification email"
                }
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${resendLoading ? "animate-spin" : ""}`}
                  aria-hidden="true"
                />
                {resendLoading
                  ? "Sending…"
                  : resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend verification email"}
              </Button>
            </div>

            <p className="text-sm text-muted-foreground pt-2">
              Want to use a different email?{" "}
              <button
                type="button"
                onClick={() => {
                  setEmailSent(false);
                  setSentToEmail("");
                  setResendSuccess(false);
                  setResendError("");
                  setResendCooldown(0);
                  if (cooldownRef.current) clearInterval(cooldownRef.current);
                }}
                className="underline underline-offset-4 hover:no-underline hover:text-primary"
              >
                Try again
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div
            className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}
        <form onSubmit={handleEmailPasswordSignup} noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                autoComplete="name"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
              />
              <FieldDescription>
                We&apos;ll use this to contact you. We will not share your email
                with anyone else.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="new-password"
              />
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="new-password"
              />
              <FieldDescription>Please confirm your password.</FieldDescription>
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Creating Account…" : "Create Account"}
                </Button>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>

        <div className="relative my-4" aria-hidden="true">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background px-2 text-muted-foreground">
              Or sign up with
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            type="button"
            className="w-full"
            onClick={handleGitHubSignup}
            disabled={loading}
            aria-label="Sign up with GitHub"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.603-3.369-1.343-3.369-1.343-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.544 2.914 1.186.092-.923.35-1.544.636-1.9-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.817c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.137 18.191 20 14.446 20 10.017 20 4.484 15.522 0 10 0z"
                clipRule="evenodd"
              />
            </svg>
            {loading ? "Signing up…" : "Sign up with GitHub"}
          </Button>

          <Button
            variant="outline"
            type="button"
            className="w-full"
            onClick={handleGoogleSignup}
            disabled={loading}
            aria-label="Sign up with Google"
          >
            <svg
              className="mr-2 h-4 w-4"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {loading ? "Signing up…" : "Sign up with Google"}
          </Button>
        </div>

        <p className="text-center mt-8 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="underline underline-offset-4 hover:no-underline hover:text-primary"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
