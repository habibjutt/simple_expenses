# Action plan for fixpenses.com

Ordered by impact and dependencies. File paths are relative to `apps/web/`.

## Phase 1: Critical and high-impact fixes (week 1)

### 1. Make marketing pages cacheable (High)
- **Change:** move `<SubscriptionBanner />` from `app/layout.tsx` into `app/(protected)/layout.tsx`.
- **Why:** it reads `headers()` and the session on every request, which makes the whole site dynamic and `no-store`.
- **Unblocks:** CDN caching, faster TTFB and LCP (#7), and ISR for the blog.
- **How we'd know it failed:** `curl -sI https://fixpenses.com/pricing` still shows `private, no-store` or `X-Vercel-Cache: MISS` on repeat requests.
- **Leading indicator:** `X-Vercel-Cache: HIT` on marketing pages, and `next build` output showing ○ (Static) for `/`, `/pricing` and `/features/*`.

### 2. Clean up old brand names (High)
- **Change:**
  - `simpleexpenses.ae` → the Fixpenses domain in `components/LandingFooter.tsx`, `app/about/page.tsx`, `app/contact/page.tsx` and `app/privacy/page.tsx`.
  - "Smart Expenses" → "Fixpenses" in `components/PricingSection.tsx` (2 places).
  - `@simpleexpenses` → the real X handle, or remove it, in `app/layout.tsx`.
- **Before changing the emails:** confirm the new addresses receive mail.
- **How we'd know it failed:** `grep -ri "simpleexpenses\|smart expenses"` still matches rendered pages.

### 3. Add a site-wide social image (High)
- **Change:** add `app/opengraph-image.png` (1200×630, brand + "Expense tracker for the UAE"). Set the homepage's twitter card to `summary_large_image`.
- **How we'd know it failed:** `og:image` is still missing from `/pricing` HTML.

### 4. Add Organization, WebSite and SoftwareApplication schema (High)
- **Change:**
  - Add Organization and WebSite JSON-LD to `app/layout.tsx`, with logo and `sameAs`.
  - Add SoftwareApplication with AED `offers` to `app/page.tsx` and `app/pricing`.
  - Add `publisher.logo` to the blog Article.
- **Depends on:** #2, so the entity name and email are consistent.
- **How we'd know it failed:** Rich Results Test or the Schema.org validator reports errors, or the entity doesn't appear in the GSC Enhancements report within 4 weeks.

## Phase 2: On-page improvements (weeks 2–3)

5. **Fix titles.**
   - Remove "Fixpenses" from the feature-page titles.
   - Shorten `/features/expense-tracking` to under 60 characters.
   - Rewrite the generic titles: Pricing, Features, About, Blog, and the blog category page.
   - **Indicator:** CTR on those pages in GSC over 4–6 weeks.
6. **Fix the sitemap and auth pages.**
   - Remove `lastModified: now` from the static routes.
   - Drop `/login` from the sitemap and set `robots: { index: false }` on it.
   - Add H1s to login and signup.
7. **Improve homepage performance** (after #1).
   - Re-measure. If mobile LCP is still above 2.5s, cut the client JS and RSC payload (276 KB HTML, 247 KB JS).
   - Check that the hero text isn't delayed by fonts or scroll animations.
8. **Adjust the homepage H1.** Include "expense tracker" or "personal finance app for the UAE" and keep the slogan as the tagline.

## Phase 3: Content and authority (month 2)

9. **Add YMYL trust signals.**
   - Add named founders or team members with a short bio and LinkedIn on `/about`.
   - Add the legal entity and emirate to the footer.
   - Link the blog author to an author page.
10. **Make the proof points verifiable.** Use real user and tracked-AED numbers, and add attribution to testimonials (name, emirate, date). Don't add Review schema for testimonials the site hosts about itself.
11. **Build the budgeting cluster.** Publish 4–6 supporting posts around the monthly budget guide, all interlinked:
    - emergency fund UAE
    - sinking funds for rent cheques and school fees
    - business budget UAE
    - 50/30/20 in AED
    - UAE cost of living by emirate
12. **Add BreadcrumbList** to the feature and blog pages.

## Phase 4: Monitoring (ongoing)

- Run `/seo setup`, then connect Google APIs (`/seo google`) for CrUX field data and GSC indexation.
- Capture a drift baseline after Phase 1 (`/seo drift baseline https://fixpenses.com`) and compare after each deploy.
- Track monthly: indexed pages, impressions for "budget UAE" and "expense tracker UAE", CTR on the retitled pages, and mobile LCP (p75).
