# A14 — Final Route Verification

> Task: A14 — Independent Final Public Website QA
> Method: Live browser testing (Chromium via CDP, clean profile) against the production build served with `npx next start -p 3100`. HTTP status verified via same-origin `fetch`; interactions performed in the real browser. No reliance on prior repair reports — every row below was re-exercised during A14 on 17 Nov 2026.
> Baseline: 26 entries from `docs/qa/PUBLIC-WEBSITE-ROUTE-COVERAGE.md` (§1 rows 1–22 incl. 3a, §2 auth probes).

Legend: ✅ pass · ⚠️ pass with documented non-blocking issue (see `A14-REMAINING-ISSUES.md`)

## 1. Primary public routes (23 entries)

| # | Route | HTTP | Render | Interactions exercised in A14 | Result |
|---|-------|------|--------|-------------------------------|--------|
| 1 | `/` | 200 | Full public homepage (no starter placeholder) | Search box, specialty tiles (10), featured hospital cards with PER/CER modules, doctor cards, FAQ accordion region, footer | ✅ |
| 2 | `/hospitals` | 200 | 8 hospitals, page 1 of 2 | City/Specialty/Accreditation/Rating-status facets, pagination, card link → `/hospitals/sunrise-multispeciality-hospital-delhi` | ✅ |
| 3 | `/hospitals/compare` | 200 | Empty state → selection | Add 1, 2, 3 hospitals via combobox; separate PER/CER rows; unrated → "Assessment pending"; 3-hospital cap enforced; "Clear all" empties | ✅ |
| 3a | `/hospitals/compare?ids=hosp-sunrise-delhi` | 200 | Table renders from deep link | Deep-linked selection renders without crash | ✅ |
| 4 | `/doctors` | 200 | 12 doctors, 2 pages | `?sort=per-desc` verified: order 4.9 → 4.7 → 4.6 → 4.5 → 4.4 → 4.3; city/specialization facets; pagination | ⚠️ (sort trigger label — A14-01) |
| 5 | `/doctors/dr-aarav-mehta` | 200 | Full profile | Breadcrumbs, credentials, hospital associations, PER 4.6 / MER 4.3 shown as separate modules, review replies | ✅ |
| 6 | `/facilities` | 200 | "12 facilities found" (typo fixed) | `?q=imaging` search, `?category=diagnostic_lab` filter, `?sort=name-asc`, pagination | ✅ |
| 7 | `/facilities/sunrise-multispeciality-hospital-facility-delhi` | 200 | Full facility profile | Verification state, CTA links (Request information / Free consultation) correct | ✅ |
| 8 | `/treatments` | 200 | 10 treatments | Specialty filter → 2 results for Cardiology; card links | ✅ |
| 9 | `/treatments/bypass-surgery` | 200 | Detail renders | Overview, provider links, related content | ✅ |
| 10 | `/medical-tourism` | 200 | Programme page renders | Enquiry CTA → `/international-patient/enquiry`; travel-assistance info sections | ✅ |
| 11 | `/free-consultation` | 200 | Full consultation form | Empty submit → 8 validation errors with `aria-invalid`; valid submit → pending state → confirmation with ref `ENQ-YXH3`; zero console errors | ⚠️ (specialty trigger label — A14-01) |
| 12 | `/about` | 200 | Content renders | Nav + footer links | ✅ |
| 13 | `/how-it-works` | 200 | Content renders | Four-step sections | ✅ |
| 14 | `/rating-methodology` | 200 | Content renders | PER/CER/MER separation copy intact | ✅ |
| 15 | `/international-urban-forum` | 200 | Content renders | IUF initiative copy | ✅ |
| 16 | `/for-hospitals` | 200 | Interest form renders | Full fill (organisation, contact, email, phone, bed capacity, message, consent) → submit → ref `HOS-OR0O`, 0 validation errors | ⚠️ (bed-capacity trigger shows `200-500` — A14-01) |
| 17 | `/for-doctors` | 200 | Content renders | Nav links | ✅ |
| 18 | `/contact` | 200 | Contact routes + form | Fill name/email/phone/message, purpose select, submit → ref `MSG-C436`, 0 validation errors | ⚠️ (purpose trigger shows `feedback` — A14-01) |
| 19 | `/privacy` | 200 | Content renders | — | ✅ |
| 20 | `/terms` | 200 | Content renders | — | ✅ |
| 21 | `/disclaimer` | 200 | Content renders | — | ✅ |
| 22 | `/auth` | 200 | Role selection UI | Patient role → identifier → demo code shown (`516007`) → wrong code rejected with clear error → correct code → in-page "Demo sign-in verified" state (no phantom redirect) | ✅ |

## 2. Auth routes not in registry (3 entries)

| # | Route | HTTP | Result |
|---|-------|------|--------|
| 24 | `/signin` | 404 | Expected — header "Sign in" points to `/auth`; no user-facing dead end |
| 25 | `/signup` | 404 | Expected — "Create patient access" lives inside `/auth` |
| 26 | `/patient` | 404 | Route intentionally absent; auth success no longer redirects here (in-page verified state instead), so no user-facing dead end |

## 3. Supplementary error/state checks

| Check | Result |
|-------|--------|
| `/definitely-not-a-real-page-xyz` | 404 + branded "Page not found" with "Go to homepage" / "Browse hospitals" recovery actions |
| 404 layout | Renders without site header/footer (A14-02, Low) |
| Empty state `/hospitals?city=Atlantis` | 200 with "no results"-style empty state, no crash |
| Route error boundary | `app/error.tsx` present at root; no boundary triggered anywhere during A14 |
| Loading state | `app/loading.tsx` present at root |
| Unrouted paths return branded 404, never a stack trace | ✅ |

## 4. Cross-cutting verification

| Check | Result |
|-------|--------|
| Desktop nav + footer (17 links) | ✅ all resolve to 200 |
| Mobile 390×844 (touch emulated) | ✅ no horizontal overflow on `/` and `/hospitals` (scrollWidth − clientWidth = 0) |
| Mobile drawer | ✅ hamburger ("Open navigation menu") visible; drawer lists Hospitals, Doctors, Facilities, Medical Tourism, Treatments, Free Consultation, About, Contact, Sign in; Close works |
| PER/CER/MER separation | ✅ independent modules on hospital, doctor, compare and methodology surfaces; never combined |
| Null-score handling | ✅ "Not yet rated" on cards (e.g. GoldenPeak PER, Dr. Priya Nair PER, AzureCoast both), "Assessment pending" in compare, unrated sorted last in `rating-desc` |
| Network isolation | ✅ `performance.getEntriesByType('resource')`: 24/24 resources from `http://localhost:3100`, 0 external origins; all submissions produce local demo references only |
| Console | ✅ no errors observed on tested flows |

**Route verdict: 26/26 entries verified; 22 fully pass, 4 pass with the documented A14-01 select-label issue (functionality intact).**
