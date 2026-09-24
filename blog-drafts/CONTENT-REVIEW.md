# Content Review: 5 Fixpenses Blog Drafts

**Date:** 2026-09-24
**Scope:** `01`–`05` drafts in `blog-drafts/` (UAE personal finance, a YMYL topic)
**Method:** seo-content framework (E-E-A-T, readability, thinness, AI citation readiness, draft cleanup). Metrics were computed locally. The plugin's `content_humanize.py` runtime isn't installed, so I checked for invisible characters with an equivalent codepoint scan.
**Caveat:** these scores are heuristics from this skill's own model, not Google signals.

## Summary

| | Score |
|---|---|
| **Content quality** | **72 / 100** |
| E-E-A-T (weighted) | 60 / 100 |
| AI citation readiness | 78 / 100 |

The drafts are useful, specific and easy to read. Every article has worked AED examples, tables, and verified bank and BNPL figures, with no filler or thin sections. What holds the scores back is **trust and authority on a YMYL topic**:

- no linked sources in the body
- no author bio or credentials
- no "last updated" or "figures checked" date on fee-sensitive content
- a few claims still need verifying before publishing

## Metrics by article

| Article | Body words* | Avg sentence | Flesch | H2 / H3 | Internal links | External links | Keyword in first 100 words | Title with brand |
|---|---|---|---|---|---|---|---|---|
| 01 Sinking funds | 2,072 | 14.6 | 78 | 10 / 10 | 4 | 0 | Yes (variant) | 73 chars ⚠️ |
| 02 0% instalment plans | 2,025 | 15.8 | 77 | 11 / 12 | 4 | 0 | **No** (spelling) | 67 chars ⚠️ |
| 03 Tabby vs Tamara | 2,047 | 16.5 | 77 | 10 / 7 | 4 | 0 | Yes | 70 chars ⚠️ |
| 04 Statement cycles | 2,025 | 14.8 | 76 | 11 / 8 | 5 | 0 | Yes (variant) | 71 chars ⚠️ |
| 05 Expense tracker apps | 2,046 | 13.7 | 73 | 9 / 12 | 3 | 0 | Yes (variant) | 74 chars ⚠️ |

*Full article body. The readability counts exclude headings, tables and list items.

**Checks that passed on every article:**
- 0 invisible or zero-width characters
- 0 em or en dashes
- 0 sentences duplicated between articles
- one H1 and a clean H2 → H3 hierarchy
- every meta description is 149–156 characters (under 160)

## E-E-A-T breakdown

| Factor | Score | Signals |
|---|---|---|
| Experience | 10 / 20 | The worked AED examples are practical, but they're labelled as illustrations. There are no first-hand stories, real (anonymised) user data or screenshots. |
| Expertise | 16 / 25 | The figures are accurate and specific: Emirates NBD rates, minimum payment rule, late fee, processing and early-settlement fees, plus Tabby and Tamara terms. There's no author credential or reviewer. |
| Authoritativeness | 12 / 25 | It's a new blog with no linked citations to primary sources such as the bank Key Facts Statements, Tabby and Tamara pages, or AECB. The byline is only "Habib". |
| Trustworthiness | 22 / 30 | Article 05 openly discloses that Fixpenses is one of the apps compared, figures are hedged, and readers are told to check their own KFS. There's no visible "figures checked" date, and sources sit in the front matter rather than on the page. |

## Issues found

### High priority (fix before publishing)

1. **No external source links (all 5).** The sources are listed in the front matter but not linked in the body. For YMYL fee and interest claims, link the primary source where the figure appears:
   - the Emirates NBD KFS for 3.25–3.49% a month, AED 241.50 and 55 days
   - Emirates NBD's instalment pages for AED 51.45 and 1.05%
   - Tabby's and Tamara's UAE pages for their terms
2. **Spelling doesn't match the keyword (02, and 03 in part).** The target keyword is "credit card **installment** plan UAE", and UAE banks such as Emirates NBD spell it "Installment". The drafts mostly use "instalment" (21 times each). Switch to "installment" in both articles for consistency with how people search.
3. **Claims to verify before publishing:**
   - 04: "most UAE banks charge interest from the transaction date" when you don't pay in full. It's hedged with "often", but confirm it against 1–2 bank KFSs.
   - 04: that late payments can affect "some rental agreements". Confirm or remove.
   - 03: how refunds work for Tabby and Tamara, and whether both allow paying early without a fee. Check their help centres.
   - 05: YNAB's bank sync being "built mainly around US, Canadian and European banks", Money Manager and Monefy "work offline", and "most major UAE banks show spending insights". Verify each or soften the wording.
