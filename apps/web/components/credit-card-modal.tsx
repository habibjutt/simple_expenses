"use client";

import React, { useState, useEffect } from "react";
import {
  createCreditCard,
  updateCreditCard,
} from "@/app/api/credit-card-action";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Field } from "./ui/field";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import PlanLimitAlert from "./PlanLimitAlert";
import type { GuardResult } from "@/lib/plan-guards";

type CreditCard = {
  id: string;
  name: string;
  billGenerationDate: number;
  paymentDate: number;
  cardLimit: number;
  availableBalance: number;
  currency: string;
};

export default function CreditCardModal({
  open,
  setOpen,
  onSuccess,
  editCard,
  preferredCurrency = "AED",
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  onSuccess?: () => void;
  editCard?: CreditCard | null;
  preferredCurrency?: string;
}) {
  const [name, setName] = useState("");
  const [billGenerationDate, setBillGenerationDate] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [cardLimit, setCardLimit] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planAlert, setPlanAlert] = useState<GuardResult | null>(null);

  useEffect(() => {
    if (editCard) {
      setName(editCard.name);
      setBillGenerationDate(editCard.billGenerationDate.toString());
      setPaymentDate(editCard.paymentDate.toString());
      setCardLimit(editCard.cardLimit.toString());
    } else {
      setName("");
      setBillGenerationDate("");
      setPaymentDate("");
      setCardLimit("");
    }
    setError(null);
    setPlanAlert(null);
  }, [editCard, open]);

  // Currency: preserve existing on edit, use preferred for new cards
  const currency = editCard?.currency ?? preferredCurrency;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPlanAlert(null);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("billGenerationDate", billGenerationDate);
      formData.append("paymentDate", paymentDate);
      formData.append("cardLimit", cardLimit);
      formData.append("currency", currency);

      let result;
      if (editCard) {
        result = await updateCreditCard(editCard.id, formData);
      } else {
        result = await createCreditCard(formData);
      }
      if (result?.error) {
        if (result.planLimitReached) {
          // Show upgrade dialog instead of inline error
          setPlanAlert({
            allowed: false,
            reason: result.error,
            requiredPlan: result.requiredPlan,
          });
          return;
        }
        setError(result.error);
        return;
      }

      setOpen(false);
      setName("");
      setBillGenerationDate("");
      setPaymentDate("");
      setCardLimit("");
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${editCard ? "update" : "create"} credit card`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editCard ? "Edit Credit Card" : "Add Credit Card"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Card Name" required>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Chase Sapphire"
                required
                aria-label="Credit card name"
              />
            </Field>
            <Field label="Bill Generation Date" required>
              <Input
                type="number"
                value={billGenerationDate}
                onChange={(e) => setBillGenerationDate(e.target.value)}
                placeholder="Day of month (1-31)"
                required
                min={1}
                max={31}
                aria-label="Bill generation date"
              />
            </Field>
            <Field label="Payment Due Date" required>
              <Input
                type="number"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                placeholder="Day of month (1-31)"
                required
                min={1}
                max={31}
                aria-label="Payment due date"
              />
            </Field>
            <Field label="Card Limit" required>
              <Input
                type="number"
                value={cardLimit}
                onChange={(e) => setCardLimit(e.target.value)}
                placeholder="Enter card limit"
                required
                min={0}
                step="0.01"
                aria-label="Card limit"
              />
            </Field>
            <p className="text-xs text-slate-500">
              Currency:{" "}
              <span className="font-medium text-slate-700">{currency}</span>
            </p>
            {error && (
              <div className="text-red-500 text-sm" role="alert">
                {error}
              </div>
            )}
            <DialogFooter>
              <Button type="submit" variant="default" disabled={loading}>
                {loading
                  ? editCard
                    ? "Updating..."
                    : "Adding..."
                  : editCard
                    ? "Update Card"
                    : "Add Card"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {planAlert && (
        <PlanLimitAlert
          open={!!planAlert}
          onClose={() => {
            setPlanAlert(null);
            setOpen(false);
          }}
          limitType="creditCard"
          guardResult={planAlert}
        />
      )}
    </>
  );
}
