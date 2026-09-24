# SEO Audit: fixpenses.com

**Date:** 2026-09-24
**Scope:** 19 URLs from the sitemap (the full public site), checked against the source code in this repo
**Business type:** SaaS (personal finance app for UAE residents). Pricing, features, and signup pages are present, with no local-business signals.
**Method:** live HTTP checks with `curl`, HTML extraction on every sitemap URL, Playwright lab performance on a throttled mobile profile, and code inspection to confirm root causes.
**Not included:** Google field data (CrUX/GSC), backlink data, and the plugin's Python crawler. The plugin runtime isn't set up; run `/seo setup` to enable them.

## SEO Health Score: 59 / 100

| Category | Weight | Score | Weighted |
|---|---|---|---|
| Technical SEO | 22% | 70 | 15.4 |
| Content Quality | 23% | 60 | 13.8 |
| On-Page SEO | 20% | 65 | 13.0 |
| Schema / Structured Data | 10% | 25 | 2.5 |
| Performance (lab) | 10% | 60 | 6.0 |
| AI Search Readiness | 10% | 60 | 6.0 |
| Images | 5% | 55 | 2.8 |

The foundations are sound. HTTPS, security headers, canonicals, the sitemap and robots.txt are all correct, every page returns 200, and the feature pages have real depth. The score is held back by missing signals that are cheap to add (structured data, social images, title cleanup) and by one architectural issue that makes every page uncacheable.

## Top 5 issues

1. **Every page is rendered per request and never cached (High).** `components/SubscriptionBanner.tsx` runs from the root layout and calls `headers()` and `auth.api.getSession()`. That forces every route, including marketing pages, into dynamic rendering, served with `Cache-Control: private, no-store`. As a result, pages are served from a single Vercel US East function region (iad1), there is no edge caching for UAE visitors, homepage TTFB is 0.8–1.2s warm, and throttled mobile LCP is 6.3s.
2. **The site has almost no structured data (High).** Only the blog post has schema (Article). There is no Organization, WebSite, or SoftwareApplication markup, so Google and AI engines have no machine-readable entity for "Fixpenses", its pricing (AED 9.99/month), or its logo.
3. **No social share image on 18 of 19 pages (High).** No `opengraph-image` file exists and no metadata sets `og:image`. Links to the homepage, pricing, and feature pages shared on WhatsApp, LinkedIn or X show no preview image. The homepage also sends `twitter:card=summary`.
4. **Trust gaps on a finance (YMYL) site (High).**
   - The old brand names are still live: `hello@simpleexpenses.ae` on the footer, contact, and about pages, `privacy@simpleexpenses.ae` on the privacy policy, "Smart Expenses" in the pricing cards, and `@simpleexpenses` as the Twitter creator.
   - The About page names no founders or team and gives no company details.
   - The homepage stats ("500+ UAE users", "AED 10M+ tracked") are hard-coded in `app/page.tsx`.
5. **Titles repeat the brand, and one is truncated (Medium).** The template appends `| Fixpenses` to titles that already contain it. For example, "Track Credit Card Balances, Limits & Due Dates in Fixpenses | Fixpenses", and 4 of the 6 feature-page titles do this. `/features/expense-tracking` is 81 characters long and will be cut off in search results.

## Top 5 quick wins

1. Add `app/opengraph-image.png` (1200×630). Next.js applies it to every page automatically.
2. Add Organization, WebSite and SoftwareApplication JSON-LD to the root layout and homepage.
3. Replace every `simpleexpenses.ae` address, "Smart Expenses" and `@simpleexpenses` with the Fixpenses equivalents.
4. Remove "Fixpenses" from the feature-page `title` values and let the template add it.
5. Stop sending `lastModified: now` in `app/sitemap.ts`. Use real dates or omit the field.

---

## Technical SEO (70)

**What works**
- HTTPS everywhere, with HSTS `max-age=31536000; includeSubDomains; preload`.
- Strong security headers: CSP, `X-Frame-Options: DENY`, `nosniff`, Referrer-Policy and Permissions-Policy.
- `www` and `http` redirect to `https://fixpenses.com` with 308s. `http://www` takes 2 hops, which is acceptable.
- robots.txt blocks the app and admin areas and allows the marketing pages, and it references the sitemap.
- All 19 sitemap URLs return 200, with self-referencing canonicals, `index, follow`, and `lang="en"`.
- Unknown URLs return a real 404, not a soft 404.

