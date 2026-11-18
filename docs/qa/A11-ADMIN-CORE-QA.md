# A11 — Admin Core QA Report

> Task: A11 — Admin Portal: Dashboard & Core Platform Management
> Method: `npm run typecheck`, `npm run lint`, production build (`npx next build`), then live browser testing against the production build served with `npx next start -p 3311`. Every route was loaded and exercised in a real Chromium tab (accessibility snapshots + screenshots + CDP verification). Interactions were performed with real clicks/keyboard on 17 Nov 2026.
> Scope: 6 canonical A11 routes — `/admin`, `/admin/hospitals`, `/admin/doctors`, `/admin/facilities`, `/admin/patients`, `/admin/partners` — per the A11 handoff and page specs (`pages/24-admin-provider-ops.md`, `08-component-catalog.md`, `10-routing-and-layouts.md`).

Legend: ✅ pass · ⚠️ pass with documented non-blocking issue

## 1. Static verification (commands + actual results)

| Check | Command | Result |
|-------|---------|--------|
| TypeScript strict | `npm run typecheck` (`tsc --noEmit`) | ✅ exit 0 (re-run clean at end of session; earlier TS errors found during development were all fixed — see QA §6) |
| ESLint | `npm run lint` (`eslint`) | ✅ exit 0, 0 errors, 0 warnings (re-run clean at end of session) |
| Production build | `npx next build` | ✅ exit 0; compiled successfully; all 6 A11 routes prerendered as static (`○`) |

Build route table excerpt (from actual build output):

```
├ ○ /admin
├ ○ /admin/doctors
├ ○ /admin/facilities
├ ○ /admin/hospitals
├ ○ /admin/partners
├ ○ /admin/patients
```

(`/admin/appointments`, `/admin/consultations`, `/admin/medical-tourism`, `/admin/reviews`, `/admin/ratings`, `/admin/rating-methodology` also appear in the final build output — those files were added by the A12 agent during this session and are not A11 work.)

## 2. Route verification (live browser, production build)

