"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { Bell, X, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  getUpcomingBills,
  dismissNotification,
  dismissAllNotifications,
  type UpcomingBill,
} from "@/app/api/notification-action";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export function NotificationsBell() {
  const [bills, setBills] = useState<UpcomingBill[]>([]);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const fetchBills = useCallback(async () => {
    try {
      const data = await getUpcomingBills();
      setBills(data);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching data on mount is a valid pattern
    fetchBills();
  }, [fetchBills]);

  const handleDismissOne = useCallback(
    (bill: UpcomingBill) => {
      // Optimistic: remove immediately from UI
      setBills((prev) => prev.filter((b) => b.notificationKey !== bill.notificationKey));
      startTransition(async () => {
        await dismissNotification(bill.notificationKey);
      });
    },
    [],
  );

  const handleDismissAll = useCallback(() => {
    const keys = bills.map((b) => b.notificationKey);
    // Optimistic: clear immediately
    setBills([]);
    startTransition(async () => {
      await dismissAllNotifications(keys);
    });
  }, [bills]);

  const count = bills.length;

  const urgencyColor = (days: number) => {
    if (days <= 2) return "text-red-600 bg-red-50";
    if (days <= 5) return "text-orange-600 bg-orange-50";
    return "text-yellow-700 bg-yellow-50";
  };

  const urgencyLabel = (days: number) => {
    if (days === 0) return "Due today!";
    if (days === 1) return "Due tomorrow!";
    return `Due in ${days} days`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-white/70 hover:text-white hover:bg-white/10 relative"
          title="Upcoming bills"
        >
          <Bell className="h-4 w-4" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b border-slate-100 flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Upcoming Bills
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Due in the next 14 days
            </p>
          </div>
          {count > 0 && (
            <button
              onClick={handleDismissAll}
              disabled={isPending}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors shrink-0 mt-0.5"
              title="Mark all as read"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {count === 0 ? (
          <div className="p-6 text-center">
            <Bell className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No bills due soon</p>
            <p className="text-xs text-slate-400 mt-1">
              You&apos;re all caught up!
            </p>
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto">
            {bills.map((bill) => (
              <div
                key={bill.cardId}
                className="p-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {bill.cardName}
                    </p>
                    <p className="text-base font-bold text-slate-900 mt-0.5">
                      {formatCurrency(bill.totalAmount, bill.currency)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${urgencyColor(bill.daysUntilDue)}`}
                    >
                      {urgencyLabel(bill.daysUntilDue)}
                    </span>
                    <button
                      onClick={() => handleDismissOne(bill)}
                      disabled={isPending}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-all"
                      title="Mark as read"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Due{" "}
                  {bill.paymentDueDate.toLocaleDateString("en-AE", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <Link
                  href={`/credit-card/${bill.cardId}`}
                  onClick={() => setOpen(false)}
                  className="text-xs text-[#1a9e5c] font-medium mt-1 inline-block hover:underline"
                >
                  View card →
                </Link>
              </div>
            ))}
          </div>
        )}

        <div className="p-2 border-t border-slate-100">
          <Link
            href="/manage-cards"
            onClick={() => setOpen(false)}
            className="block text-center text-xs text-slate-500 hover:text-[#1a9e5c] py-1 transition-colors"
          >
            Manage all cards
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
