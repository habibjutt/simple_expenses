"use client";

import { type LucideIcon, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  /** Opens a modal or triggers in-page behaviour. */
  onAction?: () => void;
  /** Navigate to another page instead of calling onAction. */
  actionHref?: string;
  /**
   * "button" – filled green button with a Plus icon (default for full-page empty states).
   * "link"   – underlined green text link (default for embedded / compact empty states).
   */
  actionStyle?: "button" | "link";
  /**
   * "md" – full-page empty state (default).
   * "sm" – compact, for use inside dashboard widgets or section cards.
   */
  size?: "sm" | "md";
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  actionStyle = "button",
  size = "md",
  className,
}: EmptyStateProps) {
  const isSmall = size === "sm";
  const hasAction = !!(actionLabel && (onAction ?? actionHref));

  return (
    <div
      className={cn(
        "bg-white rounded-2xl flex flex-col items-center text-center border-2 border-dashed border-slate-200",
        isSmall ? "py-10 px-4" : "py-16 px-4",
        className,
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "rounded-2xl bg-slate-100 flex items-center justify-center",
          isSmall ? "w-12 h-12 mb-3" : "w-16 h-16 mb-4",
        )}
      >
        <Icon
          className={cn("text-slate-400", isSmall ? "h-6 w-6" : "h-8 w-8")}
        />
      </div>

      {/* Title */}
      <p
        className={cn(
          "font-semibold text-slate-700",
          isSmall ? "text-sm" : "text-base",
        )}
      >
        {title}
      </p>

      {/* Description */}
      {description && (
        <p
          className={cn(
            "text-slate-400",
            isSmall ? "text-xs mt-0.5" : "text-sm mt-1",
            hasAction ? (isSmall ? "mb-3" : "mb-5") : "",
          )}
        >
          {description}
        </p>
      )}

      {/* Action — only one of onAction / actionHref is rendered */}
      {hasAction && actionStyle === "button" && onAction && (
        <button
          onClick={onAction}
          className={cn(
            "inline-flex items-center gap-2 bg-[#1a9e5c] text-white rounded-xl font-semibold hover:bg-[#158a4f] transition-colors",
            isSmall ? "px-4 py-2 text-xs" : "px-5 py-2.5 text-sm",
          )}
        >
          <Plus className={isSmall ? "h-3.5 w-3.5" : "h-4 w-4"} />
          {actionLabel}
        </button>
      )}

      {hasAction && actionStyle === "button" && actionHref && (
        <Link
          href={actionHref}
          className={cn(
            "inline-flex items-center gap-2 bg-[#1a9e5c] text-white rounded-xl font-semibold hover:bg-[#158a4f] transition-colors",
            isSmall ? "px-4 py-2 text-xs" : "px-5 py-2.5 text-sm",
          )}
        >
          <Plus className={isSmall ? "h-3.5 w-3.5" : "h-4 w-4"} />
          {actionLabel}
        </Link>
      )}

      {hasAction && actionStyle === "link" && onAction && (
        <button
          onClick={onAction}
          className={cn(
            "text-[#1a9e5c] font-semibold hover:underline",
            isSmall ? "text-xs" : "text-sm",
          )}
        >
          {actionLabel}
        </button>
      )}

      {hasAction && actionStyle === "link" && actionHref && (
        <Link
          href={actionHref}
          className={cn(
            "text-[#1a9e5c] font-semibold hover:underline",
            isSmall ? "text-xs" : "text-sm",
          )}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
