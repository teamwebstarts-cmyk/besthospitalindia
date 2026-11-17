# Public Website — Functional Audit Report (A15)

> Task: A15 — Public Website Functional Audit & Stabilization
> Scope: all public-facing deliverables of tasks A02–A07.
> Method: **live browser testing** (Chromium via CDP) against the running Next.js 16 dev server at `http://localhost:3000`. TypeScript/ESLint/build were *not* used as evidence. Every claim below was reproduced in the browser unless explicitly marked "earlier in session".
> Companion documents: [`PUBLIC-WEBSITE-BUG-REGISTER.md`](./PUBLIC-WEBSITE-BUG-REGISTER.md) · [`PUBLIC-WEBSITE-ROUTE-COVERAGE.md`](./PUBLIC-WEBSITE-ROUTE-COVERAGE.md)
> Date: 17 Nov 2026.

---

## 1. Headline numbers

| Metric | Count |
|---|---|
| **Routes tested (HTTP + render)** | **26** (24 canonical public routes + `/auth` + probing of `/signin`, `/signup`, `/patient`) |
| **Interactions exercised in browser** | **40+** — navigation clicks (desktop + mobile), 4 end-to-end forms, directory search/filter/sort/pagination, compare combobox keyboard flow, OTP flow, dropdown menus |
| **Fully working pages** | **11** — `/facilities`, `/facilities/[slug]`, `/free-consultation`, `/about`, `/how-it-works`, `/rating-methodology`, `/international-urban-forum`, `/for-hospitals`, `/for-doctors`, `/contact`, `/privacy`, `/terms`, `/disclaimer` |
| **Fatal crashes (page unusable)** | **7 routes** — `/hospitals`, `/doctors`, `/treatments`, `/hospitals/[slug]`, `/doctors/[slug]`, `/treatments/[slug]`, `/medical-tourism`, plus `/hospitals/compare?ids=…` on selection |
| **Wrong content** | **1** — `/` serves the Next.js starter, not the homepage |
| **Dead-end flows** | **1** — auth OTP success → `/patient` 404 |
| **Critical bugs** | **7** (BUG-001…007) · **High**: 1 (BUG-010) · **Medium**: 3 (BUG-009, 012, 013) · **Low**: 2 (BUG-008, 011) |

**Bottom line:** the site's content layer (static pages, facilities directory, all forms) is in good shape, but the entire provider-discovery core — hospitals, doctors, treatments, compare — is unusable in the browser due to **one shared root cause** (BUG-002), and the homepage is shadowed by a starter file (BUG-001). Fixing two root causes restores roughly 8 of the 9 broken routes.

---

## 2. What works (verified in browser)

| Area | Detail |
|---|---|
| **Facilities directory** | Search (`?q=imaging`), category filter (`?category=diagnostic_lab`), sorting (`?sort=name-asc`), pagination and card navigation all pass. Facility detail page renders complete profile: overview, specialties, services, verification badge, demo disclaimer, CTAs. Only defect: "facilitys" typo. |
| **Forms** | All four demo forms pass end-to-end in browser: Free consultation (`ENQ-41ZW`), Contact (`MSG-A21M`), For Hospitals interest (`HOS-ELT0` — including required-field validation, select interaction, error summary "Please fix the highlighted fields"), International enquiry (`ENQ-HYSA`). Reference codes, character counters, disabled-until-valid submit all behave. |
| **Static content pages** | About, How It Works, Rating Methodology, International Urban Forum, For Hospitals, For Doctors, Contact, Privacy, Terms, Disclaimer — all render 200 with header/footer, breadcrumbs, and consistent demo-data disclaimers. |
| **Navigation chrome** | Desktop header: all primary links + "More" overflow dropdown (About, Contact) verified. Mobile at 390×844: hamburger opens Sheet drawer, links navigate (verified earlier in session). Footer: all Platform/Company/Legal links resolve to live pages. |
| **Error states** | Route error boundary is well-built: clear copy ("Your data is safe — try again"), functional "Try again". Branded 404 with working "Go to homepage" / "Browse hospitals". |
| **Demo-data discipline** | Fictional-data disclaimers appear consistently on directory pages, detail pages and forms. PER/CER separation language is present and preserved wherever it renders. |

## 3. What is broken (browser-verified)

| # | Symptom | Root cause (one line) | Bug ID |
|---|---|---|---|
| 1 | Homepage shows "Project ready!" starter | `app/page.tsx` shadows `app/(public)/page.tsx` | BUG-001 |
| 2 | Hospitals, Doctors, Treatments directories all crash on open | `` `<Link href={`${ROUTES.public.hospitalProfile}/${slug}`}>` `` produces literal `/hospitals/[slug]/…` — Next.js App Router fatal | BUG-002 |
| 3 | Hospital/doctor/treatment detail pages crash on direct load | Same `[slug]` interpolation in detail-page links/metadata | BUG-002/004 |
| 4 | Compare page works empty, crashes the moment a hospital is added | `comparison-table.tsx:102` — same `[slug]` href | BUG-003 |
| 5 | `/treatments` crashes (serialization) before its links even matter | Server Component passes `buildPageHref` function to client `Pagination` | BUG-005 |
| 6 | `/medical-tourism` crashes on render (form itself previously worked) | Page-level render failure; likely `[slug]` link or function-prop | BUG-007 |
| 7 | OTP success lands on 404 | `router.push('/patient')` to a non-existent portal route | BUG-010 |
| 8 | Hydration mismatch on every page (header) | Non-deterministic output in `public-header.tsx` `BrandLink` | BUG-009 |
| 9 | Base UI `nativeButton` console warnings ×2 per page | `Button` with `render={<Link/>}` missing `nativeButton={false}` | BUG-012 |
| 10 | "12 facilitys found" | Pluralization typo | BUG-008 |

