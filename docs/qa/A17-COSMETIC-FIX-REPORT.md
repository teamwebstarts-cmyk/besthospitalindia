# A17 — Final A14 Cosmetic Issue Repairs

**Task:** A17 — fix only the two remaining cosmetic issues reported by A14.
**Scope:** Issue A14-01 (Select label) and Issue A14-02 (404 page chrome).
**Final verdict: PASS**

---

## 1. Issue A14-01 — Select trigger shows raw internal ID

### Symptom (as reported by A14)

On `/international-patient/enquiry`, selecting a specialty put the raw internal ID
(`spec-orthopaedics`) into the closed dropdown trigger instead of the human-readable
label. The same defect pattern was present on every public-site `@base-ui/react`
`<Select>`: sort dropdowns (`per-desc`), contact purpose (`feedback`), bed capacity
(`200-500`), consultation country/language selects, entity-type select in global
search, and the compare-page hospital picker.

### Root cause

`@base-ui/react` `Select` resolves the text shown by `<SelectValue />` inside the
closed trigger through `resolveSelectedLabel(value, items, itemToStringLabel)` in
`@base-ui/react/internals/resolveValueLabel.mjs`:

- When the `items` prop **is provided**, the selected value is mapped through it to
  its human-readable label.
- When `items` is **not provided**, Base UI falls back to `stringifyAsLabel(value)`,
  which stringifies the raw scalar value — i.e. the internal ID.

Every affected `<Select>` rendered `<SelectItem>` children with correct labels (so
the **open** popup always looked right) but never passed `items`, so the **closed**
trigger fell back to the raw value. This is purely a display-resolution gap; form
values, serialization, validation, and submission were already correct.

### Fix

Pass an `items` record (`Record<string, React.ReactNode>` mapping option value →
option label) to each affected `<Select>`. No form values, validation logic, option
lists, or data contracts were changed — `items` only affects presentation in the
closed trigger.

### Files changed (7)

| File | Selects fixed | `items` source |
| --- | --- | --- |
| `features/medical-tourism/components/international-patient-enquiry-form.tsx` | Specialty (primary repro) | `SPECIALTY_ITEMS` built from `specialties` data (`id` → `name`) |
| `features/medical-tourism/components/treatment-filters.tsx` | Specialty, Sort on `/treatments` | `SPECIALTY_ITEMS` + `SORT_ITEMS` (`TREATMENT_SORT_LABELS`) |
| `features/discovery/results-toolbar.tsx` | Sort dropdowns on `/hospitals`, `/doctors`, `/facilities` | memoized `sortItems` from `sortOptions` |
| `features/discovery/listing-filters.tsx` | All single-select facet controls | `items` from `options` (incl. `blankOption`) |
| `features/discovery/global-search.tsx` | Entity-type select | `ENTITY_TYPE_ITEMS` from `ENTITY_TYPE_LABELS` |
| `features/consultations/enquiry-form.tsx` | Country, Preferred language, Specialty, Preferred provider on `/free-consultation` | `COUNTRY_ITEMS`, `LANGUAGE_ITEMS`, `SPECIALTY_ITEMS`, memoized `providerItems` |
| `features/content/enquiry-form.tsx` | Dynamic selects on `/contact` (purpose) and `/for-hospitals` (bed capacity) | `items` built per-field from `field.options` |
| `app/(public)/hospitals/compare/page.tsx` | "Add a hospital to compare" | `hospital.id` → `${hospital.name} — ${hospital.city}` |

### Before / after

| State | Before | After |
| --- | --- | --- |
| `/international-patient/enquiry` Specialty | `spec-orthopaedics` | `Orthopaedics` |
| Discovery sort trigger | `per-desc` | `Rating: high to low` |
| `/contact` purpose | `feedback` | `Website feedback` |
| `/for-hospitals` bed capacity | `200-500` | `200–500 beds` |
| Underlying form value | `spec-orthopaedics` (unchanged) | `spec-orthopaedics` (unchanged) |

---

## 2. Issue A14-02 — 404 page missing public chrome

### Symptom (as reported by A14 / BUG-011)

The branded 404 page rendered its "Page not found" content but without the public
site header/footer.

### Root cause

Next.js App Router renders the root `app/not-found.tsx` inside the root
`app/layout.tsx` only. Route-group layouts — including
`app/(public)/layout.tsx`, which mounts `PublicHeader` and `PublicFooter` — do not
wrap the root not-found boundary, because that boundary sits above all route groups
and catches every unmatched path (including paths that would normally live under
`(public)`). The 404 page therefore rendered bare by design of the layout nesting,
not by any missing component.

### Fix

