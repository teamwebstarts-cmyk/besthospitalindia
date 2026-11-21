# Performance audit — BestHospitalIndia (loading & perceived speed)

**Stack:** Next.js 16 (App Router), React 19, Tailwind 4 — not NestJS (backend is Next.js API routes + optional MongoDB).

**Audit date:** 2026-11-21  
**Scope:** Public site loading (LCP, TTFB, JS bundle, images, data fetching). Portal/admin noted briefly.

---

## Executive summary

| Area | Severity | Impact on load |
|------|----------|----------------|
| Uncompressed hero PNGs (~1.9 MB each) | **Critical** | Dominates LCP and bandwidth on `/` |
| Home above-the-fold is a large **client** island (`HomeHeroSection`) | **High** | Delays hydration; pulls `GlobalSearch`, forms, Radix UI into first paint |
| Catalogue read **3× per home request** without `React.cache` | **High** | Extra Mongo/file I/O and CPU on every render |
| **No** `next/dynamic` code splitting on home | **Medium** | Below-fold motion/FAQ bundled with initial JS |
| **Two** `priority` hero images in DOM | **Medium** | Risk of preloading both desktop + mobile heroes |
| State destination JPGs (80–440 KB) × 8 on home | **Medium** | Competes with LCP on scroll / early idle |
| Featured hospital JPGs (78–538 KB), some `priority` | **Medium** | Extra early network work |
| Root layout: **3 Google fonts** + client `ThemeProvider` (forced light) | **Low–Medium** | Extra font/CSS/JS for no user-facing dark mode |
| Testimonial avatars: `unoptimized` + `i.pravatar.cc` | **Low** | Third-party + unoptimized images |
| `published*BySlug` reloads full catalogues | **Medium** | Detail pages repeat work (mitigated once `cache()` is in place) |
| No HTTP caching headers on static assets beyond Next defaults | **Low** | CDN still helps; tune `revalidate` for catalogue |

**Recommended order:** images (hero) → server data dedupe/parallelism → split/defer client JS on home → fonts/theme → ISR/revalidate → remaining images.

---

## 1. Image & media (largest wins)

### 1.1 Hero assets (critical)

Measured on disk (`public/`):

| File | Size |
|------|------|
| `images/hero-find-care-banner.png` | **~1,897 KB** |
| `images/hero-find-care-mobile.png` | **~1,824 KB** |
| `images/hospitals/featured/*-hero.png` (duplicates of hero art) | **~1,824–1,897 KB** |

These PNGs are far above common web budgets (hero **&lt; 200 KB** WebP/AVIF at display width).

**Current behavior:** `HomeHeroSection` uses `next/image` with `priority` on **both** mobile and desktop heroes. Hidden `md:hidden` mobile block may still participate in preload when `priority` is set.

**Targets:**

- Replace heroes with **WebP or AVIF** (or quality-tuned JPEG) at ≤1920px / ≤828px width.
- Keep **one** `priority` image (viewport-appropriate via `<picture>` or art-directed sources).
- Remove duplicate multi-megabyte PNGs from repo or stop referencing them.
- Prefer existing lighter JPGs only as a **temporary** bridge (`hero-personal-care-v2.jpg` ~256 KB) until final art is exported.

**Next.js image config (recommended):**

- `images.formats: ['image/avif', 'image/webp']`
- Remote patterns only where needed (already: `i.pravatar.cc`).

### 1.2 Medical destination grid

Eight state photos under `images/destinations/states/` at **~80–440 KB** each (JPG). All load on home without lazy boundaries.

**Fixes:**

- Recompress JPGs (mozjpeg, ~75–80 quality).
- Rely on `next/image` `sizes` (already set); ensure no accidental `priority`.
- Consider loading band via dynamic import / intersection so images start after hero.

### 1.3 Featured hospitals

Card images use `images/hospitals/featured/cards/*.jpg` (sensible). Two cards use `priority={true}` — reasonable for first visible cards only; avoid marking more than 1–2.

### 1.4 Testimonials

`TestimonialsMarquee` uses `unoptimized` for `i.pravatar.cc` avatars — bypasses the image optimizer. Prefer local placeholder WebPs or allow optimizer + `remotePatterns`.

---

## 2. JavaScript bundle & React boundaries

### 2.1 Client components on every public page

`app/(public)/layout.tsx` wraps all pages with:

- `PublicHeader` (**client**) — includes `GlobalSearch`, `Sheet`, Lucide icons.
- `PublicMobileTabBar` (**client**).

This is acceptable for UX but adds **fixed** JS cost on all routes.

### 2.2 Home page critical path

`app/(public)/page.tsx` is a **Server Component**, but it imports:

| Import | Client? | Notes |
|--------|---------|--------|
| `HomeHeroSection` | **Yes** | Entire hero + search + lead form |
| `FeaturedHospitalsSection` | **Yes** | ScrollReveal + cards |
| `FindDoctorsSection` | **Yes** | |
| `JourneyStepsAnimated` | **Yes** | |
| `FaqList` | **Yes** | |
| `ScrollReveal` | **Yes** | Wrapped around most sections |
| `home-sections.tsx` | **Server** | But imports **20+ Lucide icons** (server tree-shaken; still heavy module) |

**No `next/dynamic`** anywhere in the repo — no route-level code splitting for heavy client sections.

**Fixes (Next.js patterns):**