**Findings**

| Severity | Finding | Evidence | Fix |
|---|---|---|---|
| High | The whole site is dynamic and uncacheable | Every page returns `Cache-Control: private, no-store` and `X-Vercel-Cache: MISS`, served from region `iad1`. The cause is `SubscriptionBanner` in `app/layout.tsx:68`, which reads `headers()` and the session. | Move `<SubscriptionBanner />` into `app/(protected)/layout.tsx`. Marketing pages then prerender statically, the blog uses ISR, and Vercel's CDN serves them from nearby edges. |
| Medium | Sitemap `lastmod` is always "now" | `lastModified: now` on every static route in `app/sitemap.ts`, which is also `force-dynamic` | Omit `lastModified` for static pages, and use `updatedAt` for blog posts (already done). A lastmod that changes on every fetch teaches Google to ignore it. |
| Medium | Auth pages are indexed and in the sitemap | `/login` and `/signup` return `index, follow`, have 0 H1s, 75–107 words, and are in the sitemap with priority 0.8–0.9 | Keep `/signup` indexable if you want brand "sign up" queries, but remove `/login` from the sitemap and set `robots: { index: false }` on it. Add an H1 to both. |
| Low | The CSP only allows images from the site itself and Google Analytics | `img-src 'self' data: blob: https://www.google-analytics.com` | The admin editor accepts image URLs from any host, and those images would be blocked. Upload blog images to `/public` or add a known image host to `img-src`. |
| Info | No `llms.txt` | Returns 404 | Optional. Google ignores it. Low priority. |

## Content Quality (60)

**What works**
- The feature pages are substantial (848–2,057 words) and specific to the UAE (DEWA, Salik, taksit, AED).
- The About page explains who the product is for and why it exists, in plain language.
- The homepage answers real objections ("Do I need to connect my bank login?").
- The new blog post has a worked AED example, a table, FAQs, and internal links.

**Findings**

| Severity | Finding | Fix |
|---|---|---|
| High | **YMYL trust: no named people or company details.** Personal finance is a YMYL topic, and Google's rater guidelines ask "who is responsible for this site?" The About page has no founder or team names, photos, company or licence details, or address. | Add a "Who's behind Fixpenses" section with real names, roles, a short background and LinkedIn links. Add the legal entity name and emirate to the footer and About page. |
| High | **Brand inconsistency.** `simpleexpenses.ae` emails appear in 4 places, "Smart Expenses" in `components/PricingSection.tsx:54,124`, and `@simpleexpenses` in `app/layout.tsx:47`. | Replace them all. Mixed names weaken entity recognition in Google and AI engines and look untrustworthy on a finance product. Make sure the new email addresses actually receive mail. |
| Medium | **Unverifiable stats and testimonials.** "500+ UAE users" and "AED 10M+ tracked" are hard-coded, and the testimonials carry no surname, photo or date. | Use numbers you can defend, ideally from the database, and add real attribution to testimonials. Don't add Review or AggregateRating schema for testimonials the site hosts about itself. |
| Medium | **Only one blog post.** There's no topical depth yet for queries like "budget UAE" or "expense tracker UAE". | Build the cluster from the content brief: emergency fund UAE, sinking funds for rent cheques, business budget UAE, 50/30/20 in AED, and UAE cost of living, all linking to and from the budget guide. |
| Low | Thin utility pages: `/contact` (127 words), `/request-feature` (167) and the blog category page (85). | That's expected for these page types. No action needed beyond the login noindex. |

## On-Page SEO (65)

**What works:** every page has a unique title and meta description and exactly one H1 (except login and signup), and the heading hierarchy is logical.

