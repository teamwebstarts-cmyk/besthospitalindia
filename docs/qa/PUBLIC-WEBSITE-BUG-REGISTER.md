# Public Website — Bug Register (A15)

> Task: A15 — Public Website Functional Audit & Stabilization
> Environment: Next.js 16 (Turbopack) dev server, Chromium via CDP, `http://localhost:3000`, 17 Nov 2026.
> Classification legend: **[Broken]** user-facing failure · **[Incomplete]** reachable but unfinished · **[Mock-only]** intentional demo behavior · **[Visual]** cosmetic.

Severity guide: **Critical** = page unusable / crash. **High** = primary flow dead-ends or misleads. **Medium** = degraded UX. **Low** = cosmetic.

---

## BUG-001 · Root URL serves starter placeholder — [Broken] · **Critical**

| Field | Detail |
|---|---|
| Route | `/` |
| Component | `app/page.tsx` (shadowing `app/(public)/page.tsx`) |
| Repro | 1. Open `http://localhost:3000/`. 2. Observe content. |
| Expected | Public homepage: hero, search, hospital/doctor/treatment highlights, CTAs. |
| Actual | Next.js starter page: "Project ready!" / "You may now add components and start building." with a lone `Button`. |
| Evidence | Browser snapshot of `/` shows only `heading "Project ready!"`. Title is correct (`BestHospitalIndia — Find the Right Hospital`) because `(public)` layout metadata partially applies, but the page body is the starter. |
| Root cause | `app/page.tsx` (default scaffold) and `app/(public)/page.tsx` both resolve to route `/`. Next.js prioritizes the non-group `app/page.tsx`. |
| Fix | Delete `app/page.tsx` (and its CSS import if unused) so `app/(public)/page.tsx` becomes the homepage. Zero-risk, file removal only. |

## BUG-002 · Dynamic `[slug]` interpolated into `<Link>` hrefs — [Broken] · **Critical**

| Field | Detail |
|---|---|
| Routes | `/hospitals` 💥, `/doctors` 💥, `/doctors/[slug]` 💥, `/treatments/[slug]` 💥 (also any page rendering these cards: `/medical-tourism` 💥, plus related-provider sections) |
| Components | `features/providers/components/hospital-card.tsx`, `doctor-card.tsx`, `treatment-card.tsx`; same pattern in `app/(public)/hospitals/[slug]/page.tsx`, `doctors/[slug]/page.tsx`, `treatments/[slug]/page.tsx`, `features/providers/components/comparison-table.tsx:102`, hospital/compare pages |
| Repro | 1. Open `/hospitals` (or `/doctors`, `/treatments`, `/medical-tourism`, any hospital/doctor/treatment detail page). 2. Page immediately renders the route error boundary. |
| Expected | Directory grid renders; each card links to its profile (e.g. `/hospitals/sunrise-multispeciality-hospital-delhi`). |
| Actual | Error boundary: "Something went wrong while loading this section. Your data is safe — try again." Dev overlay digest points at `components\ui\button.tsx (49:5) @ Button`. |
| Evidence | Live snapshots of all five routes show only the error boundary + footer; server HTML contains no card content. Error digest: `components\ui\button.tsx (49:5) @ Button`. |
| Root cause | hrefs are built as `` `${ROUTES.public.hospitalProfile}/${hospital.slug}` `` where `hospitalProfile: '/hospitals/[slug]'` → literal `/hospitals/[slug]/sunrise-…`. Next.js App Router throws: *"Dynamic href '/hospitals/[slug]/…' found in `<Link>` while using the '/app' router, this is not supported."* The Facilities directory avoids this by using `'/facilities/' + slug` directly, which is why it works. |
| Fix | Shared fix: add route-builder helpers (e.g. `hospitalProfileHref(slug)`, `doctorProfileHref(slug)`, `treatmentDetailHref(slug)`) in `constants/routes.ts` (or a new `lib/routes.ts`) that replace `[slug]`; replace every template-string concat. One root-cause fix repairs 7+ routes. |

