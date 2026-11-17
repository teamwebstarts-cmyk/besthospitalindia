# A16 — Visual Alignment Report

**Agent:** A16 — Public Website Visual Alignment & Reference-Matched Styling
**Scope:** Public website of `best-hospital-india` (Next.js App Router), aligned to the live Vaidam reference screenshots in `vaidam-reference-pack/`.
**Date:** 2026-11-17
**Status:** Complete — all planned surfaces styled; `tsc`, `lint` and `build` pass.

---

## 1. Method

1. **Screenshot-first.** Reference PNGs in `vaidam-reference-pack/screenshots/**` were treated as the single visual authority. Text docs were consulted only where screenshots were silent.
2. **Pixel probing.** `docs-a16-shots/probe.ps1` (PowerShell + `System.Drawing.Bitmap`) was used to extract exact RGB values, band boundaries and element geometry from the reference captures (`colscan`, `rowscan`, `probes`, `findcolor` modes).
3. **Token-level changes first.** All color work flows through the OKLCH theme tokens in `app/globals.css`; components consume semantic classes (`bg-primary`, `bg-cta`, `text-muted-foreground`…), so portal and public pages stay consistent.
4. **Zero functional change.** Every edit is presentational (className / variant props). Data contracts, PER/CER/MER independence, verification logic, sorting, filtering, pagination and the URL-driven route-builder patterns are untouched.

## 2. Measured reference signatures (desktop 1440)

| Zone | Measured value | Source |
|---|---|---|
| Utility bar | `rgb(0,86,150)` `#005697`, y 0–63 | `home-desktop-full.png` colscan |
| Header | white, 64px, `#E5E7EB` bottom border at y≈120 | colscan |
| Hero | ~688px band, tinted photo, H1 44px `#1F2937`, right enquiry card x≈930–1319 with red `#DC3545` submit | probes |
| Mid-page canvas | `#F9FAFB` alternating white cards | colscan/probes |
| Process/services zone | light blue `#F0F8FF` `rgb(240,248,255)` with `#DBEAFE` borders, y≈5497–6846 | colscan |
| Footer | solid `#005697`, y 8655–9267 | colscan (overrode stale doc claim of `#111827`) |

## 3. Changes applied

### Global / tokens (`app/globals.css`)
- **Site-wide light mode (urgent request):** `.dark` block now mirrors every `:root` light token; `color-scheme: light !important` on both `:root` and `.dark` so `next-themes` inline styles cannot re-darken native controls. No component edits required.
- Added `--cta` (conversion red `#DC3545` ≈ `oklch(0.589 0.209 27.3)`) and `--cta-foreground` tokens.

### Header (`components/layout/public-header.tsx`)
- Added desktop-only blue utility bar (`hidden lg:block bg-primary`, 40px) with phone, email and the IUF "International Urban Forum Supported Initiative" line — matching reference y 0–63.
- Header CTA and nav hover states aligned to the reference (red pill CTA).

### Footer (`components/layout/public-footer.tsx`)
- Background changed to solid brand blue (`bg-primary text-primary-foreground`) after pixel-probing proved the reference footer is `#005697`, not the documented `#111827`.

### Homepage (`app/(public)/page.tsx`, `features/content/*`)
- Hero: subtle brand-tinted gradient band, 44px H1, elevated white enquiry card with full-width red pill CTA.
- Hero/global search submit button switched to `variant="cta"` (red), matching the reference's red search/enquiry submit pattern.
- Section heading scale (30px H2 / 44px H1) via `components/shared/section-heading.tsx`.
- Specialty/facility tiles and featured provider cards restyled (blue provider names, red `View profile` pills, distinct PER/CER modules).
- "How it works" + medical tourism + IUF cluster wrapped in a reference-matched light-blue tinted zone (`bg-primary/[0.045]`, ring) — presentational wrapper only, all original sections preserved.
- `IufConsultationCta` restyled as the full-width red conversion strip with white pill CTA (all original copy kept).

