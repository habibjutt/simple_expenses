// Generates 1200x630 featured images for blog posts (SVG source + JPEG).
// Usage: node scripts/content/make-blog-images.js
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function svg({ eyebrow, line1, line2, sub1, sub2, cardLabel, cardValue, badge, rows, chip1, chip2 }) {
  const rowSvg = rows
    .map(([label, value, pct, color], i) => {
      const y = 240 + i * 58;
      const bar =
        pct == null
          ? ""
          : `<rect x="684" y="${y + 12}" width="402" height="10" rx="5" fill="#f1f5f9"/><rect x="684" y="${y + 12}" width="${Math.round(402 * pct)}" height="10" rx="5" fill="${color || "#1a9e5c"}"/>`;
      return `<text x="684" y="${y}" font-weight="600" fill="#111827">${esc(label)}</text><text x="1086" y="${y}" text-anchor="end" font-weight="700" fill="#111827">${esc(value)}</text>${bar}`;
    })
    .join("");
  const eyW = eyebrow.length * 10.5 + 40;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0a3521"/><stop offset="0.55" stop-color="#0f5c37"/><stop offset="1" stop-color="#1a9e5c"/></linearGradient>
<radialGradient id="glow" cx="0.85" cy="0.15" r="0.6"><stop offset="0" stop-color="#6ee7b7" stop-opacity="0.35"/><stop offset="1" stop-color="#6ee7b7" stop-opacity="0"/></radialGradient>
<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#ffffff" stroke-opacity="0.05"/></pattern>
<filter id="shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#021a0f" flood-opacity="0.45"/></filter>
<filter id="chipShadow" x="-20%" y="-40%" width="140%" height="200%"><feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#021a0f" flood-opacity="0.35"/></filter>
</defs>
<rect width="1200" height="630" fill="url(#bg)"/><rect width="1200" height="630" fill="url(#grid)"/><rect width="1200" height="630" fill="url(#glow)"/>
<circle cx="90" cy="600" r="160" fill="#1a9e5c" opacity="0.25"/>
<g font-family="Segoe UI, Arial, sans-serif">
<rect x="72" y="150" width="${eyW}" height="36" rx="18" fill="#ffffff" fill-opacity="0.12"/>
<text x="${72 + eyW / 2}" y="174" text-anchor="middle" font-size="15" font-weight="700" letter-spacing="2.5" fill="#a7f3d0">${esc(eyebrow)}</text>
<text x="72" y="262" font-size="54" font-weight="800" fill="#ffffff">${esc(line1)}</text>
<text x="72" y="326" font-size="54" font-weight="800" fill="#6ee7b7">${esc(line2)}</text>
<text x="72" y="388" font-size="22" fill="#d1fae5" fill-opacity="0.85">${esc(sub1)}</text>
<text x="72" y="418" font-size="22" fill="#d1fae5" fill-opacity="0.85">${esc(sub2)}</text>
</g>
<g filter="url(#shadow)"><rect x="648" y="92" width="472" height="446" rx="28" fill="#ffffff"/></g>
<g font-family="Segoe UI, Arial, sans-serif">
<text x="684" y="140" font-size="15" font-weight="600" fill="#6b7280">${esc(cardLabel)}</text>
<text x="684" y="180" font-size="32" font-weight="800" fill="#0f172a">${esc(cardValue)}</text>
${badge ? `<rect x="${1086 - badge.length * 8.4 - 24}" y="148" width="${badge.length * 8.4 + 24}" height="32" rx="16" fill="#1a9e5c" fill-opacity="0.12"/><text x="${1086 - (badge.length * 8.4 + 24) / 2}" y="170" text-anchor="middle" font-size="14" font-weight="700" fill="#15803d">${esc(badge)}</text>` : ""}
<line x1="684" y1="204" x2="1086" y2="204" stroke="#e5e7eb"/>
<g font-size="16">${rowSvg}</g>
</g>
<g filter="url(#chipShadow)"><rect x="500" y="504" width="${Math.max(300, chip2.length * 11 + 110)}" height="84" rx="20" fill="#ffffff"/></g>
<g font-family="Segoe UI, Arial, sans-serif">
<circle cx="544" cy="546" r="22" fill="#1a9e5c"/>
<path d="M534 546 l7 7 l13 -14" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
<text x="578" y="538" font-size="15" font-weight="600" fill="#6b7280">${esc(chip1)}</text>
<text x="578" y="565" font-size="20" font-weight="800" fill="#0f172a">${esc(chip2)}</text>
</g>
</svg>`;
}

const posts = {
  "sinking-funds-uae": {
    eyebrow: "BUDGETING GUIDE", line1: "Sinking funds", line2: "for rent & school fees",
    sub1: "Turn big yearly bills into", sub2: "small monthly amounts",
    cardLabel: "Monthly sinking funds", cardValue: "AED 14,800", badge: "On track",
    rows: [["Rent", "8,000", 0.9], ["School fees", "5,000", 0.62, "#0ea5e9"], ["Flights home", "800", 0.45, "#f59e0b"], ["Car", "350", 0.7, "#8b5cf6"], ["Ramadan & Eid", "300", 0.3, "#10b981"]],
    chip1: "Next rent cheque", chip2: "AED 24,000 ready",
  },
  "0-installment-plans-uae": {
    eyebrow: "CREDIT CARDS", line1: "0% installment", line2: "plans: the real cost",
    sub1: "Processing fees, lost rewards", sub2: "and blocked limits, in AED",
    cardLabel: "AED 3,600 laptop, 12 months", cardValue: "AED 300 / month", badge: "0% interest",
    rows: [["Interest", "AED 0", null], ["Processing fee", "AED 51.45", null], ["Cashback you lose", "AED 54.00", null], ["Early settlement fee", "1.05%", null], ["Real cost", "AED 105.45", null]],
    chip1: "Real cost of the plan", chip2: "About 2.9% of the price",
  },
  "tabby-vs-tamara-vs-bank-installments": {
    eyebrow: "BUY NOW, PAY LATER", line1: "Tabby vs Tamara", line2: "vs bank installments",
    sub1: "Fees, late payments and credit", sub2: "limits compared in AED",
    cardLabel: "Same AED 2,400 phone", cardValue: "Paid on time", badge: "Compared",
    rows: [["Tabby Pay in 4", "4 x 600", 1], ["Tamara split in 4", "4 x 600", 1, "#0ea5e9"], ["Bank 0% plan", "12 x 200", 1, "#8b5cf6"], ["Fees (Tabby / Tamara)", "AED 0", null], ["Fees (bank plan)", "about AED 75", null]],
    chip1: "Late on your card?", chip2: "AED 241.50 fee",
  },
  "credit-card-statement-cycle-uae": {
    eyebrow: "CREDIT CARDS", line1: "Credit card billing", line2: "cycle, explained",
    sub1: "Time purchases, pay in full,", sub2: "and never pay interest",
    cardLabel: "Statement 20 Apr, due 15 May", cardValue: "Up to 55 days", badge: "Interest-free",
    rows: [["Bought on 21 March", "55 days", 1], ["Bought on 5 April", "40 days", 0.73, "#0ea5e9"], ["Bought on 19 April", "26 days", 0.47, "#f59e0b"], ["Cash withdrawal", "0 days", 0.02, "#ef4444"]],
    chip1: "Pay the full statement", chip2: "AED 0 interest",
  },
  "best-expense-tracker-apps-uae": {
    eyebrow: "HONEST COMPARISON", line1: "Best expense", line2: "tracker apps, UAE",
    sub1: "AED support, privacy, cards", sub2: "and installments compared",
    cardLabel: "What to check", cardValue: "8 options compared", badge: "2026",
    rows: [["AED as default currency", "Must have", null], ["Needs your bank login?", "Your call", null], ["Cards & installments", "Must have", null], ["Works across banks", "Must have", null], ["Price in AED", "Nice to have", null]],
    chip1: "Best app for you", chip2: "The one you'll keep using",
  },
};

const outDir = path.join(__dirname, "../../public/images/blog");
(async () => {
  for (const [slug, cfg] of Object.entries(posts)) {
    const s = svg(cfg);
    fs.writeFileSync(path.join(__dirname, `${slug}.svg`), s);
    const info = await sharp(Buffer.from(s), { density: 144 })
      .resize(1200, 630)
      .flatten({ background: "#0f5c37" })
      .jpeg({ quality: 86, mozjpeg: true })
      .toFile(path.join(outDir, `${slug}.jpg`));
    console.log(slug, Math.round(info.size / 1024) + " KB");
  }
})();