1. **Split hero:** Server shell (images, H1, copy) + small client islands (`GlobalSearch`, `LeadIntakeForm`).
2. **`dynamic(() => import(...), { loading: () => … })`** for below-fold: `JourneyStepsAnimated`, `TestimonialsMarquee`, `FaqList`, optional `FeaturedHospitalsSection`.
3. Replace blanket `ScrollReveal` on home with CSS `@media (prefers-reduced-motion)` or defer observer to dynamic chunks.
4. Audit Lucide: home-sections imports many icons — consider static SVGs for decorative tiles or `@lucide/react` per-icon paths if bundle traces show bloat (modern Lucide + bundlers usually tree-shake).

### 2.3 Root layout

- `ThemeProvider` (`next-themes`) is **client** with `forcedTheme="light"` and dark mode disabled in CSS — **removable** to drop client JS with no UX change.
- **Three** font families: Inter, Manrope, Geist Mono. Mono is only needed in admin/portal typography — consider dropping Geist Mono from root layout and scoping mono to portal layouts.

---

## 3. Server data & caching

### 3.1 Home catalogue waterfall

```ts
// app/(public)/page.tsx (current pattern)
const catalogueHospitals = await publishedHospitals()
const catalogueDoctors = await publishedDoctors()
const catalogueFacilities = await publishedFacilities()
```

Each call → `approved(kind)` → `listSubmissions(kind)` → **`readAll()`** (Mongo or `catalogue.json`).

**Issues:**

- Sequential awaits (waterfall) — use **`Promise.all`**.
- **Three** full reads of the same submission array per request — use **`React.cache()`** around `readAll` / `listSubmissions`.

### 3.2 No cross-request cache

No `unstable_cache`, `revalidate` export on home, or tagged revalidation for catalogue.

**Recommendations:**

- `export const revalidate = 60` (or 300) on public directory + home if catalogue changes infrequently.
- `unstable_cache` keyed on catalogue reads with tag `catalogue`; revalidate from admin/partner write APIs (future).
- Optional: Mongo projection to fetch only fields needed for listing cards (smaller payloads).

### 3.3 Slug lookups

`publishedHospitalBySlug` calls `publishedHospitals()` then `.find()` — O(n) full remap per detail view. Acceptable at small N; with `cache()` one read per request. Long term: index by slug in store.

### 3.4 Build output

`next build` shows `/` as **static (○)** — good for TTFB when deployed to CDN. Local **dev** (`next dev`) is slower by design (no full optimization, Turbopack HMR).

---

## 4. Network & third parties

- **Pravatar** for testimonial photos — extra DNS/TLS; use local assets for production.
- **No analytics** deferred — if added, load after `requestIdleCallback` / `next/script` strategy `lazyOnload`.

---

## 5. CSS

- `globals.css` imports `tw-animate-css` + full `shadcn/tailwind.css` globally — expected; purge via Tailwind 4.
- Feature CSS e.g. `featured-hospitals.css` imported from client sections — keep colocated; avoid importing on unrelated routes.

---

## 6. Portal / admin (secondary)

- Many `"use client"` managers — fine behind auth.
- `export const dynamic = "force-dynamic"` on admin listings — correct; not on public home.

---

## Implementation plan (phased)

### Phase 1 — Quick wins (this PR)

- [x] Document (this file).
- [x] `React.cache` on catalogue `readAll` / `listSubmissions`.
- [x] `Promise.all` on home catalogue fetches.
- [x] Hero: WebP assets (~43–48 KB); mobile-only `priority` (desktop hero eager without preload).
- [x] Remove redundant `ThemeProvider` when theme is forced light.
- [x] `next.config` image formats AVIF/WebP.
- [x] Home: `dynamic()` below-fold client sections.
- [x] Split `HomeHeroSection`: server backdrop images + client interactive shell (same DOM).

### Phase 2 — Images & CDN

- [x] Batch-compress script (`npm run images:compress`); stop `next dev` first if Windows locks files under `public/`.
- [ ] Delete unused multi-MB PNG heroes from repo (optional cleanup; no runtime refs).
- [x] Testimonial avatars use image optimizer (removed blanket `unoptimized`).

### Phase 3 — Caching & data

- [x] `revalidate = 120` on home + `/hospitals`, `/doctors`, `/facilities`.
- [x] `unstable_cache` + `revalidateTag('catalogue-public')` on catalogue API mutations.
- [ ] Count-only API for hero stats (optional) to avoid mapping full hospital arrays on home.

### Phase 4 — Measurement

- [ ] Lighthouse CI or Vercel Speed Insights on `/`, `/hospitals`, `/hospitals/[slug]`.
- [ ] Target: LCP &lt; 2.5s on 4G, TBT &lt; 200ms, performance score ≥ 90 on public home.

---

## Next.js performance features to use

| Feature | Use case here |
|---------|----------------|
| `next/image` | All content photos; correct `sizes`; avoid `unoptimized` |
| `next/font` | Already used; reduce font count on public layout |
| `React.cache()` | Dedupe catalogue reads per request |
| `unstable_cache` / `revalidate` | Catalogue-backed public pages |
| `next/dynamic` | Below-fold client home sections |
| Server Components | Default; shrink `"use client"` on LCP path |
| `<Link prefetch={false}>` | Heavy infrequent routes (if needed) |
| Route `loading.tsx` | Already on some portals; optional for public |

---

## How to verify locally

1. **Production build:** `npm run build && npm run start`
2. **Chrome DevTools → Network:** throttle “Fast 3G”, disable cache, load `/` — hero transfer should be **&lt; 300 KB** after Phase 1–2.
3. **Coverage tab:** see unused JS on first load.
4. **React Server Components:** confirm HTML contains hero H1 before hydration.

---

## References

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Next.js `cache` / `unstable_cache`](https://nextjs.org/docs/app/building-your-application/caching)
- [Vercel React best practices](https://vercel.com/docs) (bundle size, waterfalls — internal skill `react-best-practices`)