| # | Route | HTTP | Interactions exercised | Result |
|---|-------|------|------------------------|--------|
| 1 | `/admin` | 200 | KPI row renders fixture-derived totals: **Total hospitals 8** (hint "3 in the verification queue"), **Total doctors 12** ("2 with credentials to review"), **Registered patients (demo) 4**, **Patient enquiries 5** ("3 awaiting admin action"). Decision queue: 3 hospitals awaiting verification, 2 doctors with credentials, 5 facilities pending verification, 2 reviews awaiting moderation, 2 rating assessments, Open appointment requests 4, Unassigned tourism cases 1, Partner accounts 3 — with the reconciliation note "Counts reconcile with the module queues — the enquiry action count covers records in submitted / under_review / assigned demo states." Weekly trend (2026-W39…W42) labelled "illustrative metadata, not live analytics"; recent platform activity feed (verification, appointment, credential and review events); module shortcuts. All KPI cards link to their modules | ✅ |
| 2 | `/admin/hospitals` | 200 | 8 rows with verification badge + separate PER / CER chips. Search "kochi" → "1 of 8 hospitals". Verification filter (All hospitals / Needs review / Verified / Pending review / Unverified / Rejected / Expired): "Needs review" → **3 of 8** (AzureCoast, NorthGanga, GoldenPeak). Approve → row badge "approved locally 17 Nov 2026, 23:48" + `[role=status]` demo notice. Reject → dialog; **empty submit blocked** ("Rejection reason is required", `aria-invalid`); with reason → "rejected locally 17 Nov 2026, 23:49" + notice "Demo: verification of 'AzureCoast…' rejected locally with a recorded reason. Nothing was published…". Detail drawer: Verification state, Accreditations & document status (Unverified badge, "No expiry on record"), **Ratings (independent)** — PER "Assessment pending" and CER "Not yet rated" with copy "A missing score is shown as 'Not yet rated' / 'Assessment pending' — never 0/5", Profile information, Actions (approve / reject / suspend listing). "View public profile (demo)" link present. Suspend = separate listing-availability flag, copy states it "never alters the verification record" | ✅ |
| 3 | `/admin/doctors` | 200 | 12 rows with registration status + separate PER / MER chips ("Assessment pending" / "Not yet rated" where null). Detail drawer (Dr. Aarav Mehta): Verification & registration with **masked registration "DMC-XXXX21 (fictional, masked in all admin views)"**, qualifications (MBBS / MD / DM), hospital associations resolving against hospital fixtures, independent PER 4.6/5 and MER 4.3/5 panels. "Request changes…" dialog: **empty submit blocked** ("Change request note is required"); with note → notice "Demo: changes requested locally for Dr. Aarav Mehta…" and row shows "changes requested locally 17 Nov 2026, 23:51". "Mark registration verified" on Dr. Priya Nair (registration pending) → notice "…separate record from the profile verification…" — profile badge stays **Pending** (no auto-verification). Escape closes the drawer | ✅ |
| 4 | `/admin/facilities` | 200 | 12 rows across **all six frozen Facility categories** (Hospital, Specialty centre, Diagnostic lab, Rehabilitation, Wellness, Medical tourism). Category filter: "Diagnostic lab" → **2 of 12** (ClearPath, Delta Imaging); reset → 12 of 12. Drawer (OrchidRow OnCare Centre, Pune): Verification state ("Facility records carry no rating in the demo contract"), Specialties, Services, Actions. "Mark record complete" → notice + row "record completed locally 17 Nov 2026, 23:53". "Request update…" dialog: **empty submit blocked** (`aria-invalid` + required message); with note → notice "Demo: update requested locally for 'OrchidRow OnCare Centre, Pune'…" | ✅ |
| 5 | `/admin/patients` | 200 | 4 demo patients. **List view masks contact details** (`ri•••••••@example.com`, `•••• 01`) with the privacy notice "The list shows directory-level fields only… The demo Patient contract holds no medical data, so none is displayed". Record drawer (Riya Sharma): explicit demo-consent notice, full demo contact (riya.demo@example.com / +91 90000 00001) revealed only here, **Age 34 years** (derived, not stored), Enquiries (2) with **report filenames only** — "Attached reports (names only, no content): demo-echo-report-jun.pdf, demo-prescription.pdf" — and appointment requests. "Restrict account (demo)" → button flips to "Lift restriction (demo)" and drawer records "Restricted flag recorded locally (demo): 17 Nov 2026, 23:54". Search: "riya" → 1 of 4, "singapore" → 1 of 4, cleared → 4 of 4 | ✅ |
| 6 | `/admin/partners` | 200 | 3 organizations: Sunrise Delhi, Sunrise Mumbai, and "Doctor-side coordination desk" (coordinator accounts with "No linked organization"). Summary line "3 partner accounts · 0 approved · 0 suspended (local demo state)". Staff drawer ("Partner staff — Owner"): partner user id, role, linked organization, joined date, demo sign-in hint marked "demo-only marker; no real authentication exists in this phase"; **staff-roster boundary text**: "Staff roster changes (inviting or removing partner users) are outside the frozen demo contracts… no create/remove-staff action is simulated here." Table "Suspend" → ConfirmDialog "Suspend partner access (demo)" ("…no real access exists to revoke, nothing is communicated") → confirm → row "Suspended (demo) 17 Nov 2026, 23:55" + notice; summary updates to "0 approved · 1 suspended". Suspended row exposes "Approve access" restore → notice + "Approved (demo) 17 Nov 2026, 23:57". Search "mumbai" → only Sunrise Mumbai remains; cleared → all 3 restore | ✅ |

Supplementary:

| Check | Result |
|-------|--------|
| HTTP probe of all 6 routes on the fresh production build (`Invoke-WebRequest`) | 200 × 6 |
| Loading states | `app/admin/loading.tsx` + per-route `loading.tsx` for hospitals, doctors, facilities, patients, partners (skeleton geometry mirrors final layout) |
| Error boundary | `app/admin/error.tsx` uses Next.js 16 `retry` prop + `ErrorState`; not triggered during testing (no route threw) — verified by code review |
| Navigation | Sidebar groups (Overview / Provider Operations / Case & Trust Operations / Platform Operations) render from the frozen registry; all 6 A11 links navigate correctly; A12/A13 links pointed at not-yet-built routes (404 at time of testing — expected, out of A11 scope) |
| Demo disclaimers | Every page header carries a demo boundary notice; every mutating control states its local-only boundary |

## 3. Responsive verification (device-metrics emulation on the production build)

| Width | Routes checked | Expected | Observed |
|-------|----------------|----------|----------|
| 1280 × 800 (desktop) | all 6 | Nav rail visible, `DataTable` lists, KPI grids | ✅ no horizontal overflow on any route (`scrollWidth == clientWidth == 1280`); screenshots captured |
| 768 × 1024 (tablet) | all 6 | Collapsed rail / adapted grids | ✅ no horizontal overflow on any route |
| 390 × 844 (mobile, DPR 2) | all 6 | Stacked cards replacing tables, Sheet drawer nav | ✅ no horizontal overflow on any route (`scrollWidth == clientWidth == 390`); hospital/doctor rows render as cards; "Open portal menu" opens the Sheet with all nav links, Close/Escape dismisses; screenshots captured |

