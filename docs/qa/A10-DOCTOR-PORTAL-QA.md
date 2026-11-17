# A10 — Doctor Portal QA Report

> Task: A10 — Doctor Portal implementation
> Method: `npm run typecheck`, `npm run lint`, production build (`npx next build`), then live browser testing against the production build served with `npx next start -p 3210`. Every route was loaded and exercised in a real Chromium tab (accessibility-snapshot + screenshots + CDP verification). Screenshots and interaction transcripts were captured during this session on 17 Nov 2026.
> Scope: 9 canonical routes under `app/doctor-portal/*` per `16-route-to-agent-matrix.md` and page specs `pages/57`–`pages/65`.

Legend: ✅ pass · ⚠️ pass with documented non-blocking issue

## 1. Static verification (commands + actual results)

| Check | Command | Result |
|-------|---------|--------|
| TypeScript strict | `npm run typecheck` (`tsc --noEmit`) | ✅ exit 0 (after fixing 5 errors found in first run, see §5) |
| ESLint | `npm run lint` (`eslint`) | ✅ exit 0, 0 errors, 0 warnings (after fixing 1 error + 13 warnings in first run, see §5) |
| Production build | `npx next build` | ✅ exit 0; compiled successfully; 86/86 static pages generated; all 9 doctor-portal routes prerendered as static (`○`) |

Build route table excerpt (from actual build output):

```
├ ○ /doctor-portal
├ ○ /doctor-portal/appointments
├ ○ /doctor-portal/availability
├ ○ /doctor-portal/consultations
├ ○ /doctor-portal/credentials
├ ○ /doctor-portal/hospitals
├ ○ /doctor-portal/profile
├ ○ /doctor-portal/reviews
├ ○ /doctor-portal/settings
```

## 2. Route verification (live browser, production build)

| # | Route | HTTP | Interactions exercised | Result |
|---|-------|------|------------------------|--------|
| 1 | `/doctor-portal` | 200 | KPI row renders 4 metrics derived from fixtures (Appointment requests 1 / 0 awaiting; Consultation queue 1 / 1 awaiting; PER **4.7 / 5** with sample size + assessment date; MER **4.1 / 5** labelled "Independent of PER — separate evidence track"); urgent queue shows APT-3C4D (Confirmed); verification card shows masked registration DMC-XXXX92; availability summary "0 of 7"; consultation queue shows ENQ-2N6P | ✅ |
| 2 | `/doctor-portal/profile` | 200 | Form pre-filled from fixture (name "Dr. Meera Joshi", 12 years, 13 language checkboxes with English/Hindi/Kannada checked, consultation-mode checkboxes); Save → disabled "Saving (demo)…" state → "Draft saved locally (demo)" + simulated-save timestamp + explicit "changes were not saved to any backend" + dirty-state tracker resets to "No unsaved changes." | ✅ |
| 3 | `/doctor-portal/hospitals` | 200 | Current associations render SilverLake (PER 3.9 / CER 4.6, Verified) and MetroPulse (PER 4 / CER **"Not yet rated"** — null never shown as 0); live search over `searchHospitals`; "Request association" on Sunrise Delhi → notice "Demo request sent … No message was sent to any hospital", pending panel appears as "Pending review (local demo state)" with Withdraw; the searched row switches to "Requested" | ✅ |
| 4 | `/doctor-portal/availability` | 200 | Empty week renders dedicated empty state; tick Monday → default 09:00–13:00 window appears; added second window 14:00→11:00 → inline `role=alert` "Start time must be earlier than end time."; corrected to 14:00–17:00 → window added with labelled remove button; Save week → status "Demo week saved locally: 1 configured day. Nothing was stored — reloading resets this page."; page carries an explicit "Demo state boundary" panel | ✅ |
| 5 | `/doctor-portal/appointments` | 200 | Toolbar shows "1 of 1 requests"; Reject → dialog requires reason: empty submit blocked with "Rejection reason is required" + `aria-invalid`; with reason → row flips to Cancelled with "Updated locally <timestamp> — Away at a demo conference that week" and a notice stating the demo patient was NOT notified; action buttons removed once terminal; Accept / Reschedule buttons present pre-action; mobile card layout replaces table below 640 px (verified §3) | ✅ |
| 6 | `/doctor-portal/consultations` | 200 | Case list shows ENQ-2N6P (Submitted, "1 case(s) awaiting your first response"); Open case → detail view with enquiry metadata, attached report `demo-spirometry.pdf` rendered with **"Access not granted"** badge and an explanation that no fixture grants report access to the doctor role; next-step Select ("Awaiting response" / "More information requested" / …); saved "More information requested" + note → card shows "Response: More information requested", note, and "Updated locally <timestamp>"; empty save keeps "Awaiting response" | ✅ |
| 7 | `/doctor-portal/credentials` | 200 | KPI strip (Verified 1 · Pending review 2 · Local placeholders 0); fixture rows labelled read-only "Fixture" (MBBS, MD Respiratory Medicine — Pending; Medical registration DMC-XXXX92 — Verified); add-credential form (type / title / authority / year) present for local placeholder flow; screenshot-verified layout | ✅ |
| 8 | `/doctor-portal/reviews` | 200 | Read-only PER panel (4.7 / 5, 88 data points, methodology version metadata) with explicit copy that star values on individual reviews never change the platform assessment; review list shows rev-007 (5/5, Published, "Email verified (demo)"); reply composer present with boundary copy "You cannot edit or delete the patient's review text — only this reply draft." | ✅ |
| 9 | `/doctor-portal/settings` | 200 | 4 preference toggles (Appointment request alerts, New review alerts, Platform and methodology updates, Compact table rows) with "Changes are unsaved local state."; account card (Dr. Meera Joshi · Bengaluru, Karnataka · demo partner account); Sign out → ConfirmDialog "End the demo portal session?" → confirm → demo-ended screen with "Back to demo settings" + "Go to homepage" recovery actions and copy that no real session exists; Back restores the settings UI | ✅ |

