"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { contactSchema } from "@/lib/contact-schema";
import { submitContactEnquiry } from "@/app/api/contact-action";
import type { ContactFormValues } from "@/lib/contact-schema";

type FieldErrors = Partial<Record<keyof ContactFormValues, string>>;

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });

  function set(field: keyof typeof values, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      const errs: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        if (!errs[field]) errs[field] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const result = await submitContactEnquiry(parsed.data);
      if (result.success) {
        setSubmitted(true);
      } else {
        toast.error(result.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-background border border-border rounded-2xl p-8 shadow-sm flex flex-col items-center text-center gap-4 py-16">
        <div className="w-16 h-16 rounded-full bg-[#1a9e5c]/10 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-[#1a9e5c]" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Message sent!</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Thanks for reaching out. Our team will get back to you within one
          business day.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow";
  const errorClass = "text-xs text-destructive mt-1";

  return (
    <div className="bg-background border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
      <h2 className="text-xl font-bold text-foreground mb-6">
        Send us a message
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Name row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="firstName" className="text-sm font-medium text-foreground">
              First name
            </label>
            <input
              id="firstName"
              type="text"
              placeholder="Ahmad"
              value={values.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              className={inputClass}
            />
            {fieldErrors.firstName && <p className={errorClass}>{fieldErrors.firstName}</p>}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="lastName" className="text-sm font-medium text-foreground">
              Last name
            </label>
            <input
              id="lastName"
              type="text"
              placeholder="Al-Mansoori"
              value={values.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              className={inputClass}
            />
            {fieldErrors.lastName && <p className={errorClass}>{fieldErrors.lastName}</p>}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email address
          </label>
          <input
            id="email"
            type="email"
            placeholder="ahmad@example.ae"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            className={inputClass}
          />
          {fieldErrors.email && <p className={errorClass}>{fieldErrors.email}</p>}
        </div>

        {/* Subject */}
        <div className="space-y-1.5">
          <label htmlFor="subject" className="text-sm font-medium text-foreground">
            Subject
          </label>
          <select
            id="subject"
            value={values.subject}
            onChange={(e) => set("subject", e.target.value)}
            className={inputClass}
          >
            <option value="">Select a topic…</option>
            <option value="billing">Billing &amp; Subscription</option>
            <option value="technical">Technical Support</option>
            <option value="feature">Feature Request</option>
            <option value="account">Account Issues</option>
            <option value="privacy">Privacy &amp; Data</option>
            <option value="other">Other</option>
          </select>
          {fieldErrors.subject && <p className={errorClass}>{fieldErrors.subject}</p>}
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <label htmlFor="message" className="text-sm font-medium text-foreground">
            Message
          </label>
          <textarea
            id="message"
            rows={5}
            placeholder="Tell us how we can help you…"
            value={values.message}
            onChange={(e) => set("message", e.target.value)}
            className={`${inputClass} resize-none`}
          />
          {fieldErrors.message && <p className={errorClass}>{fieldErrors.message}</p>}
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="w-full h-12 text-base font-semibold bg-[#1a9e5c] hover:bg-[#158a4f] text-white shadow-lg shadow-[#1a9e5c]/20"
        >
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…</>
          ) : (
            <>Send message <ArrowRight className="ml-2 h-4 w-4" /></>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          By submitting this form you agree to our{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </div>
  );
}

