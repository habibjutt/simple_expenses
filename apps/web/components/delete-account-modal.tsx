"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { deleteAccount } from "@/app/api/user-action";
import { signOut } from "@/lib/auth-client";

interface DeleteAccountModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  userEmail: string;
}

export default function DeleteAccountModal({
  open,
  setOpen,
  userEmail,
}: DeleteAccountModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = email === userEmail && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email to confirm.");
      return;
    }

    if (email !== userEmail) {
      setError("Email does not match your account.");
      return;
    }

    setLoading(true);

    try {
      const result = await deleteAccount(email);

      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // Account deleted — sign out and redirect to login
      await signOut({ fetchOptions: { onSuccess: () => router.push("/login") } });
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setOpen(false);
      setEmail("");
      setError("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-red-600">
                Delete Account
              </DialogTitle>
              <DialogDescription className="mt-1">
                This action is permanent and cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-2">
          <p className="text-sm font-semibold text-red-800 mb-2">
            ⚠️ Warning — You will permanently lose:
          </p>
          <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
            <li>All credit cards and bank accounts</li>
            <li>All transactions and invoices</li>
            <li>Categories, spending limits, and savings goals</li>
            <li>Your subscription and billing history</li>
            <li>All account data with no possibility of recovery</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <p className="text-sm text-slate-600">
            To confirm, please type your email{" "}
            <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">
              {userEmail}
            </span>{" "}
            below.
          </p>

          <FieldGroup>
            <Field>
              <FieldLabel>Email Address</FieldLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email to confirm"
                disabled={loading}
                autoComplete="off"
              />
            </Field>
          </FieldGroup>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >
              {loading ? "Deleting…" : "Permanently Delete Account"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
