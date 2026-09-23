import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const pageLinkClass =
  "inline-flex h-11 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-medium text-foreground transition-colors hover:border-[#1a9e5c]/40 hover:text-[#1a9e5c]";

export function BlogPagination({
  page,
  pages,
  basePath,
}: {
  page: number;
  pages: number;
  basePath: string;
}) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 mt-14">
      {page > 1 && (
        <Link href={`${basePath}?page=${page - 1}`} className={pageLinkClass}>
          <ArrowLeft className="w-3.5 h-3.5" /> Previous
        </Link>
      )}
      <span className="text-sm text-muted-foreground">
        Page {page} of {pages}
      </span>
      {page < pages && (
        <Link href={`${basePath}?page=${page + 1}`} className={pageLinkClass}>
          Next <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}

const CTA_POINTS = [
  "Budgets in AED by category",
  "Alerts before you overspend",
  "No bank login needed",
];

/** Sign-up banner shown at the bottom of blog pages. */
export function BlogCtaBanner() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
      <div className="relative overflow-hidden rounded-3xl bg-[#0f5c37] px-6 py-12 sm:px-12 sm:py-14 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#1a9e5c]/60 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl"
        />
        <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-balance">
              Put these tips to work with your own numbers
            </h2>
            <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6">
              {CTA_POINTS.map((point) => (
                <li
                  key={point}
                  className="inline-flex items-center gap-2 text-sm text-white/85"
                >
                  <Check className="h-4 w-4 text-emerald-300" strokeWidth={2.5} />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-[#0f5c37] transition-transform hover:-translate-y-0.5"
            >
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/features"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              See features
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
