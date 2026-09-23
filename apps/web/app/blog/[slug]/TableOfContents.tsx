"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ListOrdered } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TocItem } from "@/lib/blog";

/** Tracks which heading was last scrolled past the sticky nav. */
function useActiveHeading(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    const headings = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const onScroll = () => {
      // 120px ≈ sticky nav + breathing room, matching scroll-margin-top.
      let current = headings[0].id;
      for (const el of headings) {
        if (el.getBoundingClientRect().top <= 120) current = el.id;
        else break;
      }
      setActive(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ids]);

  return active;
}

function TocLinks({
  items,
  active,
  onNavigate,
}: {
  items: TocItem[];
  active?: string;
  onNavigate?: () => void;
}) {
  return (
    <ol className="space-y-0.5 border-l border-border">
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={onNavigate}
              aria-current={isActive ? "location" : undefined}
              className={cn(
                "-ml-px block border-l-2 py-1.5 pl-4 pr-2 text-sm leading-snug transition-colors",
                isActive
                  ? "border-[#1a9e5c] font-semibold text-[#1a9e5c]"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
              )}
            >
              {item.text}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

export function TocSidebar({ items }: { items: TocItem[] }) {
  const ids = useMemo(() => items.map((i) => i.id), [items]);
  const active = useActiveHeading(ids);
  return (
    <nav aria-label="Table of contents" className="sticky top-24">
      <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-foreground">
        <ListOrdered className="h-3.5 w-3.5 text-[#1a9e5c]" />
        On this page
      </p>
      <div className="max-h-[calc(100vh-9rem)] overflow-y-auto pr-1">
        <TocLinks items={items} active={active} />
      </div>
    </nav>
  );
}

export function TocInline({ items }: { items: TocItem[] }) {
  const [open, setOpen] = useState(false);
  return (
    <nav
      aria-label="Table of contents"
      className="mb-10 rounded-2xl border border-border bg-muted/40"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm font-semibold text-foreground"
      >
        <span className="inline-flex items-center gap-2">
          <ListOrdered className="h-4 w-4 text-[#1a9e5c]" />
          On this page
          <span className="font-normal text-muted-foreground">
            ({items.length} sections)
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="px-5 pb-4">
          <TocLinks items={items} onNavigate={() => setOpen(false)} />
        </div>
      )}
    </nav>
  );
}