## BUG-003 · Hospital compare crashes when a hospital is selected — [Broken] · **Critical**

| Field | Detail |
|---|---|
| Route | `/hospitals/compare?ids=hosp-sunrise-delhi` |
| Components | `app/(public)/hospitals/compare/page.tsx` → `features/providers/components/comparison-table.tsx` (line 102) |
| Repro | 1. Open `/hospitals/compare`. 2. Add any hospital via the combobox (tested with keyboard: ArrowDown → Enter). 3. URL updates to `?ids=hosp-sunrise-delhi` and page crashes. (Same crash on direct load of the URL.) |
| Expected | Comparison table shows the selected hospital with separate PER and CER rows. |
| Actual | Full error boundary: "Something went wrong while loading this section." |
| Evidence | Fresh navigation to `/hospitals/compare?ids=hosp-sunrise-delhi` reproduces the boundary deterministically; snapshot captured. |
| Root cause | `comparison-table.tsx:102`: `` href={`${ROUTES.public.hospitalProfile}/${hospital.slug}`} `` — same `[slug]` interpolation as BUG-002, triggered the moment the table renders with ≥1 hospital. Empty state renders fine, masking the bug in shallow testing. |
| Fix | Covered by the BUG-002 route-helper fix. After fix, retest the full add-3-hospitals flow, PER/CER rows, remove-chip, Clear all, and shareable URL. |

## BUG-004 · Hospital & doctor profile pages crash on direct load — [Broken] · **Critical**

| Field | Detail |
|---|---|
| Routes | `/hospitals/sunrise-multispeciality-hospital-delhi` (200 + boundary), `/doctors/dr-aarav-mehta` (200 + boundary) |
| Components | `app/(public)/hospitals/[slug]/page.tsx`, `app/(public)/doctors/[slug]/page.tsx` (related-doctor cards, CTA links) |
| Repro | 1. Open a hospital or doctor profile URL directly. 2. Page shows only the error boundary. |
| Expected | Full profile: overview, PER/CER blocks, linked doctors/hospital, enquiry CTAs. |
| Actual | "Something went wrong while loading this section." |
| Evidence | Snapshots captured for both URLs; HTTP 200 with boundary HTML. |
| Root cause | Same `[slug]` href interpolation in canonical/related link construction (metadata + rendered links). |
| Fix | BUG-002 helpers; then verify related-doctor/related-hospital cross-links navigate correctly. |

## BUG-005 · `/treatments` crashes passing a function to a Client Component — [Broken] · **Critical**

| Field | Detail |
|---|---|
| Route | `/treatments` |
| Component | `app/(public)/treatments/page.tsx` → `<Pagination buildHref={buildPageHref}>` |
| Repro | 1. Open `/treatments`. 2. Error boundary renders instead of the treatment grid. |
| Expected | Treatment grid + working pagination. |
| Actual | Crash before paint. |
| Evidence | Snapshot captured; HTTP 200 but boundary only. |
| Root cause | `treatments/page.tsx` is an async Server Component passing the inline closure `buildPageHref` to `Pagination` (client). React cannot serialize functions across the boundary → *"Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with 'use server'"*. `/hospitals` avoids this by using `UrlPagination`, which builds URLs from serializable params. |
| Fix | Swap `Pagination` → `UrlPagination` on `/treatments` (mirroring `/hospitals`), or pass serializable query params. Independent of BUG-002 but same page also has BUG-002 links. |

## BUG-006 · Treatment detail pages crash — [Broken] · **Critical**

| Field | Detail |
|---|---|
| Route | `/treatments/bypass-surgery` (and all 12+ treatment slugs) |
| Component | `app/(public)/treatments/[slug]/page.tsx` |
| Repro | 1. Open `/treatments/bypass-surgery`. 2. Error boundary. |
| Expected | Treatment overview, related hospitals/doctors, enquiry CTA. |
| Actual | Error boundary. |
| Evidence | Snapshot captured; HTTP 200 + boundary. |
| Root cause | `[slug]` href interpolation in treatment detail links (BUG-002 family). |
| Fix | BUG-002 helpers. |

