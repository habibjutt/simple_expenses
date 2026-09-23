import { slugify } from "@/lib/slugify";

const WORDS_PER_MINUTE = 220;

/** Estimated reading time in whole minutes for stored blog HTML. */
export function readingMinutes(html: string): number {
  const words = html
    .replace(/<[^>]*>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export type TocItem = { id: string; text: string };

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&#x27;": "'",
  "&nbsp;": " ",
};

function htmlToText(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&(amp|lt|gt|quot|nbsp|#39|#x27);/g, (m) => ENTITIES[m])
    .trim();
}

/**
 * Adds an `id` to every <h2> in sanitized blog HTML and returns the headings
 * for a table of contents. Runs at render time because the sanitizer strips
 * ids from stored content.
 */
export function withHeadingAnchors(html: string): {
  html: string;
  toc: TocItem[];
} {
  const toc: TocItem[] = [];
  const used = new Set<string>();

  const out = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, inner: string) => {
    const text = htmlToText(inner);
    const base = slugify(text) || "section";
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    toc.push({ id, text });
    return `<h2 id="${id}">${inner}</h2>`;
  });

  return { html: out, toc };
}