The single most important fact in this audit: **BUG-002 is one shared-component bug whose fix repairs seven routes** (`/hospitals`, `/doctors`, `/treatments`, all three profile families, compare-with-selection, and likely `/medical-tourism`). It must be fixed centrally (route-builder helpers), not card-by-card.

## 4. Shared-component vs page-specific classification

**Shared-component bugs (fix once, many pages heal):**
- `constants/routes.ts` + card components (`hospital-card`, `doctor-card`, `treatment-card`, `comparison-table`, detail pages) — `[slug]` href construction → **BUG-002 family (7 routes)**
- `components/layout/public-header.tsx` — hydration mismatch (**BUG-009**) + `nativeButton` (**BUG-012**)
- `components/ui/button.tsx` — enforce `nativeButton={false}` for anchor renders (**BUG-012**)
- `features/content/auth-entry-card.tsx` — post-OTP redirect (**BUG-010**)
- `app/page.tsx` — starter collision (**BUG-001**)

**Page-specific bugs:**
- `app/(public)/treatments/page.tsx` — function passed to client `Pagination` (**BUG-005**)
- `app/(public)/medical-tourism/page.tsx` — render crash needing one stack-trace check (**BUG-007**)
- Facilities counter copy (**BUG-008**)
- `app/not-found.tsx` — missing chrome (**BUG-011**, optional)

## 5. Priority-ordered repair sequence

| Order | Fix | Type | Effort | Routes healed |
|---|---|---|---|---|
| 1 | Delete starter `app/page.tsx` | BUG-001 | ~1 min | `/` |
| 2 | Introduce route-builder helpers (`hospitalProfileHref(slug)` etc.) and replace all `[slug]` template concats in cards, detail pages, comparison table | BUG-002 (+003/004/006/007) | Small, mechanical | `/hospitals`, `/doctors`, `/treatments`, 3 detail families, compare, likely `/medical-tourism` |
| 3 | Swap `/treatments` pagination to `UrlPagination` (mirroring `/hospitals`) | BUG-005 | Small | `/treatments` fully interactive |
| 4 | Replace OTP dead-end with in-page mock success state | BUG-010 | Small | `/auth` flow completes |
| 5 | Fix `public-header.tsx` hydration determinism + `nativeButton={false}` | BUG-009/012 | Medium | All pages' console hygiene |
| 6 | "facilities" pluralization; optional 404 chrome | BUG-008/011 | Trivial | Polish |

## 6. Recommended agent assignments

| Agent | Assignment | Rationale |
|---|---|---|
| **A-fix-1 (routes & links)** | BUG-001 + BUG-002 family: starter removal, route-builder helpers, sweep all `ROUTES.public.*[slug]` concats (`rg "\[slug\]"`), update `components/ui` consumers | One coherent, mechanical change-set touching only link construction |
| **A-fix-2 (page hydration/serialization)** | BUG-005 (`/treatments` → `UrlPagination`), BUG-007 verification after #2, BUG-009 + BUG-012 (header/button) | Client/server boundary work, needs care with Next 16 rules |
| **A-fix-3 (flows & polish)** | BUG-010 (auth success state), BUG-008 (pluralization), BUG-011 (optional 404 chrome), post-fix regression pass of the full interaction matrix | UI-flow + copy work; also owns the re-test |

Suggested order of execution: A-fix-1 → A-fix-2 → A-fix-3, with a final browser regression run of the Route Coverage matrix before closing A15.

## 7. Constraints honored

- No portal implementation started (`/patient` left untouched).
- No dependencies added; no real backend calls introduced.
- No business logic invented; no shared contracts modified.
- PER/CER separation and null-score handling untouched (verified in rendered methodology/compare copy).
- Demo-data labeling verified everywhere; no code changes committed.

## 8. Residual risks / notes for the next phase

- **BUG-013**: client-form pages ship minimal SSR HTML; acceptable for demo, but the hospital/doctor/admin portals should not copy this pattern for SEO-relevant pages.
- **Hydration errors (BUG-009)** currently mask *other* client-side warnings in the dev overlay; fix before the next audit pass so the console is trustworthy signal.
- The three directories use three different pagination implementations (`UrlPagination` on `/hospitals`, broken `buildHref` on `/treatments`, link-based on `/facilities`). After the fixes, consider converging on `UrlPagination` — flagged as a suggestion, **not** executed per no-redesign constraint.
- `/signin` and `/signup` are dead paths; the live entry is `/auth`. Either add redirects or update any future docs referencing `/signin`.
