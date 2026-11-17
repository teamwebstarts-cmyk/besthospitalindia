# A09 — Hospital Portal QA Report

> Task: A09 — Hospital Portal implementation
> Method: `npm run typecheck`, `npm run lint`, production build (`npm run build`), then live browser testing. Every route was loaded in a real Chromium tab via CDP (dedicated headless Chrome instance, port 9333) at desktop 1280 px and mobile 375 px with device-metrics emulation, verifying render, overflow, navigation, enabled controls, and console errors. Responsive fixes were verified with an automated per-element overflow probe plus a min-content bisect that identified the exact offending subtrees. Run on 17 Nov 2026.
> Scope: 11 canonical routes under `app/hospital-portal/*` per the A09 agent plan and page specs `pages/46`–`pages/56`.

Legend: ✅ pass · ⚠️ pass with documented non-blocking issue

## 1. Static verification (commands + actual results)

| Check | Command | Result |
|-------|---------|--------|
| TypeScript strict | `npm run typecheck` (`tsc --noEmit`) | ✅ exit 0 |
| ESLint | `npm run lint` (`eslint`) | ✅ exit 0, 0 errors, 0 warnings (after clearing earlier issues, see §5) |
| Production build | `npm run build` | ✅ exit 0; compiled successfully; all 11 hospital-portal routes emitted (7 `○ Static`, 4 `ƒ Dynamic` where `searchParams` deep links are read) |

Build route table excerpt (from actual build output):

```
├ ○ /hospital-portal
├ ƒ /hospital-portal/appointments
├ ○ /hospital-portal/doctors
├ ○ /hospital-portal/documents
├ ƒ /hospital-portal/enquiries
├ ○ /hospital-portal/profile
├ ○ /hospital-portal/ratings
├ ƒ /hospital-portal/reviews
├ ○ /hospital-portal/settings
├ ○ /hospital-portal/specialities
├ ○ /hospital-portal/team
```

## 2. Route verification (live browser)

| # | Route | h1 | Portal nav links | Enabled controls | Result |
|---|-------|----|------------------|------------------|--------|
| 1 | `/hospital-portal` | "Dashboard" | 12 | 1+ | ✅ KPI row (Open enquiries 2, Appointment requests 2, Profile completion 100%, Reviews to answer 1) all derived from the same scoped fixture selectors as the four queue cards below them; verification strip + document attention list; every queue row deep-links into its module |
| 2 | `/hospital-portal/profile` | "Profile" | 12 | 3+ | ✅ Public-profile draft form (name/city/state/facility type/email/overview) with `lib/validation` rules, dirty-state tracking, Reset draft, mock `saveProvider` save with simulated latency and "never published" boundary copy; record-status, gallery-metadata and accreditation side cards |
| 3 | `/hospital-portal/specialities` | "Specialities" | 12 | 14 | ✅ Taxonomy-constrained offering manager: add/remove specialty + treatment offerings with per-card counts; edits cannot invent taxonomy entries |
| 4 | `/hospital-portal/doctors` | "Doctors" | 12 | 15 | ✅ Associated doctor list with independent PER/CER modules; live search over `searchHospitals`-style doctor selectors; request association → pending state with Withdraw; remove association gated by `ConfirmDialog` |
| 5 | `/hospital-portal/appointments` | "Appointments" | 12 | 5 | ✅ Status filter toolbar; accept / reject / reschedule via dialog with date validation; rows flip status with local-update timestamp and explicit "patient was NOT notified" boundary copy; `DataTable` with mobile card fallback |
| 6 | `/hospital-portal/enquiries` | "Enquiries" | 12 | 4 | ✅ Filter + detail drawer (patient, country, specialty, consent timestamp); assign owner + move status locally; deep link `?enquiry=` pre-selects the record |
| 7 | `/hospital-portal/reviews` | "Reviews" | 12 | 3+ | ✅ Published review list with star display decoupled from ratings; reply composer with character counter — replies stay local drafts; deep link `?review=` highlights the card |
| 8 | `/hospital-portal/documents` | "Documents" | 12 | 3+ | ✅ Accreditation/legal checklist with expiry logic (warning ≤ 90 days, danger when expired); upload flow is mock metadata only (file name/size in local state; never marks verified) |
| 9 | `/hospital-portal/ratings` | "Ratings" | 12 | 3+ | ✅ Independent PER panel (4.2/5) and CER panel ("Not yet rated" — null never rendered as 0); assessment criteria with weights/scores ("Not yet scored" for nulls); evidence list; evidence submission mock with explicit "No self-publish" badge |
| 10 | `/hospital-portal/team` | "Team" | 12 | 5 | ✅ Partner-user table; role selector restricted to permitted hospital roles; invite placeholder; revoke/restore access gated by `ConfirmDialog` |
| 11 | `/hospital-portal/settings` | "Settings" | 12 | 4 | ✅ Notification/display preference toggles (labelled unsaved local state); security form with mock-only password rules; sign-out via `ConfirmDialog` navigating home |

