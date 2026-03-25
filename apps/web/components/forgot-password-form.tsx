"use client";

import { cn } from "@/lib/utils";
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
import { requestPasswordReset } from "@/lib/auth-client";
import { useState } from "react";
import Link from "next/link";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await requestPasswordReset(
        {
          email,
          redirectTo: `${window.location.origin}/reset-password`,
        },
        {
          onSuccess: () => {
            setSubmitted(true);
          },
          onError: (ctx) => {
            setError(ctx.error.message || "Something went wrong");
          },
        },
      );
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Forgot your password?</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-800">
              <p className="font-medium">Check your inbox</p>
              <p className="mt-1">
                If an account with <strong>{email}</strong> exists, we&apos;ve
                sent a password reset link. It expires in 1 hour.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <FieldGroup>
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
                    />
                    <FieldDescription>
                      Enter the email address associated with your account.
                    </FieldDescription>
                  </Field>
                  <Field>
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? "Sending..." : "Send reset link"}
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            </>
          )}
          <FieldDescription className="text-center mt-4">
            Remember your password?{" "}
            <Link
              href="/login"
              className="underline underline-offset-4 hover:no-underline"
            >
              Back to login
            </Link>
          </FieldDescription>
        </CardContent>
      </Card>
    </div>
  );
}
