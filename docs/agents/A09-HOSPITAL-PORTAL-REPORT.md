# A09 — Hospital Portal Implementation Report

> Agent: A09
> Scope: Hospital Portal frontend (`/hospital-portal/*`) for BestHospitalIndia.com
> Final status: **PASS** (see §10)

## 1. Routes and screens implemented

| Route | File | Spec | Key features |
|-------|------|------|--------------|
| `/hospital-portal` | `app/hospital-portal/page.tsx` | pages/46 | KPI row (open enquiries, pending appointment requests, profile completion %, reviews to answer) derived from the same scoped selectors as the four action-queue cards; verification + document-attention strip; every queue row deep-links into its module with `?enquiry=` / `?request=` / `?review=` / `?document=` |
| `/hospital-portal/profile` | `app/hospital-portal/profile/page.tsx` | pages/47 | Public-profile draft form (name/city/state/facility type/contact email/overview) with validation and dirty tracking; record-status card with `VerificationBadge`; gallery metadata list; accreditations with status badges; "View public profile" link to the A04 page for the same fixture |
| `/hospital-portal/specialities` | `app/hospital-portal/specialities/page.tsx` | pages/48 | Specialty + treatment offering manager constrained to the frozen taxonomy; add/remove offerings with counts; taxonomy edits explicitly out of scope in copy |
| `/hospital-portal/doctors` | `app/hospital-portal/doctors/page.tsx` | pages/49 | Association list with independent PER/CER display; doctor search; request-association → pending (local) with Withdraw; remove gated by `ConfirmDialog` |
| `/hospital-portal/appointments` | `app/hospital-portal/appointments/page.tsx` | pages/50 | Status filter toolbar; accept / reject / reschedule dialog with future-date validation; local decision timestamps; "patient was NOT notified" notices; `DataTable` + mobile cards |
| `/hospital-portal/enquiries` | `app/hospital-portal/enquiries/page.tsx` | pages/51 | Filterable queue; detail drawer (patient, country, specialty, consent); assign owner; move status locally; `?enquiry=` deep link pre-selection |
| `/hospital-portal/reviews` | `app/hospital-portal/reviews/page.tsx` | pages/52 | Published-review list with star display decoupled from platform ratings; reply composer with character counter (draft-only); status filter; `?review=` deep link highlight |
| `/hospital-portal/documents` | `app/hospital-portal/documents/page.tsx` | pages/53 | Accreditation/legal checklist with expiry states (ok / warning ≤ 90 days / expired / rejected / under review / submitted); mock metadata upload that never marks a document verified |
| `/hospital-portal/ratings` | `app/hospital-portal/ratings/page.tsx` | pages/54 | Independent PER panel (4.2/5) and CER panel ("Not yet rated"); assessment criteria with weights + scores ("Not yet scored" for nulls); evidence list; evidence submission mock with "No self-publish" badge |
| `/hospital-portal/team` | `app/hospital-portal/team/page.tsx` | pages/55 | Partner-user table (`DataTable`); role selector limited to hospital roles (`owner`, `staff`); invite placeholder; revoke/restore with `ConfirmDialog` |
| `/hospital-portal/settings` | `app/hospital-portal/settings/page.tsx` | pages/56 | Notification + display preference toggles (unsaved local state, labelled); security form with mock-only password rules; mock sign-out via `ConfirmDialog` → navigates home |

Supporting states:

| File | Purpose |
|------|---------|
| `app/hospital-portal/layout.tsx` | Portal layout: title template + `robots: { index: false, follow: false }` + `HospitalPortalShell` |
| `app/hospital-portal/loading.tsx` | Dashboard-shaped skeleton (header block + KPI grid + table) |
| `app/hospital-portal/error.tsx` | Portal error boundary (Next 16 `retry` prop) with "Back to dashboard" recovery |

## 2. Files created and modified

### Created (A09-owned)

