# Public Website — Route Coverage Matrix (A15)

> Task: A15 — Public Website Functional Audit & Stabilization
> Method: Live browser testing (Chromium via CDP) against `npm run dev` (Next.js 16 / Turbopack) at `http://localhost:3000`.
> HTTP status codes verified via same-origin `fetch`; rendering, interactions and error states verified in the real browser.
> Date: 17 Nov 2026. All data is demo/fictional data as designed.

Legend for **Render** column:
- ✅ = renders fully (header, footer, content)
- 💥 = fatal error boundary ("Something went wrong while loading this section") — page unusable
- ⚠️ = renders with defects noted
- "starter" = Next.js starter placeholder ("Project ready!") instead of intended page

Legend for **Interactions** column: ✔ tested in browser · ✖ not testable (blocked) · — nothing interactive

---

## 1. Primary public routes

| # | Route | HTTP | Render | Interactions tested (browser) | Result | Notes |
|---|-------|------|--------|-------------------------------|--------|-------|
| 1 | `/` | 200 | **starter** | — | ❌ | Root is shadowed by `app/page.tsx` starter ("Project ready!"). Real homepage at `app/(public)/page.tsx` unreachable. **BUG-001** |
| 2 | `/hospitals` | 200 | 💥 crash | None possible — page dies on render | ❌ | Dynamic-href crash in HospitalCard/Button. **BUG-002** |
| 3 | `/hospitals/compare` | 200 | ✅ (empty state) | Combobox add-hospital (keyboard), URL sync | ⚠️ | Empty state works; selecting a hospital crashes the table. **BUG-003** |
| 3a | `/hospitals/compare?ids=hosp-sunrise-delhi` | 200 | 💥 crash | None possible | ❌ | ComparisonTable renders `/hospitals/[slug]/…` href → crash. **BUG-003** |
| 4 | `/doctors` | 200 | 💥 crash | None possible | ❌ | Same dynamic-href crash via DoctorCard. **BUG-002** |
| 5 | `/doctors/dr-aarav-mehta` | 200 | 💥 crash | None possible | ❌ | Detail page itself crashes (related-provider / CTA links). **BUG-002/004** |
| 6 | `/facilities` | 200 | ✅ | Search (`?q=imaging`), category filter (`?category=diagnostic_lab`), sort (`?sort=name-asc`), pagination, card links | ✅ (all pass) | Only typo: "12 facilitys found". **BUG-008** |
| 7 | `/facilities/sunrise-multispeciality-hospital-facility-delhi` | 200 | ✅ | CTA links (Request information / Free consultation) present and correct | ✅ | Full facility profile renders with verification state + demo disclaimer |
| 8 | `/treatments` | 200 | 💥 crash | None possible | ❌ | Server→Client function-passing crash (`buildPageHref`) + TreatmentCard href crash. **BUG-005 / BUG-002** |
| 9 | `/treatments/bypass-surgery` | 200 | 💥 crash | None possible | ❌ | Detail page crashes on render. **BUG-006** |
| 10 | `/medical-tourism` | 200 | 💥 crash | Enquiry form was tested earlier in session (validation + submit → `ENQ-HYSA` ref OK), but page now fatal-crashes on load | ❌ | Crash on full render. **BUG-007** |
| 11 | `/free-consultation` | 200 | ✅ | Full form flow: char counter, validation, disabled submit, submit → `ENQ-41ZW` confirmation | ✅ (passes) | |
| 12 | `/about` | 200 | ✅ | Content + nav links verified | ✅ | |
| 13 | `/how-it-works` | 200 | ✅ | No error markers; content renders | ✅ | |
| 14 | `/rating-methodology` | 200 | ✅ | Content renders; PER/CER separation intact | ✅ | |
| 15 | `/international-urban-forum` | 200 | ✅ | Content renders | ✅ | |
| 16 | `/for-hospitals` | 200 | ✅ | Full interest form: fill, validation errors, select "50–200 beds", resubmit → `HOS-ELT0` confirmation | ✅ (passes) | Server-rendered HTML omits interactive controls until hydration (SSR/hydration gap, **BUG-009**) |
| 17 | `/for-doctors` | 200 | ✅ | Content renders; no error markers | ✅ | |
| 18 | `/contact` | 200 | ✅ | Contact form: purpose select + submit → `MSG-A21M` confirmation (earlier in session) | ✅ (passes) | |
| 19 | `/privacy` | 200 | ✅ | Content renders | ✅ | |
| 20 | `/terms` | 200 | ✅ | Content renders | ✅ | |
| 21 | `/disclaimer` | 200 | ✅ | Content renders | ✅ | |
| 22 | `/auth` (Sign in / role select) | 200 | ✅ | Role selection + OTP demo flow: verify valid OTP → `router.push('/patient')` → 404 dead end | ⚠️ | **BUG-010** |

## 2. Auth routes NOT in registry (probing)

| # | Route | HTTP | Result | Notes |
|---|-------|------|--------|-------|
| — | `/signin` | 404 | Not found | Header "Sign in" actually points to `/auth`; `/signin`/`/signup` are dead paths |
| — | `/signup` | 404 | Not found | Same |
| — | `/patient` | 404 | Not found | OTP success redirect target — out of scope but produces user-facing dead end. **BUG-010** |

## 3. Error / boundary states

| # | Route | Result | Notes |
|---|-------|--------|-------|
| — | `/definitely-not-a-real-page-xyz` | 404 | Branded not-found page renders: "Page not found", "Go to homepage", "Browse hospitals" links work. ⚠️ No site header/footer on 404 (root-layout only). **BUG-011 (Low)** |
| — | Route error boundary | ✅ behaves correctly | Every crash shows "Something went wrong while loading this section. Your data is safe — try again." + working "Try again" button. Boundary itself is well-implemented. |

## 4. Cross-cutting checks

| Check | Result |
|-------|--------|
| Header/footer present on all rendered public pages | ✅ (except crash pages and 404) |
| Desktop nav (incl. "More" overflow dropdown → About, Contact) | ✅ tested, opens and navigates |
| Mobile nav (Sheet drawer, 390×844 emulation, hamburger + links) | ✅ tested earlier in session |
| Footer links (Platform / Company / Legal / contact rows) | ✅ all 17 footer links resolve to 200 pages |
| Demo-data disclaimers visible on directory + detail + form pages | ✅ consistently present |
| PER/CER separation language on compare + methodology pages | ✅ preserved in copy that renders |
| Hydration errors in console on every header-bearing page | ❌ **BUG-009** (`public-header.tsx` BrandLink) |
| Base UI `nativeButton` warnings in console | ❌ **BUG-012** |

## 5. Coverage summary

- Canonical registry routes identified: **24** (public pages) + `/auth`
- Routes loaded in browser: **24 / 24** attempted
- Fully working (render + interactions): **11** — facilities list, facility detail, free-consultation, about, how-it-works, rating-methodology, international-urban-forum, for-hospitals, for-doctors, contact, privacy/terms/disclaimer (3 counted individually in §1)
- Rendering with defects: **2** — `/auth` flow (dead-end redirect), `/hospitals/compare` (empty state only)
- Fatal crash (unusable): **7** — `/hospitals`, `/doctors`, `/treatments`, `/doctors/[slug]`, `/treatments/[slug]`, `/hospitals/compare?ids=…`, `/medical-tourism`
- Wrong content at route: **1** — `/` (starter placeholder)
- Interactions exercised in browser: **40+** (nav clicks, filters, sort, search, pagination, 4 form end-to-end flows, combobox keyboard selection, OTP flow, mobile sheet, desktop dropdown)