## BUG-007 · `/medical-tourism` crashes on render — [Broken] · **Critical**

| Field | Detail |
|---|---|
| Route | `/medical-tourism` |
| Component | `app/(public)/medical-tourism/page.tsx` |
| Repro | 1. Open `/medical-tourism`. 2. Error boundary. |
| Expected | Tourism support content + international patient enquiry form. |
| Actual | Error boundary. Earlier in this session the enquiry form did function (submit produced demo ref `ENQ-HYSA`), so the regression is page-level, not form-level. |
| Evidence | Snapshot captured. |
| Root cause | Most likely a `[slug]` link (e.g. related treatment/hospital cards) or another server→client serialization on this page; needs one stack-trace check when fixing. |
| Fix | After BUG-002 helpers, re-open and confirm; if still crashing, inspect for function-passing props. |

## BUG-008 · "12 facilitys found" — grammar/pluralization — [Visual] · **Low**

| Field | Detail |
|---|---|
| Route | `/facilities` |
| Component | Results counter in facilities directory |
| Repro | 1. Open `/facilities`. 2. Read results counter. |
| Expected | "12 facilities found". |
| Actual | "12 facilitys found". |
| Evidence | Browser-verified text earlier in session. |
| Root cause | Naive `+ "s"` pluralization. |
| Fix | Hardcode "facilities" or add a tiny pluralize helper. |

## BUG-009 · Hydration mismatch on every header-bearing page — [Broken] (console) · **Medium**

| Field | Detail |
|---|---|
| Routes | Every page rendering `PublicHeader` (verified on `/about`, `/for-hospitals`, `/facilities/*`, `/hospitals/compare`, …) |
| Component | `components/layout/public-header.tsx` (digest points at `BrandLink`, ~line 42 and 68) |
| Repro | 1. Load any page. 2. Open console / Next.js issues overlay. 3. Hydration error: "Text content does not match server-rendered HTML" / attribute mismatch; dev overlay shows server/client diff (observed diffing the whole footer + header tree). |
| Expected | Clean hydration. |
| Actual | Hydration mismatch error each navigation; React re-renders the tree client-side (cost + flash risk). |
| Evidence | Dev-server terminal shows the full hydration diff; browser overlay shows `components/layout/public-header.tsx (42:5) @ BrandLink` and `(68:13)`. |
| Root cause | Server/client divergent output in `BrandLink` (e.g. `typeof window`/locale/date-dependent values, or unstable `useId`-style keys). Needs code read to pin exact line. |
| Fix | Make BrandLink output deterministic (no client-only values in initial render). Medium effort; isolated to one component. |

## BUG-010 · OTP success dead-ends at `/patient` 404 — [Incomplete] · **High**

| Field | Detail |
|---|---|
| Route | `/auth` → post-OTP redirect |
| Component | `features/content/auth-entry-card.tsx` (`router.push(PATIENT_ROUTES.dashboard)`) |
| Repro | 1. Open `/auth`. 2. Choose a role. 3. Enter valid demo OTP (`285052` verified). 4. Land on 404. |
| Expected | Clear demo-completion state (portals are out of scope). |
| Actual | `router.push('/patient')` → branded 404 ("Page not found"). |
| Evidence | Browser-verified earlier in session. |
| Root cause | Redirect target is a portal route that does not exist in this phase. |
| Fix | Replace redirect with an in-page mock success card (e.g. "Signed in (demo) — patient portal ships next phase") or redirect to `/` with a toast. No portal work in this task. |

## BUG-011 · 404 page lacks site chrome — [Visual] · **Low**

| Field | Detail |
|---|---|
| Route | any unmatched URL |
| Component | `app/not-found.tsx` |
| Repro | 1. Open `/definitely-not-a-real-page-xyz`. |
| Expected | Branded 404 with header/footer for continued navigation. |
| Actual | Minimal branded page with only "Go to homepage" + "Browse hospitals" links (both work). |
| Evidence | Snapshot + screenshot captured. |
| Root cause | `not-found.tsx` renders outside the `(public)` layout. |
| Fix | Optional: move/duplicate nav into the 404, or accept as-is. |