```
features/hospital-portal/
  demo-context.ts                demo session binding + pure scoped selectors (KPIs reconcile with queues)
  demo-session.ts                demo partner identity helpers
  dashboard-kpi.tsx              portal KPI card (nulls never render as 0)
  queue-list.tsx                 dashboard action queue (ul/li, StatusBadge + deep link)
  portal-page-header.tsx         label + description + optional action header
  hospital-portal-shell.tsx      client shell wrapper (nav registry import; see §7)
  hospital-profile-form.tsx      profile client island (validated draft save)
  specialty-offerings-manager.tsx
  doctor-association-manager.tsx
  appointment-queue-manager.tsx
  enquiry-queue-manager.tsx
  review-response-manager.tsx
  document-checklist-manager.tsx
  evidence-submit-mock.tsx
  team-manager.tsx
  settings-manager.tsx
app/hospital-portal/
  layout.tsx, page.tsx, loading.tsx, error.tsx
  profile/page.tsx
  specialities/page.tsx
  doctors/page.tsx
  appointments/page.tsx
  enquiries/page.tsx
  reviews/page.tsx
  documents/page.tsx
  ratings/page.tsx
  team/page.tsx
  settings/page.tsx
docs/qa/A09-HOSPITAL-PORTAL-QA.md
docs/agents/A09-HOSPITAL-PORTAL-REPORT.md   (this file)
```

### Modified (A09-owned only)

- `app/hospital-portal/page.tsx`, `app/hospital-portal/profile/page.tsx`, `app/hospital-portal/ratings/page.tsx` and 8 `features/hospital-portal/*` client managers — responsive hardening pass: explicit `grid-cols-1` mobile templates on every grid (QA §5.6); no behavioral changes.
- Earlier iterations of the same A09 files only (selector fixes, readonly-array spreads, lazy `useState` deep-link init, lint cleanups). No file outside `app/hospital-portal/**` and `features/hospital-portal/**` was created or modified.

### Not modified

No A00/A01 foundation or data-contract files, no shared `components/**`, no `constants/**`, no `lib/**`, no A02–A07 public pages, no Doctor/Admin portal files, no `package.json`/lockfile. Zero dependencies added.

## 3. Features and interactions completed

- **Dashboard**: reconciling KPI row and queues — every number is computed by the same pure selectors (`demo-context.ts`) that project the queue rows, so totals always match the module pages; deep-linked actions land pre-selected in the target module.
- **Profile**: validated draft form (`required`, `minLength`, `maxLength`, `email` from `lib/validation`), unsaved-changes tracker, reset, simulated-latency save via `saveProvider` with explicit "local draft, never published" feedback.
- **Specialities**: taxonomy-safe offering management (only existing specialty/treatment ids can be offered; counts reflect the fixture).
- **Doctors**: search, request (pending + withdraw), remove-with-confirm; PER/CER rendered as independent modules on association rows.
- **Appointments**: filter + accept/reject/reschedule state machine with date validation, decision metadata, and no-notification boundary copy on every action.
- **Enquiries**: filter + drawer detail, owner assignment, status movement — all page-local with timestamps.
- **Reviews**: reply drafts only (never edits patient text), character counter, status filter, deep-link highlight.
- **Documents**: expiry-aware checklist (90-day warning window), status distinction preserved, upload mock stores name/size only and cannot set "verified".
- **Ratings**: independent PER/CER panels, weighted criteria with "Not yet scored" nulls, evidence records, mock evidence submission with "No self-publish" badge.
- **Team**: role changes restricted to permitted hospital roles; revocation/restore behind `ConfirmDialog`.
- **Settings**: preference toggles (labelled unsaved), mock password change with rule validation, ConfirmDialog-gated sign-out.
- **Cross-cutting**: mobile Sheet navigation via `PortalShell`, per-page metadata, loading skeleton, error boundary, demo banner everywhere.

## 4. Mock-data contracts used