Explicitly compose the same shared chrome used by the public layout —
`PublicHeader` and `PublicFooter` from `components/layout/` — around the existing
`<EmptyState>` main container in `app/not-found.tsx`. Preserved exactly:

- 404 behavior (still the global not-found boundary, no `notFound()` changes);
- existing messaging ("Page not found" + description copy);
- existing navigation links ("Go to homepage" action, "Browse hospitals" child link);
- existing error handling (no changes to `app/error.tsx`, `global-error.tsx`, or
  portal error boundaries).

### File changed (1)

- `app/not-found.tsx` — wraps the existing content in
  `<div className="flex min-h-screen flex-col bg-background">` with `<PublicHeader />`
  above and `<PublicFooter />` below the unchanged `<main>` + `<EmptyState>` block.

### Before / after

| State | Before | After |
| --- | --- | --- |
| Header on `/nonexistent` | none | sticky `PublicHeader` (logo, 9 nav/CTA controls, mobile Sheet) |
| Footer on `/nonexistent` | none | `PublicFooter` (brand + 19 links + demo notice) |
| 404 copy and links | present | unchanged |

---

## 3. Browser verification

**Environment:** production build served via `npx next start -p 3101` (separate
port; the pre-existing instance on 3100 was left untouched). All checks performed
in a real browser tab against the compiled output.

### A14-01 — `/international-patient/enquiry`

1. Specialty select: chose "Orthopaedics" → closed trigger displays **"Orthopaedics"**
   (previously `spec-orthopaedics`). Verified via accessibility snapshot and DOM text
   (`#enquiry-specialty`).
2. Submitted with Country/Language empty → required-field errors
   ("Country is required", "Preferred language is required") appeared as before —
   **validation preserved**.
3. Selected Country → trigger shows **"India (demo)"**; Language → trigger shows
   **"English"**. Both `aria-invalid` attributes cleared.
4. Clicked "Submit demo enquiry" → button entered "Recording demo enquiry…" pending
   state, then confirmation rendered: **"Demo enquiry recorded — reference ENQ-5M3R"**
   with the "What you entered (demo record)" summary showing
   **Specialty: Orthopaedics** and **Country / language: India (demo) · English**.
   The confirmation resolves these labels from the raw IDs through the same mock
   action as before — **submission/mock action and data contracts preserved**.

### A14-02 — `/definitely-not-a-real-page-xyz`

1. 404 body renders with sticky `PublicHeader` (9 header links, `position: sticky`)
   and `PublicFooter` (19 links, demo notice present).
2. "Page not found" copy and description unchanged; "Go to homepage" CTA and
   "Browse hospitals" outline link present.
3. Clicked "Browse hospitals" → client-side navigation to `/hospitals`
   (title "Hospitals | BestHospitalIndia") — **recovery navigation works**.

Screenshots of both pages were captured during verification.

---

## 4. Static checks

| Check | Command | Result |
| --- | --- | --- |
| TypeScript | `npx tsc --noEmit` | **0 errors** (exit 0). Note: a stale `.next/dev` validator cache initially produced phantom errors; cleared and re-run clean. |
| ESLint | `npx eslint .` | **0 errors** (exit 0). 3 pre-existing warnings in `scripts/a09-*.mjs` probe scripts (pre-date A17, untouched by A17). |
| Production build | `npx next build` | **Success** (exit 0). All routes generated, including `ƒ /international-patient/enquiry`; 404 handled by root not-found. An earlier `/doctor-portal` prerender error was confirmed to be a transient Turbopack worker-cache condition — clean build passes. |

---

## 5. Restrictions compliance

- Only the two reported issues addressed; no redesign, no removed components or functionality.
- No Hospital/Doctor Portal files, A01 data contracts, global tokens, or foundation
  components modified by A17.
- No dependencies added; `package.json` and lockfiles untouched.
- No commits made.

## 6. Remaining limitations

- Headless automation note (no product impact): synthetic CDP-dispatched mouse events
  cannot keep Base UI popups open (the popup closes synchronously), so country/language
  selection during verification was driven with trusted keyboard events
  (`focus` + `ArrowDown` + `Enter`) and real pointer clicks.
- The `items` maps are built from the same existing option arrays/data sources, so they
  must stay in sync if option lists are ever refactored; labels are derived, not duplicated.
- The pre-existing shared instance on `localhost:3100` may not reflect the updated source;
  verification used the dedicated production instance on port 3101 (stopped after testing).
- No manual screen-reader audit was performed; ARIA roles/attributes of the Selects are
  unchanged by this fix.

## 7. Final verdict

**PASS** — both A14-01 and A14-02 are fixed, verified live in the browser, and all
static checks (typecheck, ESLint, production build) pass with no scope expansion.