Supplementary:

| Check | Result |
|-------|--------|
| Console errors during the full 22-page run (11 routes × 2 viewports) | 0 errors captured across all pages |
| Loading states | `app/hospital-portal/loading.tsx` (header + KPI grid + table skeleton mirroring dashboard geometry) |
| Error boundary | `app/hospital-portal/error.tsx` with Next 16 `retry` prop contract + "Back to dashboard" recovery link; verified by code review (no route threw during testing) |
| Demo disclaimers | Portal layout carries the demo-portal notice via `PortalShell`; every page header labels records as fictional demo fixtures; every mutating control states its local-only boundary |
| Metadata | Portal-wide `robots: { index: false, follow: false }`; per-page titles via the `%s \| Hospital Portal` template |

## 3. Responsive verification (device-metrics emulation, live browser)

Every route was measured at both viewports with an automated scrollWidth probe:

| Viewport | Result across all 11 routes |
|----------|----------------------------|
| Desktop 1280 px | ✅ 11/11 PASS — no horizontal overflow (scrollWidth ≤ viewport) |
| Mobile 375 px | ✅ 11/11 PASS — `scrollWidth=375` on every route after fixes (see §5) |

Final measured run:

```
PASS [desktop-1280] /hospital-portal            scrollW=1265 h1="Dashboard"
PASS [desktop-1280] /hospital-portal/profile    scrollW=1265 h1="Profile"
... (all 11 pass)
PASS [mobile-375]  /hospital-portal            scrollW=375 h1="Dashboard"
PASS [mobile-375]  /hospital-portal/profile    scrollW=375 h1="Profile"
... (all 11 pass)
```

Data tables (`doctors`, `appointments`, `enquiries`, `team`) intentionally scroll inside their card containers on mobile — the page itself does not overflow; the table region scrolls (verified: page `scrollWidth` stays 375 while the inner table is wider).

Visual evidence captured during this session:

| Screenshot | What it shows |
|-----------|---------------|
| `C:\Users\Surendra Manjhi\AppData\Local\Temp\a09-dash-desktop.png` | Dashboard at 1280 px — KPI row, verification strip, four action queues |
| `C:\Users\Surendra Manjhi\AppData\Local\Temp\a09-dash-mobile.png` | Dashboard at 375 px — fully stacked, no horizontal overflow |
| `C:\Users\Surendra Manjhi\AppData\Local\Temp\a09-ratings-desktop.png` | Ratings at 1280 px — independent PER/CER panels, criteria, evidence with "No self-publish" badge |

## 4. Mock-data & business-rule compliance

| Rule | Evidence |
|------|----------|
| PER / CER / MER never combined | Ratings page renders PER and CER as separate panels with an explicit "Independent metrics" callout; dashboard/profile never merge them into a composite score |
| Null ratings never 0 | CER renders "Not yet rated"; assessment criteria with null scores render "Not yet scored"; `constants/rating.ts` (`NOT_RATED_MESSAGE`, `RATING_SCALE_MAX`) is the single source of these strings |
| Verification / evidence distinction | Document checklist keeps `under_review` / `submitted` / `rejected` / `expired` statuses distinct; nothing in the portal UI can set a document to verified — admin review is stated as the only path |
| No self-publishing of ratings | Evidence submission mock displays a "No self-publish" badge and boundary copy; submissions never alter PER/CER display |
| Deep links reconcile with queues | Dashboard queue rows link to `?enquiry=`, `?request=`, `?review=`, `?document=` targets that the module pages consume (awaited `searchParams`, Next 16 contract) |
| No real integrations | No fetch/API calls; all mutations are page-local state or `lib/mock-actions` (`saveProvider`), each stating its "nothing was sent/stored" boundary |
| Demo scoping documented | `demo-context.ts` documents (in-code) the demo-only scoping rules for enquiries/appointments queues; portal banner labels all data fictional |