## BUG-012 · Base UI `nativeButton` warning from header buttons — [Broken] (console) · **Medium**

| Field | Detail |
|---|---|
| Routes | All pages (header) |
| Component | `components/layout/public-header.tsx` via `components/ui/button.tsx` (`Button` wrapping `<Link>`/`<a>`) |
| Repro | 1. Load any page. 2. Console shows: *"Base UI: A component that acts as a button expected a native `<button>` because the `nativeButton` prop is true…"* (2× per page: BrandLink + Sign in). |
| Expected | No warnings; correct semantics (`<a>` keeps link semantics). |
| Actual | Repeated warnings; risk of broken form/`type` semantics and a11y drift. |
| Evidence | Dev-server terminal trace: `at Button … at PublicHeader … at PublicLayout`. |
| Root cause | `Button` (Base UI primitive) defaults `nativeButton: true`; header uses `render={<Link/>}` without `nativeButton={false}`. |
| Fix | In `components/ui/button.tsx` (or call sites), set `nativeButton={false}` whenever `render` is a non-button element. Shared-component fix. |

## BUG-013 · SSR HTML missing interactive controls on form pages — [Incomplete] · **Medium**

| Field | Detail |
|---|---|
| Routes | `/for-hospitals` (verified); likely other client-form pages |
| Component | Client form components |
| Repro | 1. `curl`/fetch `/for-hospitals` before hydration: raw `<input name="organisation">` etc. exist but fields that were verified to work only after JS load (combobox options, validation feedback) are absent/inert in pre-hydration HTML. During testing, native `input[type=text]` value-set via native setter + synthetic events did not register with the framework state until real interactions. |
| Expected | Forms functional after hydration (they are), no duplicate DOM churn. |
| Actual | Works after hydration; first-paint HTML lacks select options and validation UI. |
| Evidence | Interaction testing during session: synthetic value/come events ignored pre-hydration, worked after. |
| Root cause | Standard CSR form mount; not a crash. Logged so portal phases don't mistake it for breakage. |
| Fix | None required now. Re-evaluate only if SEO/first-paint interaction becomes a requirement. |

---

## Verified-working interactions (for balance)

| Feature | Route | Evidence |
|---|---|---|
| Facilities search / filter / sort / pagination / card links | `/facilities` | `?q=imaging`, `?category=diagnostic_lab`, `?sort=name-asc` all browser-tested; 6+ facility links extracted, one detail page opened |
| Facility detail page | `/facilities/[slug]` | Full render: overview, specialties, services, verification state, CTAs |
| Free consultation form E2E | `/free-consultation` | Validation, char counter, disabled submit, confirmation `ENQ-41ZW` |
| International enquiry form E2E (pre-regression) | `/medical-tourism` | Confirmation `ENQ-HYSA` |
| Contact form E2E | `/contact` | Purpose select, submit, confirmation `MSG-A21M` |
| Hospital interest form E2E | `/for-hospitals` | Required-field errors, facility-size select, confirmation `HOS-ELT0` |
| Desktop nav + "More" dropdown | header | Opens; About + Contact links verified |
| Mobile nav (Sheet) | header @390×844 | Hamburger → drawer → navigation verified earlier |
| Auth OTP demo flow (until redirect) | `/auth` | Role select, OTP verify succeed; dead end at `/patient` (BUG-010) |
| Error boundary UX | all crash routes | "Try again" button works; message clear |
| Branded 404 | unknown URLs | Links work |

## Fix sequencing (proposed, for the audit doc)

1. **BUG-001** — delete starter `app/page.tsx` (1 min, unblocks homepage).
2. **BUG-002 (+003, 004, 006, 007)** — route-builder helpers; repairs 7 routes with one change.
3. **BUG-005** — `/treatments` pagination serialization.
4. **BUG-010** — replace OTP dead-end redirect.
5. **BUG-009 / BUG-012** — header hydration + `nativeButton` (one component each).
6. **BUG-008 / BUG-011** — cosmetic.