- `data/` frozen fixtures via `@/data` maps: `hospitalById`, `doctorById`, `specialtyById`, `treatmentById`, `partnerUsers`, `patientEnquiries`, `appointments`, `reviewsForProvider`, `assessmentsForProvider`, `notifications`.
- Demo session binding: hospital `hosp-sunrise-delhi` + partner user `pu-sunrise-owner` (role `owner`), linked by `PartnerUser.hospitalId` (`types/portal.ts`).
- `lib/search.ts` → `getRelatedDoctors` (doctor association candidates).
- `lib/validation.ts` → `validate`, `required`, `minLength`, `maxLength`, `email`, `FieldValues`, `ValidationErrors`.
- `lib/mock-actions.ts` → `saveProvider` (profile draft save only).
- `constants/rating.ts` → `NOT_RATED_MESSAGE`, `RATING_SCALE_MAX`, `RATING_LABELS` (null ratings never render as 0).
- `constants/routes.ts` → `ROUTES.hospitalPortal.*`, `hospitalProfileHref`.
- `constants/navigation.ts` → `hospitalPortalNav` (consumed, not modified).
- Types: `Hospital`, `Doctor`, `AppointmentRequest`, `PatientEnquiry`, `Review`, `HospitalDocument`, `RatingAssessment`, `PartnerUser`, `VerificationStatus`.

Key fixture bindings for the demo session (Sunrise Multispeciality Hospital, Delhi): 2 open enquiries (e.g. `ENQ-7C8D`, Arif Khan, Orthopaedics), 2 pending appointment requests, 1 published review awaiting reply (`rev-…` "Good care, busy waiting area", 4/5), PER 4.2/5, CER not yet rated, 4 document attention items (expired insurance empanelment, submitted bio-medical waste, 2 under review).

## 5. Shared components reused (A00/A01 foundation)

`PortalShell`, `PortalSidebar` (via the `HospitalPortalShell` client wrapper), `Breadcrumbs` (via portal header composition), `StatusBadge`, `VerificationBadge`, `EmptyState`, `LoadingSkeleton`, `DataTable`, `ConfirmDialog`, `ErrorState`, `DemoFormFeedback`/`demo-notice`, shadcn/Base UI kit (`Button`, `Card`, `Dialog`, `Sheet`, `Select`, `Input`, `Label`, `Textarea`, `Badge`, `Separator`, `Checkbox`), lucide-react icons, design tokens from `globals.css`.

Portal-local compositions (catalog names with no shared implementation yet, kept in `features/hospital-portal` with header comments): `DashboardKpi`, `QueueList`.

## 6. Contract changes requested

None. Two documented gaps, both resolved without touching shared files:

1. **`QueueList` / `DashboardKpi`** are listed by pages/46 but have no shared implementation. They are implemented portal-locally. If the foundation team later promotes them to `components/shared`, the A09 implementations are drop-in candidates (props are already generic).
2. **No evidence-upload or document-replace contract exists** in the mock phase. The documents page therefore simulates metadata capture only and says so in the UI; no fake integration was invented.

## 7. Technical decisions and build fixes

1. **Server→client icon boundary.** `hospitalPortalNav` carries lucide icon components and `PortalSidebar` is a Client Component; component references cannot cross the server→client boundary as props (production prerender fails with "Functions cannot be passed directly to Client Components"). Fixed with `features/hospital-portal/hospital-portal-shell.tsx`, a thin `"use client"` wrapper that imports the frozen nav registry itself and composes `PortalShell`. This pattern was later replicated by A10 (`DoctorPortalShell`).
2. **Next 16 async request APIs.** All pages reading query strings are Server Components that `await searchParams` (the Next 16 Promise contract); deep-link values are passed into client islands as plain props.
3. **React 19 lint compliance.** Deep-link pre-selection uses lazy `useState` initializers instead of synchronous `setState`-in-`useEffect` (`react-hooks/set-state-in-effect`), so `?enquiry=` / `?review=` are consumed on first render without extra passes.
4. **Deterministic rendering.** Dashboard dates are formatted with a shared `en-IN` medium-date helper and a pinned `DEMO_TODAY` constant, keeping SSR/client output identical.
5. **Responsive grid discipline.** CDP measurement + a min-content bisect proved that Tailwind grids without an explicit mobile template (`grid gap-4 lg:grid-cols-2`) create implicit `auto` tracks sized to children's min-content, which nowrap/truncate patterns and `field-sizing: content` inputs inflate. Every A09 grid now declares `grid-cols-1` at the base breakpoint (13 sites across 11 files), and the full 375 px probe passes on all 11 routes.
6. **Portal metadata.** `robots: { index: false, follow: false }`; portals stay out of public SEO per `10-routing-and-layouts.md`.

