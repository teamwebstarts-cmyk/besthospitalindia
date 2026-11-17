# A16 — Regression Report

**Agent:** A16 — Public Website Visual Alignment
**Date:** 2026-11-17
**Verification:** `npx tsc --noEmit` ✅ · `npm run lint` ✅ · `npm run build` ✅ (all routes prerendered) · live viewport sweep at 1440 / 1280 / 768 / 390 ✅

---

## 1. Regression philosophy

A16 was strictly presentational. Invariants checked on every change:

1. **No component/section removal or simplification.** Only `className` and `variant` props changed; every pre-existing section, list, badge, panel and interaction remains in the DOM (verified via accessibility snapshots before/after on home, listings, profiles, treatments, forms, auth).
2. **Data & logic untouched.** No edits to `lib/search`, `features/*/selectors`, rating constants, sort enums, pagination or the URL-builder (`buildFilterQueryString`, route constants). Diff review confirms all changes are JSX-attribute-level.
3. **Ratings independence.** PER/CER (hospitals) and PER/MER (doctors) still render as two separate modules everywhere; spot-checked on home cards, directory cards, both profiles and treatment pages. No combined score exists in any touched markup.
4. **Portal isolation.** Hospital/doctor portals received only the global token-level light-mode effect (`app/globals.css`) — no portal component was edited by A16 styling passes.

## 2. Issues found & fixed during A16

| # | Issue | Risk | Fix | Verified |
|---|---|---|---|---|
| R1 | Tablet (768px) horizontal overflow: "Demo profile — fictional data" badge in card footers pushed past viewport (right edge 800px) | Medium — scroll jank on iPad portrait | `HospitalCard` + `DoctorCard` footer badges: `min-w-0 max-w-full` + inner `truncate` span | 768px re-probe: 0 offenders |
| R2 | Footer color contradicted reference (was dark `#111827` per docs; screenshots show `#005697`) | Low (visual only) | `bg-primary text-primary-foreground`; pixel-verified both homepage and footer captures | colscan: solid blue footer band |
| R3 | `next-themes` injected inline `color-scheme: dark` even after token mirroring, darkening native scrollbars/controls | Medium — dark chrome in "light" mode | `color-scheme: light !important` on `:root` and `.dark` | Computed style shows light scheme with `.dark` class forced |

## 3. Known non-issues (documented, no action)

| # | Observation | Why no action |
|---|---|---|
| N1 | Dev-mode hydration notice at `components/shared/breadcrumbs.tsx:39` | Reproduces with **all A16 changes stashed** (stash-tested against `941bbb3`): pre-existing dev-mode-only locale-format frame; absent from production build |
| N2 | Dev server occasionally served stale compiled module for `features/medical-tourism/components/enquiry-cta.tsx` (button stayed blue after edit) | Dev-cache artifact only; authoritative `npm run build` prerendered HTML verified to contain `bg-cta` on all 10 treatment-detail pages |
| N3 | Reference shows a green WhatsApp CTA paired with the red CTA (homepage y≈1781 row-scan) | No WhatsApp feature exists in the platform; adding one would violate the no-new-functionality boundary. IUF red strip preserves the conversion intent |
| N4 | Reference listing page shows a horizontal top filter bar; our page keeps a left filter rail | Docs + existing A03 shell use the rail; removing it would violate the no-removal invariant. Rail styling aligned instead |

## 4. Interaction spot-checks (post-styling)

| Flow | Result |
|---|---|
| Hospital listing pagination (page 1 → 2) | ✅ navigates, URL `?page=2`, list updates |
| Filters (city/specialty selects, checkboxes, clear-all) | ✅ render + apply through URL state |
| Mobile nav sheet (768px "Open navigation menu") | ✅ opens, links intact |
| FAQ accordions (home + listing) | ✅ expand/collapse |
| Form CTAs (consultation/enquiry/auth) | ✅ route to correct flows; mock-submit behavior unchanged |
| Section-nav chip rails (profiles) | ✅ scrollable, contained, no page overflow |

## 5. Build artifacts

- 8 hospital profiles + 10 treatment pages prerender as SSG with new styling (verified in `.next/server/app/**/*.html`).
- No new runtime warnings introduced by A16 changes; build log clean.

## 6. Residual risk

- **Low:** dev-server staleness can mask fresh className edits during live review — always hard-reload or verify against the production build.
- **Low:** specialty tile icon colors approximate the reference tile palette via token alphas rather than per-tile brand hues (no per-brand assets exist in the demo).
- **None identified** for data integrity, ratings logic or portal functionality.
