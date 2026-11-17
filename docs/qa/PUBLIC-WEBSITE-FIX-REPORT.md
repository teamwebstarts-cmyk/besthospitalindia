# Public Website — Fix Report (A15 repair stages)

> Companion to [`PUBLIC-WEBSITE-FUNCTIONAL-AUDIT.md`](./PUBLIC-WEBSITE-FUNCTIONAL-AUDIT.md) and [`PUBLIC-WEBSITE-BUG-REGISTER.md`](./PUBLIC-WEBSITE-BUG-REGISTER.md).
> Stages executed in the approved sequence: A-fix-1 → A-fix-2 → A-fix-3, each verified in a real browser before the next.
> Gate results: `tsc --noEmit` ✅ · `eslint` ✅ · `next build` ✅ (all 26 routes compiled; 30+ SSG paths prerendered).
> Final regression: 24-route live-browser matrix, 0 failures. No commits made. No dependencies added. No real backend calls introduced.

---

## Changed files

| File | Change | Bug IDs |
|---|---|---|
| `app/page.tsx` | **Deleted** — Next.js starter ("Project ready!") that shadowed the real homepage at `app/(public)/page.tsx` | BUG-001 |
| `constants/routes.ts` | Added four route-builder helpers (`hospitalProfileHref`, `doctorProfileHref`, `treatmentDetailHref`, `facilityDetailHref`) that replace `[slug]` in the registry templates; registry itself unchanged | BUG-002 family |
| `features/providers/components/hospital-card.tsx` | href via `hospitalProfileHref(hospital.slug)` | BUG-002 |
| `features/providers/components/doctor-card.tsx` | href via `doctorProfileHref(doctor.slug)` | BUG-002 |
| `features/medical-tourism/components/treatment-card.tsx` | href via `treatmentDetailHref(treatment.slug)` | BUG-002 |
| `features/providers/components/comparison-table.tsx` | href via `hospitalProfileHref(hospital.slug)` | BUG-003 |
| `app/(public)/hospitals/[slug]/page.tsx` | Canonical metadata + related-doctor links via helpers | BUG-002/004 |
| `app/(public)/doctors/[slug]/page.tsx` | Related-hospital link via helper | BUG-004 |
| `app/(public)/treatments/[slug]/page.tsx` | Canonical metadata + all related hospital/doctor/treatment links via helpers (6 sites) | BUG-002/006 |
| `app/(public)/treatments/page.tsx` | Replaced server-side `buildPageHref` closure passed to client `Pagination` with serializable `UrlPagination` (same pattern as `/hospitals`); `q`/`specialty`/`sort` round-trip identically | BUG-005 |
| `components/ui/button.tsx` | Auto-detects non-`<button>` `render` targets (e.g. `<Link>`, `<a>`) and passes `nativeButton: false` to the Base UI primitive — shared fix for all call sites | BUG-012 |
| `features/content/auth-entry-card.tsx` | OTP success no longer redirects to the non-existent `/patient`; shows an in-page "Demo sign-in verified" state with Start over / Back to homepage actions (mock-only, no portal work) | BUG-010 |
| `features/discovery/types.ts` | `ResultsToolbarProps` gained optional `pluralLabel` for irregular plurals | BUG-008 |
| `features/discovery/results-toolbar.tsx` | `formatCount` uses `pluralLabel ?? label + "s"` | BUG-008 |
| `app/(public)/facilities/page.tsx` | Passes `pluralLabel="facilities"` | BUG-008 |

**Net:** 14 files changed + 1 deleted + 3 docs created (this folder). `lib/search.ts`, `lib/mock-actions.ts`, PER/CER/null-score handling, and all shared contracts untouched.

## Audit finding corrections

- **BUG-009 (hydration mismatch)** was **reclassified as tooling-induced, not an app bug**: the diff in the dev overlay showed `data-cursor-ref` attributes injected into the DOM by the automation harness; `rg data-cursor-ref` finds zero occurrences in source. In a clean Chromium profile (browser-use temp profile), no page shows a hydration error or issues indicator. **No app code changed for BUG-009**; the audit doc's "Medium" console-hygiene finding is withdrawn with this evidence.

## Bug resolution status