4. **Meta titles run long once " | Fixpenses" is added (67–74 characters).** Google usually shows about 60. Either shorten the page titles or set `title.absolute` on blog posts so the brand suffix isn't added. Suggested titles:
   - 01: "Sinking Funds UAE: Save for Rent Cheques & School Fees" (54)
   - 02: "0% Installment Plans in the UAE: The Real Cost" (46)
   - 03: "Tabby vs Tamara vs Bank Installments (UAE Costs)" (48)
   - 04: "Credit Card Billing Cycle UAE: Avoid Interest" (45)
   - 05: "Best Expense Tracker Apps in the UAE (2026)" (43)

### Medium priority

5. **Author and reviewer signals.** Give the byline the full name (Habib Abdul Qadoos) and link it to `/about`. For YMYL, add a short author bio line and, if possible, a "Reviewed by" line from someone with finance credentials.
6. **Freshness line.** Add "Figures checked September 2026" under the title of 02, 03 and 04. Fees and rates change, and a visible date is a trust signal.
7. **Internal link density is slightly low.** There are 3–5 links per article, and the skill's guideline is 3–5 per 1,000 words.
   - Cross-link the five new posts: 01 ↔ 02, 02 ↔ 03, 03 ↔ 04, 05 → 01/04.
   - Each post already links to the pillar budget guide. Add links from the pillar back to these posts once they're published.
8. **Experience signals.** Add one real, anonymised example to each post, such as a Fixpenses user's instalment total, or the founder's own rent-cheque setup. Only do this if the example is genuine.
9. **Same template on every post.** All five end with "Frequently asked questions" followed by a "bottom line" section. That's fine for now. Vary the closing format on future posts so the cluster doesn't read as templated.

### Low priority

10. A handful of paragraphs run to 5 sentences (01: 3, 05: 3). Split them for mobile.
11. **Featured images.** Each post needs a 1200×630 image, like the budget guide has, with keyword-bearing alt text.
12. **FAQ sections.** They're good for readers and for AI extraction. Don't add FAQPage schema: Google retired FAQ rich results in May 2026. The existing Article and BreadcrumbList markup is enough.

## AI citation readiness: 78 / 100

**Strengths:**
- answer-first definitions, e.g. "A sinking fund is savings with a job and a date"
- comparison tables (03, 05) and worked-number tables (01, 02, 04)
- question-style FAQ headings
- specific, quotable figures with a named source (Emirates NBD)

**Gaps:**
- no in-body source links
- no author entity with credentials
- no dates on figures

Those same fixes lift E-E-A-T and AI citability together. Google's guidance is that optimizing for generative AI is ordinary SEO, so no AI-specific markup or rewrites are needed.

## What was done in this pass

- **Written with the seo-content-writer skill:**
  - one job to be done (JTBD) per article
  - figures checked against primary sources (Emirates NBD KFS and instalment pages, tabby.ai, tamara.co, YNAB pricing)
  - bodies of 2,025–2,072 words
- **Rewritten with the humanizer skill:**
  - removed "not X, it's Y" constructions, fake-candid openers ("the honest answer"), and "quietly" and "actually" padding
  - rewrote bold-label lists as prose, bullets or H3s
  - removed the generic closing line
  - kept all facts and links
- **Fact corrections during drafting:**
  - Card interest on AED 3,600 is AED 117–126 a month, not "about 115".
  - Tabby's no-late-fee change applies only in **Saudi Arabia**, not the UAE.
  - Removed an unverified "1–3% balance transfer fee" figure.

---

## Fixes applied (2026-09-24)

| # | Issue | Status |
|---|---|---|
| 1 | No external source links | **Fixed.** Primary-source links added: Emirates NBD KFS and installment help page, CBI KFS, tabby.ai pages, tamara.co pages, AECB and YNAB help. Articles now have 1–6 external links each. |
| 2 | "instalment" vs "installment" | **Fixed.** Changed to "installment" in all 5 articles. |
| 3 | Unverified claims | **Fixed.** Interest-from-transaction-date is confirmed (CBI KFS) and now cited. Tabby and Tamara refund and early-payment rules are confirmed and rewritten precisely. YNAB import coverage is confirmed and linked. "Rental agreements", the claim that the loggers "work offline", and "most UAE banks show insights" were removed or softened. |
| 4 | Meta titles too long | **Fixed.** Titles are 55–60 characters with " \| Fixpenses". |
| 6 | Freshness line | **Fixed.** "Figures checked September 2026" added to 02, 03 and 04. |
| 7 | Internal links | **Improved.** Cross-links added between posts (4–6 internal links each). |
| 11 | Featured images | **Done.** Five 1200×630 JPEGs (54–57 KB) in `apps/web/public/images/blog/`. |
| 5, 8 | Author bio / reviewer, first-hand examples | **Open.** These need input from the owner. |

All five posts are saved as **drafts** in the database (not public). Publishing needs the images deployed first.