Screenshots captured during the session (Chromium, production build): dashboard at 1280 / 768 / 390; hospitals mobile card list + mobile nav drawer; doctors mobile card list; patients desktop (masked list); partners desktop; hospital detail drawer.

## 4. Mock-data & business-rule compliance

| Rule | Evidence |
|------|----------|
| Dashboard reconciles with fixtures | Every dashboard count comes from `features/admin/selectors.ts` pure selectors over the frozen fixtures; the page states "derived from the same fictional fixtures the module pages render — nothing is live analytics" |
| PER / CER / MER never combined | Hospital rows/drawer show PER and CER as separate chips and separate drawer panels; doctor rows/drawer show PER and MER separately; no averaged or combined score anywhere |
| Null scores never 0 | Missing scores render "Not yet rated" / "Assessment pending" with explicit copy "never 0/5" (verified on hospitals, doctors drawers) |
| Verification ≠ publication | Hospital copy: "Approve / reject act on the demo verification record; suspend is a separate listing-availability flag"; suspend "never alters the verification record" |
| No auto-verification | Opening a doctor drawer performs no state change; every verification is an explicit button with a recorded notice; Dr. Priya Nair's profile stayed "Pending" after registration verification |
| Patient privacy | Contacts masked in list; full demo contact revealed only in the record drawer behind a consent notice; enquiry reports shown as **filenames only, no content**; no medical data displayed (contract holds none) |
| No invented categories | Facility filter enumerates exactly the six `FacilityCategory` values from the frozen contract |
| Demo-only mutations | All actions are reducer-driven page-local state; each emits a `[role=status]` notice stating nothing was published / sent / stored; timestamps shown for local changes |

## 5. Boundary check (A12 / A13)

- No A12 route (`appointments`, `consultations`, `medical-tourism`, `reviews`, `ratings`, `rating-methodology`) and no A13 route (`cms`, `iuf`, `notifications`, `analytics`, `roles`, `settings`) was implemented or modified by A11.
- During this session the A12 agent added `features/admin/cases/*` and six page files under `app/admin/`. `git status` confirms A11's work is confined to its own files inside the shared trees (A11 files listed in the report §2); no A12 file was touched.
- Shared resources (navigation registry, `PortalShell`, design tokens, A00 components, A01 contracts/fixtures) were consumed, never modified. No dependencies added; `package.json` / lockfile untouched.

## 6. Issues found during verification and their fixes

| # | Issue | Fix |
|---|-------|-----|
| 1 | TS errors in `partner-accounts-manager.tsx` (missing `useReducer` import, untyped reducer params) and a readonly-array type mismatch in `patient-records-manager.tsx` | Imported `useReducer`; typed the action union; memo now returns a fresh array |
| 2 | Stray text token accidentally written into `app/admin/partners/loading.tsx` | Removed |
| 3 | Stale `.next/dev/types` produced phantom route-type errors after adding the `/admin` layout | Deleted `.next` and re-ran — clean |
| 4 | ESLint `react/no-unescaped-entities` across 4 A11 files; unused imports in `selectors.ts` | Escaped entities (`&apos;` / `&quot;`); removed dead imports |
| 5 | Production prerender risk: lucide icon components inside `adminNavGroups` crossing the server→client boundary as props | `AdminPortalShell` client wrapper imports the frozen registry directly and composes the shared `PortalShell` (same pattern A09/A10 established) |

## 7. Known limitations (non-blocking)

1. **All actions are page-local demo state** and reset on reload — by design in Phase 1; every control says so in the UI.
2. **Note dialogs stay open after a successful submit** (request-changes / request-update / reject): the submission applies, the notice fires, and the user closes via Cancel / Escape / ✕. Consistent behavior across managers; flagged as a minor UX polish item for A16.
3. **A12/A13 nav links** lead to 404 until their agents' routes land (404 confirmed mid-session for `/admin/appointments`, `/admin/cms`; A12 routes appeared later in the session — ownership boundary respected).
4. **Error boundary not exercised live** — `error.tsx` follows the Next 16 `retry` contract but no route threw during testing.
5. **Dashboard weekly trend** is explicitly labelled illustrative demo metadata (record counts, never scores), per the "do not invent analytics" rule.

## Final status: PASS

- All 6 assigned routes implemented to their page specifications, statically verified (typecheck ✅, lint ✅, production build ✅), and browser-tested on the production build including every interactive flow (search, filters, drawers, dialogs with validation, confirm-guarded actions, local state transitions) and all three responsive breakpoints.
- Rating-integrity, verification-vs-publication, privacy, no-auto-verification and demo-boundary rules are enforced in code and verified in the running app.
- All work confined to A11-owned files; no dependencies added; no shared or other-agent files modified.