### Cards (`features/providers/*`)
- `HospitalCard`: horizontal media-left composition (176px image ≈ 39% at card width), blue name, specialty chips, separate PER/CER modules, red pill CTA; footer badge truncation fix (`min-w-0 max-w-full` + inner `truncate`) for tablet widths.
- `DoctorCard`: avatar-left layout, same rating-module pattern; identical footer-badge truncation fix.

### Directories
- `/hospitals`: results grid switched from 3-up to 2-up (`lg:grid-cols-2 xl:grid-cols-2`) to give horizontal cards reference-like width; filter rail (select-style facets, ghost "Clear all") verified against reference.
- `/doctors`: free-text search submit switched to red `variant="cta"`; 2-column card grid verified.

### Profiles
- `/hospitals/[slug]`: H1 scaled to 36/48 bold; "Request appointment" switched to red pill; sticky desktop consultation panel CTA switched to red pill. All sections (overview, ratings, specialties, doctors, accreditations, reviews) preserved.
- `/doctors/[slug]`: H1 scaled to 36/48 bold; header "Request free consultation" and sticky panel CTA switched to red pills.

### Treatments & medical tourism
- `/treatments` and `/treatments/[slug]`: H1 weight/size aligned (`text-3xl font-bold … sm:text-4xl`, balanced wrap).
- `EnquiryCta` band primary button → red pill (shared by treatments listing/detail and medical-tourism pages).
- `TreatmentCard` "Enquire" → red pill; "View details" stays outline (secondary action hierarchy).
- `/medical-tourism` hero H1 aligned; "Start an enquiry" hero CTA → red pill.
- `InternationalPatientEnquiryForm` submit → red pill.

### Consultation / contact / auth
- `/free-consultation`: H1 scaled to 36/48 bold.
- `EnquiryForm` (contact + all demo forms): submit → red pill.
- `AuthEntryCard`: both submit steps ("Send one-time code", "Verify & continue") → red pills.

## 4. Files touched (public-site visual surface)

```
app/globals.css
app/(public)/page.tsx
app/(public)/hospitals/page.tsx
app/(public)/hospitals/[slug]/page.tsx
app/(public)/doctors/page.tsx
app/(public)/doctors/[slug]/page.tsx
app/(public)/treatments/page.tsx
app/(public)/treatments/[slug]/page.tsx
app/(public)/medical-tourism/page.tsx
app/(public)/free-consultation/page.tsx
components/layout/public-header.tsx
components/layout/public-footer.tsx
components/shared/section-heading.tsx
components/ui/button.tsx (cta / cta-outline variants)
features/content/hero-panel.tsx
features/content/home-sections.tsx
features/content/enquiry-form.tsx
features/content/auth-entry-card.tsx
features/discovery/global-search.tsx
features/providers/components/hospital-card.tsx
features/providers/components/doctor-card.tsx
features/medical-tourism/components/enquiry-cta.tsx
features/medical-tourism/components/treatment-card.tsx
features/medical-tourism/components/international-patient-enquiry-form.tsx
```

## 5. Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ 0 errors |
| `npm run lint` (eslint) | ✅ 0 errors |
| `npm run build` | ✅ success, all routes prerendered (8 hospital profiles SSG, 10 treatment pages SSG) |
| Prerendered HTML contains `bg-cta` on treatment-detail enquiry CTA | ✅ verified in `.next/server/app/treatments/*.html` |
| Homepage 1440px structural probe | ✅ utility bar 40px, hero 600px w/ white card, 44px H1, red strip, blue footer, 0 overflow elements |
| Tablet 768px | ✅ 0 overflow (after badge truncation fix) |
| Mobile 390px | ✅ 0 overflow on home, hospitals, doctors, free-consultation, auth, hospital profile, doctor profile, treatment detail |
| Interactions | ✅ pagination navigation works; filters, accordions, sheet nav intact |

## 6. Out of scope / notes

- A dev-mode-only React hydration notice on `breadcrumbs.tsx` was investigated and confirmed **pre-existing** (reproduces with all A16 changes stashed). It does not appear in production builds; no action taken.
- The dev server occasionally served a stale cached module for `enquiry-cta.tsx`; the authoritative production build output was used for verification instead.
- Portal surfaces (hospital/doctor portals) were only affected by the token-level light-mode change — no portal layout or component was redesigned.