| Severity | Finding | Fix |
|---|---|---|
| Medium | Brand appears twice in titles on 4 feature pages | Remove "Fixpenses" from the page-level titles. |
| Medium | `/features/expense-tracking` title is 81 characters | Shorten it, e.g. "Expense Tracking Software for the UAE" (37 characters plus the brand). |
| Medium | Generic titles on money pages: "Pricing", "Features", "About Us", "Blog" | For example: "Pricing: Free & Pro Plans in AED", "Features: Expense, Card & Budget Tracking for the UAE", "Blog: Budgeting & Money Tips for UAE Residents". |
| Medium | The homepage H1 "Take Control Of Every Dirham" has no search term | Keep the slogan but include the category, e.g. an H1 of "Expense tracker for the UAE" with the slogan as the tagline. The `<title>` already says "Personal Finance Software for UAE Residents". |
| Low | Blog category title uses an em dash: "Budgeting — Blog \| Fixpenses" | Use "Budgeting Guides for the UAE" plus a category description. |
| Low | The homepage sends `twitter:card=summary` while every other page sends `summary_large_image` | Align it once an OG image exists. |

## Schema / Structured Data (25)

**Current state:** one Article on the blog post. It's valid, with an absolute image URL and ISO dates. `publisher` has no `logo`, and `author` has no `url`.

**Missing:**
- **Organization** in the root layout: name, url, logo, `sameAs` (social profiles), `contactPoint` email. This is the entity anchor for Google and AI answers.
- **WebSite** in the root layout: name and url.
- **SoftwareApplication** on the homepage and `/pricing`: `applicationCategory: FinanceApplication`, `operatingSystem: Web, iOS, Android`, and `offers` (AED 0 / AED 9.99 / Premium, with `priceCurrency: AED`).
- **BreadcrumbList** on feature and blog pages.
- **Article:** add `publisher.logo` and `author.url` pointing to an author page.

Following current guidance, I'm not recommending FAQPage (Google retired FAQ rich results on May 7, 2026) or HowTo (deprecated).

## Performance, lab (60)

Throttled Pixel 7 profile (4× CPU, about 1.6 Mbps, 150ms RTT), live site:

| Page | TTFB | FCP | LCP | CLS | JS (KB) |
|---|---|---|---|---|---|
| `/` | 2,823ms* | 4,344ms | **6,288ms** | 0 | 247 |
| `/features/expense-tracking` | 464ms | 1,780ms | 3,020ms | 0 | 228 |
| `/pricing` | 853ms | 2,156ms | 2,156ms | 0 | 245 |
| `/blog` | 230ms | 1,492ms | 2,364ms | 0.048 | 228 |
| `/blog/how-to-create-a-monthly-budget-uae` | 624ms | 2,228ms | 2,228ms | 0.032 | 229 |

*This was a cold start. Warm unthrottled TTFB for `/` was 0.82–1.22s over 5 runs.

- **The homepage LCP is poor (above the 4.0s threshold).** It has the largest HTML (276 KB, mostly the RSC payload), 1,051 DOM nodes, and the uncached response described above.
- CLS is good everywhere (under 0.1). INP wasn't measured in the lab; use CrUX field data once available.
- Fixing the caching issue (Technical #1) is the biggest single performance improvement available. After that, look at trimming the homepage's client JavaScript and RSC payload.

## AI Search Readiness (60)

- **Good:** robots.txt doesn't block AI crawlers (GPTBot, ClaudeBot, PerplexityBot are all allowed via `*`). Content is server-rendered. Question-style headings on the homepage and blog are easy to quote.
- **Gaps:** there's no Organization entity, the brand name is inconsistent (Simple Expenses / Smart Expenses / Fixpenses), and there's only one piece of in-depth content to cite. `llms.txt` is optional.

## Images (55)

- The marketing pages use almost no `<img>` elements (the UI mockups are HTML/CSS), so alt text isn't a problem. The blog image has alt text and is 56 KB.
- The main gap is **social images**, covered under on-page issues above.
- Serve blog images at 1200px wide and consider WebP/AVIF next to the JPEG. Next's `<Image>` can do this for images hosted on the site.

## Screenshots

See `screenshots/`: desktop (1366×768) and mobile (Pixel 7) captures of the home, feature, pricing, blog index and blog post pages. No layout breaks or horizontal overflow were found.
