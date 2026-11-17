# A14 — Remaining Issues

> Task: A14 — Independent Final Public Website QA
> Scope: All defects discovered or re-confirmed by independent A14 testing on the production build (`next start -p 3100`), 17 Nov 2026.
> Severity scale: Critical / High / Medium / Low. Only non-blocking issues remain; nothing at Critical or High severity.

## A14-01 — Select triggers display raw option values instead of labels (Medium, cosmetic)

- **Where:** Every `@base-ui/react` `<Select>` in the app that relies on `<SelectValue />` without an `items` prop or label-mapping:
  - Discovery: sort toolbar (`features/discovery/results-toolbar.tsx`, e.g. `/doctors?sort=per-desc` shows `per-desc`), listing filters (`features/discovery/listing-filters.tsx`), global search type select (`features/discovery/global-search.tsx`)
  - Treatments: specialty + sort filters (`features/medical-tourism/components/treatment-filters.tsx`)
  - Forms: consultation (`features/consultations/enquiry-form.tsx` — specialty, country, language, preferred provider), international patient (`features/medical-tourism/components/international-patient-enquiry-form.tsx` — specialty shows `spec-orthopaedics`), hospital partner (`bedCapacity` shows `200-500`), contact (`purpose` shows `feedback`)
- **Repro (A14 evidence):** On `/international-patient/enquiry`, open Specialty → choose "Orthopaedics" → trigger shows `spec-orthopaedics` instead of `Orthopaedics`. Same on `/for-hospitals` (`200-500` vs "200–500 beds") and `/contact` (`feedback` vs "Website feedback"). Screenshot captured during session (`a14-enquiry-select-value.png`).
- **Root cause:** Base UI Select renders the selected `value` string unless the root receives an `items` prop (value→label pairs) or `<SelectValue>` is given explicit children. No `<Select>` usage in the repo passes `items`.
- **Impact:** Functional behaviour is fully correct (URL params, filtering, sorting, form payloads all carry the right values — verified end-to-end). Only the human-readable label in the closed trigger is wrong. Not user-blocking for a demo build.
- **Suggested fix:** Pass `items` to each `<Select>` root (value→label map derived from the existing option arrays), or render `{selectedLabel}` inside `<SelectValue>`.
- **Blocked by audit rules:** Not fixed during A14 (no code changes allowed).

## A14-02 — 404 page renders without site header/footer (Low, cosmetic)

- **Where:** `app/not-found.tsx` (root layout only renders minimal chrome).
- **Repro:** Visit `/definitely-not-a-real-page-xyz` — branded "Page not found" with working "Go to homepage" / "Browse hospitals" actions, but no global header/footer.
- **Impact:** Minor inconsistency; recovery navigation works, so users are not stranded. Carried over from the A15 matrix (BUG-011), still Low.

## Non-issues verified (no action needed)

- **SSR/hydration gap from BUG-009 (selects missing in server HTML):** Re-checked on the production build — the concern from the old matrix no longer reproduces in practice; all tested selects hydrate and function. Console hydration errors were not observed on tested pages.
- **Pagination, filters, sort URLs:** All update correctly; sort order verified numerically (PER-desc: 4.9 → 4.3).
- **Compare cap:** 4th hospital selection correctly refused with limit messaging; "Clear all" works.
- **Auth dead end (old BUG-010):** Verified fixed — verified state stays in-page; no redirect to the non-existent `/patient`.
- **Network isolation:** 24/24 resource entries from `localhost:3100`; zero external origins; no beacons. Form submissions only generate local references (`ENQ-X10S`, `HOS-OR0O`, `MSG-C436`, `ENQ-YXH3`).

## Summary

| Severity | Count | Blocking? |
|----------|-------|-----------|
| Critical | 0 | — |
| High | 0 | — |
| Medium | 1 (A14-01) | No — cosmetic label defect, functionality verified correct |
| Low | 1 (A14-02) | No |

**Verdict implication:** With zero Critical/High issues and both remaining issues clearly documented and non-blocking, the A14 outcome is **CONDITIONAL PASS**.