| Bug | Status | Browser evidence |
|---|---|---|
| BUG-001 starter at `/` | ✅ Resolved | `/` renders homepage: `h1 "Find the right hospital, doctor or treatment in India"`, search box present, no "Project ready!" |
| BUG-002 `[slug]` links | ✅ Resolved | 0 hrefs containing `[slug]` anywhere in rendered pages (checked `/doctors`, treatment detail, hospital detail) |
| BUG-003 compare crash | ✅ Resolved | `?ids=hosp-sunrise-delhi` renders ComparisonTable with separate PER/CER rows; add 2nd/3rd hospital works; 4th blocked ("limited to 3", combobox removed); remove-chip updates URL; shareable URL intact |
| BUG-004 profile crashes | ✅ Resolved | `/hospitals/sunrise-multispeciality-hospital-delhi` renders PER 4.5 / CER 4.2, doctors roster (3 links), accreditations, reviews; `/doctors/dr-aarav-mehta` renders with 2 related-hospital links |
| BUG-005 `/treatments` crash | ✅ Resolved | Full render: "10 treatments found", page 1/2 pagination click moves `aria-current` to page 2 |
| BUG-006 treatment detail crash | ✅ Resolved | `/treatments/bypass-surgery` + `/treatments/coronary-angioplasty` render; 4 related-hospital links each |
| BUG-007 `/medical-tourism` crash | ✅ Resolved | Page renders with 12 treatment links; enquiry form on `/international-patient/enquiry` submits → `ENQ-AE5F` confirmation card |
| BUG-008 "facilitys" | ✅ Resolved | `/facilities` shows "12 facilities found"; `/hospitals` still correct ("8 hospitals found", "1 facility found" singular path OK) |
| BUG-009 hydration | ✅ Withdrawn (tooling) | Clean-profile sweep of 24 routes: no issues indicators in Next dev tools on any page |
| BUG-010 OTP 404 dead-end | ✅ Resolved | OTP `Verify & continue` → visible `h2 "Demo sign-in verified"`, URL stays `/auth`, "Back to homepage" `<Link href="/">` present |
| BUG-011 404 chrome | ✅ Accepted as-is (Low, optional) | 404 renders branded page; both recovery links work |
| BUG-012 nativeButton warning | ✅ Resolved | Clean-profile sweep shows no Base UI warnings (verified via dev-tools issues indicator absence on all 24 routes) |
| BUG-013 SSR form gap | ✅ Accepted as-is (informational) | Forms functional after hydration; documented for portal phases |

## Final regression matrix (live browser, clean profile)

24/24 routes render with correct `h1`, zero error boundaries, zero dev-tools issue indicators: `/`, `/hospitals`, `/hospitals/compare`, `/hospitals/[slug]`, `/doctors`, `/doctors/[slug]`, `/facilities`, `/facilities/[slug]`, `/treatments`, `/treatments/[slug]`, `/medical-tourism`, `/free-consultation`, `/about`, `/how-it-works`, `/rating-methodology`, `/international-urban-forum`, `/for-hospitals`, `/for-doctors`, `/contact`, `/privacy`, `/terms`, `/disclaimer`, `/auth`, compare-with-selection.

Interactions re-verified post-fix: hospital specialty filter (`?specialty=spec-cardiology` → "3 hospitals found"), sort, pagination page 2 (`aria-current` moves), facilities search (`?q=imaging` → "1 facility found"), treatments pagination, 4 form E2E flows (consultation `ENQ-R2T0`, contact `MSG-R9SA`, hospital interest `HOS-4XQA`, international enquiry `ENQ-AE5F`), compare add/remove/limit, mobile Sheet nav (dialog opens, 10 links, navigates), treatment→hospital→doctor cross-link chain, branded 404 with working recovery links.

## Remaining issues (open, non-blocking)

1. **BUG-011 (Low)** — 404 page has no site header/footer; accepted for demo phase.
2. **BUG-013 (Medium, informational)** — client-form pages ship minimal SSR HTML; fine for the demo, do not copy the pattern into SEO-relevant portal pages.
3. **Pagination implementation divergence** — `/hospitals` and `/treatments` now both use `UrlPagination`; `/facilities` uses the discovery shell variant. Consolidation is a suggested cleanup, not executed (no-redesign constraint).
4. **`/signin` + `/signup`** remain dead paths (live entry is `/auth`); optional redirects if product wants the aliases.

## Handoff to A14 (final regression owner)

- The 26-route audit matrix is fully green as of this report; A14 should re-run `docs/qa/PUBLIC-WEBSITE-ROUTE-COVERAGE.md` §1–§4 to confirm and then clear A09–A13 to start.
- When testing via automation, expect `data-cursor-ref`-style DOM injection to produce false hydration diffs — use a clean profile or ignore harness attributes when reading the Next dev overlay.