Supplementary:

| Check | Result |
|-------|--------|
| All 9 routes HTTP status via `Invoke-WebRequest` | 200 × 9 (after clean rebuild) |
| Loading states | `loading.tsx` present for portal root + profile, appointments, consultations, reviews, credentials, availability, hospitals, settings (skeleton geometry mirrors final layout) |
| Error boundary | `app/doctor-portal/error.tsx` present with Next 16 `retry` prop; not triggered during testing (no route threw) |
| Demo disclaimers | Every page header carries "Demo portal — all records … are fictional fixture data" banner; every mutating control states its local-only boundary |

## 3. Responsive verification (device-metrics emulation on production build)

| Width | Route checked | Expected | Observed |
|-------|---------------|----------|----------|
| 390 px (mobile) | `/appointments` | Stacked cards (table hidden) | ✅ table `display:none`, card list visible; screenshot verified |
| 390 px (mobile) | any portal page | "Open portal menu" Sheet drawer with full nav | ✅ drawer opens with all 9 links; screenshot verified |
| 678 px (small tablet+) | `/appointments` | Table visible, cards hidden | ✅ verified via computed visibility |
| Desktop (~1425 px) | `/doctor-portal`, `/credentials`, `/reviews` | Sticky nav rail, KPI grid, two-column layouts | ✅ screenshot verified |

## 4. Mock-data & business-rule compliance

| Rule | Evidence |
|------|----------|
| PER / CER / MER never combined | Dashboard KPIs are separate PER and MER cards; hospital rows show PER and CER modules separately (`association-ratings` slot) |
| Null ratings never 0 | MetroPulse CER renders "Not yet rated"; rating helpers use `NOT_RATED_MESSAGE` from `constants/rating.ts` |
| MER vs PER distinct tracks | MER KPI hint: "Independent of PER — separate evidence track"; credentials page framed as MER evidence track |
| No patient notification | Accept/reject/reschedule and consultation responses all render explicit "patient was NOT notified" copy |
| Medical reports privacy | Report labels render with "Access not granted"; contents never displayed |
| Registration masking | `DMC-XXXX92` masked everywhere; labelled fictional |
| Review text immutable | Reply composer copy forbids editing/deleting patient review text; replies only for published, unreplied reviews |
| Demo sign-out | Confirm dialog states there is no real session; recovery actions provided |

## 5. Issues found during verification and their fixes

| # | Issue | Fix |
|---|-------|-----|
| 1 | First `typecheck` failed: `appointments-client.tsx` referenced non-existent `AppointmentStatus` value `"rejected"` (3 errors) and imported `formatDate`/`formatDateTime` from the wrong module | Rejection now maps to the fixture contract's `"cancelled"` status; formatters imported from `features/doctor-portal/format` |
| 2 | Stale `.next/dev/types` produced phantom route-type errors | Cleared stale dev types; regenerated |
| 3 | ESLint error: unescaped apostrophe in `reviews-client.tsx` | Escaped (`&apos;`) |
| 4 | 13 ESLint unused-import/variable warnings across 6 A10 files | Removed dead imports (`Separator`, `CardTitle`, `CardDescription`, `Select*` family, `formatDate`, `ROUTES`, unused `doctor` prop, unused `toggleValue`, unused `doctorReviews`) |
| 5 | Production build failed prerendering `/doctor-portal`: "Functions cannot be passed directly to Client Components" — lucide icon components inside `doctorPortalNav` crossed the server→client boundary when the server layout passed them as props to the client `PortalSidebar` | Added `features/doctor-portal/doctor-portal-shell.tsx` client wrapper that imports the frozen nav registry itself (identical to A09's `HospitalPortalShell` pattern); layout updated; also aligned metadata with A09 convention (`robots: { index: false, follow: false }`) |
| 6 | Test-environment incident (not a code bug): after a rebuild, an orphaned `next start` node child kept port 3210 and served stale HTML referencing a deleted CSS chunk (500 on the chunk, 0 parsed CSS rules), making `sm:` variants inert during one responsive pass | Killed the orphaned process (PID 24224), restarted the server on the fresh build, re-ran the responsive checks — all passed. Recorded here for audit transparency |

## 6. Known limitations (non-blocking)

1. **Availability is session-local.** The A01 data contract defines no availability entity, so the weekly editor keeps state in the page and resets on reload. This boundary is stated in the page UI itself ("changes reset when you reload").
2. **Consultation responses are page-local.** Case status/notes reset on reload, per the mock-actions contract; nothing is persisted.
3. **Profile save is a mock action.** `saveProvider` simulates persistence in the client only; the public doctor page still renders the frozen fixture.
4. **Settings toggles do not persist** — labelled "Changes are unsaved local state."
5. **DoctorKpi is a portal-local component** (not a clone of any shared catalog file) because the catalog KPI contract belongs to the A11 admin scope; documented in the component header.
6. **Error boundary not exercised live** — `error.tsx` exists and follows the Next 16 `retry` contract, but no route threw during testing, so it was verified by code review only.

## Final status: PASS

- All 9 assigned routes implemented, statically verified (typecheck ✅, lint ✅, production build ✅), and browser-tested on the production build (render + interactions + responsive breakpoints).
- All fixes were confined to A10-owned files (`app/doctor-portal/*`, `features/doctor-portal/*`).
- No shared, foundation, or other-agent files were modified.
