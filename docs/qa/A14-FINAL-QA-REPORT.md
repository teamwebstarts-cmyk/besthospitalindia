# A14 — Final QA Report: Public Website

> **Task:** A14 — Independent Final Public Website QA (BestHospitalIndia)
> **Date:** 17 Nov 2026
> **Environment:** Production build (`next build` → `npx next start -p 3100`), clean Chromium profile via CDP, Windows host.
> **Independence:** No repair report was used as proof. Every claim below is backed by an interaction performed during A14 (browser navigation, clicks, keyboard, form fills) or a same-origin `fetch` with status inspection. No application code was modified, no dependencies added, nothing committed.

---

## 1. Executive summary

The public website is functionally complete and stable. All **26 route-coverage entries** load, render and behave correctly; all **four form flows** complete end-to-end with local demo references; the **auth demo flow** (role selection → OTP → verified state) works without dead ends; **desktop and mobile layouts** render without horizontal overflow and the mobile drawer navigates correctly; **PER/CER/MER ratings stay separate** with proper "Not yet rated" / "Assessment pending" null handling; and **zero external network traffic** was observed across every tested flow.

Two non-blocking issues remain (one Medium cosmetic select-label defect affecting many dropdowns, one Low 404-chrome inconsistency). No Critical or High severity issues remain.

### Final verdict: **CONDITIONAL PASS**

Portal development (A09+) may proceed. The remaining issues are documented in `A14-REMAINING-ISSUES.md` and none of them block portal work; A14-01 is the only user-visible defect and is purely cosmetic.

---

## 2. Technical gates

| Gate | Command | Result |
|------|---------|--------|
| TypeScript | `npx tsc --noEmit` | ✅ 0 errors |
| ESLint | `npx eslint .` | ✅ 0 errors, 0 warnings |
| Production build | `next build` (Turbopack) | ✅ 66 routes compiled and optimized |

The app was tested from the production build served via `npx next start -p 3100` (not the dev server), so results reflect compiled output.

---

## 3. Route coverage (26/26 verified)

Full row-by-row matrix with evidence: **`A14-ROUTE-VERIFICATION.md`**. Summary:

- **22 fully pass** — including all previously-crashing routes: `/` (no starter placeholder), `/hospitals`, `/doctors`, `/doctors/dr-aarav-mehta`, `/treatments`, `/treatments/bypass-surgery`, `/medical-tourism`, `/hospitals/compare` (incl. `?ids=` deep link).
- **4 pass with the documented cosmetic label issue (A14-01)** — `/doctors` sort trigger, `/free-consultation`, `/for-hospitals`, `/contact` select triggers. All underlying functionality verified correct.
- **Auth probes:** `/signin`, `/signup`, `/patient` → 404 as designed, no user-facing dead ends (auth success no longer redirects to `/patient`).

## 4. Discovery, filters, sorting, pagination, comparison

- **Hospitals:** 8 cards, page 1/2; City/Specialty/Accreditation/Rating-status facets; pagination works; card links resolve to full profiles.
- **Doctors:** 12 doctors; `?sort=per-desc` verified numerically (4.9 → 4.7 → 4.6 → 4.5 → 4.4 → 4.3); city/specialization facets.
- **Facilities:** 12 items ("12 facilities found" — typo fixed); `?q=imaging`, `?category=diagnostic_lab`, `?sort=name-asc` all verified.
- **Treatments:** 10 items; Cardiology filter narrows to 2; detail pages render.
- **Compare:** Add via combobox (1, 2, 3 hospitals), separate PER/CER rows, unrated → "Assessment pending", 3-hospital cap enforced, "Clear all" empties selection, URL sync works.

## 5. Form flows (4/4 pass)

| Flow | Route | Validation | Submission | Reference |
|------|-------|------------|------------|-----------|
| Free consultation | `/free-consultation` | ✅ empty submit → 8 errors, `aria-invalid` | ✅ pending → confirmation modal | `ENQ-YXH3` |
| International patient | `/international-patient/enquiry` | ✅ | ✅ inline success alert | `ENQ-X10S` |
| Hospital partner | `/for-hospitals` | ✅ | ✅ | `HOS-OR0O` |
| Contact | `/contact` | ✅ | ✅ | `MSG-C436` |

Every form is explicitly labelled as demo; nothing is transmitted or stored.

## 6. Authentication demo (pass)

`/auth`: three role cards → Patient selected → identifier entered → "Send one-time code" → demo code displayed in-page (`516007`) → **wrong code rejected** ("Incorrect code. Check the demo code shown above and try again.") → **correct code** → in-page "Demo sign-in verified" state with "Start over" / "Back to homepage". No navigation to a non-existent portal route. No real email/SMS/network activity.

## 7. Responsive layout & mobile navigation (pass)

- 390×844 with touch emulation: `scrollWidth − clientWidth = 0` (no horizontal overflow) on `/` and `/hospitals`.
- Hamburger ("Open navigation menu") visible; desktop nav hidden.
- Drawer opens as a dialog with Hospitals, Doctors, Facilities, Medical Tourism, Treatments, Free Consultation, About, Contact, Sign in — all correct hrefs; Close button dismisses.

## 8. State handling (pass)

- **Loading:** root `app/loading.tsx` present.
- **Empty:** `/hospitals?city=Atlantis` → 200 with empty state, no crash.
- **Error boundary:** `app/error.tsx` present; not triggered anywhere during the audit.
- **404:** `/definitely-not-a-real-page-xyz` → HTTP 404 + branded recovery page (chrome inconsistency logged as A14-02).

## 9. Rating separation & null handling (pass)

- Hospital cards: independent PER and CER modules (e.g. TranquilValley 4.7/4.8; AzureCoast both "Not yet rated").
- Doctor cards: independent PER and MER modules (e.g. Dr. Leena Fernandes MER "Not yet rated").
- Sorting by rating places unrated last and never treats null as 0; compare table shows "Assessment pending" for nulls; methodology copy consistently states ratings are never combined.

## 10. Network isolation (pass)

`performance.getEntriesByType('resource')` audit across the session: **24/24 resources from `http://localhost:3100`, 0 external origins**, no beacon/sendBeacon traffic. All "submissions" are client-side mock actions generating local references.

## 11. Remaining issues

| ID | Severity | Summary |
|----|----------|---------|
| A14-01 | Medium (cosmetic) | Select triggers show raw values (`spec-orthopaedics`, `200-500`, `feedback`, `per-desc`) instead of labels across discovery filters, treatment filters, global search and all four forms. Functionality verified correct; fix is to pass `items`/label mapping to Base UI `<Select>`. |
| A14-02 | Low (cosmetic) | 404 page renders without site header/footer; recovery links work. |

Details and suggested fixes: `A14-REMAINING-ISSUES.md`.

---

## 12. Verdict

> ## **CONDITIONAL PASS**
>
> - Zero Critical and zero High severity functional issues.
> - Two clearly documented, non-blocking cosmetic issues (A14-01 Medium, A14-02 Low).
> - All 26 route-coverage entries, 4/4 forms, auth demo, mobile navigation, state handling, rating separation and network isolation verified independently on the production build.
>
> **Portal development (A09+) is approved to begin.** Recommend scheduling A14-01 as an early polish item in the next stage, since select labels are user-visible across the site.