## 8. Verification commands and actual results

| Command | Result |
|---------|--------|
| `npm run typecheck` | exit 0 |
| `npm run lint` | exit 0, 0 errors, 0 warnings (diagnostic probe scripts moved out of lint scope first; see QA §5.7) |
| `npm run build` | exit 0; compiled successfully; all 11 `/hospital-portal` routes emitted (7 `○ Static`, 4 `ƒ Dynamic` via `searchParams`) |
| Live browser (dedicated headless Chrome via CDP, dev server) | 11 routes × 2 viewports = 22 checks, all PASS; correct `h1`, 12 portal nav links on every page, enabled interactive controls on every page, 0 console errors |
| Responsive probes | 375 px: `scrollWidth=375` on all 11 routes; 1280 px: no overflow on all 11 routes |
| Screenshots | Dashboard (desktop + mobile) and Ratings (desktop) captured and visually inspected during this session |

Browser-tested interactions (dev server, real CDP-driven pages):

- Dashboard queue rows → deep links into enquiries/appointments/reviews/documents with pre-selection.
- Profile: edit → dirty state → save (simulated latency + "draft saved" boundary feedback) → reset draft.
- Appointments/enquiries: filter changes, dialog opens, local status flips with timestamped decisions.
- Reviews: reply composer accepts input with live counter; drafts stay local.
- Documents: expiry badges; upload mock records file name/size locally only.
- Ratings: evidence mock shows "No self-publish" boundary; PER/CER stay independent.
- Team: role select changes; revoke/restore behind confirmation dialogs.
- Settings: toggles + mock sign-out confirm → home.

## 9. Known bugs, limitations, and deferred items

1. **All mutations are session-local demo state** (resets on reload) — stated in the UI on every mutating control. Contract-faithful; the mock phase has no persistence.
2. **Public hospital page always renders the frozen fixture**; the profile draft save cannot change it (per `mock-actions`), and publication would require admin verification the demo does not simulate.
3. **Ratings are read-only**; the evidence submission is an explicitly labelled mock that cannot influence PER/CER.
4. **`DashboardKpi` / `QueueList` are portal-local** pending any future shared-component promotion (§6).
5. **Error boundary verified by code review only** — no route threw during live testing.
6. **Test-environment incidents** (documented in QA §5.8): the production build clobbered a shared `.next` directory used by a parallel dev server; a shared browser tab was concurrently repurposed by another session. Mitigated by moving all browser testing to a dedicated headless Chrome instance and finishing verification against the surviving dev server. No code impact.

## 10. Final status

**PASS** — All 11 canonical A09 routes are implemented to their page specifications, statically verified (typecheck, lint, and production build all clean), and browser-tested live at desktop and mobile widths including navigation, interactions, deep links, and console-error capture. The two mobile-overflow defects discovered during testing were root-caused (implicit grid track sizing) and fixed across all A09 grids. Rating-integrity rules (PER/CER/MER independence; nulls never rendered as 0), verification/evidence distinctions, and demo-boundary copy are enforced in code and verified in the running app. All work is confined to A09-owned paths; no dependencies were added; no shared, foundation, or other-agent files were modified.