## 5. Issues found during verification and their fixes

| # | Issue | Fix |
|---|-------|-----|
| 1 | First data-binding pass used non-existent selectors `getHospitalById` / `getDoctorById` (TS2724) | Switched to the `@/data` dictionary maps `hospitalById[...]` / `doctorById[...]` |
| 2 | `DataTable` rows prop is mutable-typed; readonly fixture arrays rejected (TS4104) | Spread into mutable copies (`rows={[...filtered]}`) at the two queue managers |
| 3 | ESLint `react-hooks/set-state-in-effect` on deep-link query-param init (enquiries, reviews) | Replaced sync-`setState` effects with lazy `useState` initializers reading the awaited `searchParams` value |
| 4 | ESLint `react/no-unescaped-entities` (apostrophes) | Escaped (`&apos;`) |
| 5 | Unused imports/variables across 4 files after refactors | Removed (`setAssociatedIds`, `Trash2Icon`, `cn`, `EmptyState`, etc.) |
| 6 | **Mobile 375 px overflow** — `/hospital-portal/profile` measured 491 px, `/hospital-portal` 381 px. Root cause found by CDP min-content bisect: grids declared without an explicit mobile template (e.g. `grid gap-4 lg:grid-cols-2`) size implicit `auto` tracks to the **min-content** of their children; truncating nowrap rows and the `field-sizing: content` textarea inflated tracks to 365–427 px | Added explicit `grid-cols-1` mobile templates to every A09 grid (13 occurrences across 11 files) so tracks resolve to `minmax(0, 1fr)` and can shrink; re-probe: all 11 routes measure exactly 375 px |
| 7 | Lint warnings from temporary CDP probe scripts parked under `scripts/` | Diagnostic tooling moved out of the lint scope (not shipped as app code) |
| 8 | Test-environment incident (not a code bug): running the production build clobbered the shared `.next` directory used by the long-running dev server on port 3101, and a separate session's browser tab was concurrently repurposed (Doctor Portal navigation observed mid-test) | Restarted verification against the surviving dev server on port 3000 and switched to a dedicated headless Chrome instance (own profile dir, debug port 9333) so testing is fully isolated; all affected checks re-run and passed. Recorded for audit transparency |

## 6. Known limitations (non-blocking)

1. **All mutations are session-local.** Profile saves, offering changes, appointment decisions, enquiry assignments, reply drafts, document uploads, team changes, and settings toggles reset on reload — each control states this in the UI (contract-faithful; no persistence exists in the mock phase).
2. **Public hospital page still renders the frozen fixture.** The profile form's mock save never mutates the public directory record (per `mock-actions` contract; publication requires admin verification, which the demo does not simulate).
3. **Ratings are read-only by design.** Evidence submission is a labelled mock; it cannot change PER/CER, and no self-publish path exists.
4. **`QueueList` and `DashboardKpi` are portal-local compositions.** The catalog lists them for pages/46 but no shared implementation exists; shared-component extraction is logged in the A09 report (§6) rather than silently adding to `components/shared`.
5. **Error boundary verified by code review only** — no route threw during live testing.
6. **Diagnostic probe scripts** used during QA live outside the repo lint scope in a workspace scratch folder; they are not part of the app bundle.

## Final status: PASS

- All 11 assigned routes implemented to their page specs, statically verified (typecheck ✅, lint ✅, production build ✅), and browser-tested live (render + navigation + responsive at 1280/375 px + console-error capture).
- The two mobile-overflow defects found by testing were root-caused and fixed; the fix pattern was applied preventively to all A09 grids.
- Rating-integrity (PER/CER/MER independence, nulls never 0), verification/evidence distinction, and demo-boundary rules from the brief are enforced in code and verified in the running app.
- All work is confined to A09-owned paths (`app/hospital-portal/*`, `features/hospital-portal/*`); no dependencies added; no shared, foundation, or other-agent files modified.
