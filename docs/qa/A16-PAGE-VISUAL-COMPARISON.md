# A16 — Page Visual Comparison (Reference vs. BestHospitalIndia)

**Method:** Reference PNGs probed pixel-by-pixel (`docs-a16-shots/probe.ps1`); our build probed live via CDP (`Runtime.evaluate`, computed styles + geometry) at 1440×900 unless noted.

Legend: ✅ aligned · 🟡 intentional equivalent (structure preserved, presentation approximates reference) · 📌 documented

---

## 1. Homepage

| Reference element (measured) | Our implementation | Status |
|---|---|---|
| Utility bar: solid `#005697`, 64px tall, phone/email left, trust line right | `bg-primary` utility bar, 40px (`h-10`), same content and sides | ✅ (40px chosen to keep header total ≤ ref) |
| Header: white, 64px, `#E5E7EB` border, red pill CTA | white h-16, border, red pill "Get a FREE Consultation" | ✅ |
| Hero ~688px tinted band, H1 44px `#1F2937` | gradient-tinted band (`from-primary/[0.08] via-background to-cta/[0.05]`), H1 44px bold | ✅ |
| Hero right: white elevated enquiry card w/ full-width red `#DC3545` submit | white card (`shadow-lg ring-1`), full-width red pill CTA → free consultation | ✅ |
| Hero search: white container, red submit | white search card, red submit (`variant="cta"`) | ✅ |
| Gray canvas `#F9FAFB` with alternating white card bands | same rhythm on `--background` gray-50 | ✅ |
| Specialty tiles: white cards, colored icons, hover lift | tile cards on white, `bg-primary/10` icon chips, hover states | 🟡 icon colors approximated from tile palette |
| Red `#DC3545` + green `#25D366` centered CTA pair (y≈1710–1802) | IUF red conversion strip (`bg-cta`) with white pill — single dominant band, preserves existing IUF CTA section instead of adding a new one | 📌 content parity kept; WhatsApp-green action intentionally not reproduced (no WhatsApp feature in scope) |
| Process zone: `#F0F8FF` band, y≈5497–6846, blue-100 card borders | tinted wrapper `bg-primary/[0.045]` + ring around how-it-works / tourism / IUF cluster | 🟡 tint approximated with primary-alpha (token-level) |
| Footer: solid `#005697`, 612px | `bg-primary` footer | ✅ |
| 1440px probe after changes | 0 overflow, correct band order (bar→white→hero→gray…→red strip→blue footer) | ✅ |

## 2. Hospital listing (`/hospitals` vs. `hosp-delhi-desktop-full.png`)

| Reference | Ours | Status |
|---|---|---|
| Gray canvas `#F9FAFB` full page | same | ✅ |
| Filter bar y≈766–796: dropdown-style controls + red-tinted active chips | left rail with select-style facets + blue active-count badge | 🟡 rail layout (docs describe rail; screenshot shows top bar — rail preserved per no-removal invariant) |
| Result cards ~45% gray-100 left media panel, red `#DC3545` "View" CTA at footer (x 652–890) | horizontal media-left cards (176px image), red pill "View profile" | ✅ |
| 2 cards/row | `lg:grid-cols-2 xl:grid-cols-2` (454px cards) | ✅ |
| Rating chips: separate score modules | separate PER / CER modules, "Not yet rated" for missing | ✅ |
| Pagination control below grid | shared `UrlPagination` | ✅ |

## 3. Doctor listing (`/doctors`)

| Reference pattern | Ours | Status |
|---|---|---|
| Search field + red submit | search form + red `variant="cta"` submit | ✅ |
| Card grid 2-up | `sm:grid-cols-2` (468px cards) | ✅ |
| Avatar-left doctor cards, dual rating modules | same, with VerificationBadge | ✅ |

## 4. Hospital profile

| Reference pattern | Ours | Status |
|---|---|---|
| Large H1 + verified chip + location line | 36/48px bold H1 + VerificationBadge + location/facility line | ✅ |
| Wide media band under title | `aspect-[21/9]` image band | ✅ |
| Sticky right enquiry card with dominant red action | sticky panel, red pill "Start free consultation request" | ✅ |
| Separate rating panels | `RatingPair` PER + CER, never combined | ✅ |

## 5. Doctor profile

| Reference pattern | Ours | Status |
|---|---|---|
| Header card w/ avatar, credentials, red consultation CTA | header card, 36/48px bold H1, red pill CTA + outline secondary | ✅ |
| Dual rating modules | PER + MER separate panels with methodology links | ✅ |
| Sticky consultation panel | sticky aside with red pill CTA | ✅ |

## 6. Treatments & detail

| Reference pattern | Ours | Status |
|---|---|---|
| H1 36px+ bold, balanced wrap | `text-3xl font-bold sm:text-4xl text-balance` | ✅ |
| Card grid with enquire action | `TreatmentCard` grid, red pill "Enquire", outline "View details" | ✅ |
| Detail page enquiry band with dominant red CTA | `EnquiryCta` red pill (verified `bg-cta` in prerendered HTML) | ✅ |

## 7. Medical tourism / free consultation / contact / auth

| Reference pattern | Ours | Status |
|---|---|---|
| Tinted hero band + red primary action | tinted badge + H1 + red pill "Start an enquiry" | ✅ |
| Form cards with clear dominant submit | `EnquiryForm` red pill submit (shared across contact, consultation, enquiry) | ✅ |
| Auth: centered narrow card, minimal chrome | `AuthEntryCard` centered, red pill submits per step | ✅ |

## 8. Cross-cutting

| Concern | Status |
|---|---|
| Light mode everywhere (incl. `.dark` class / OS dark) | ✅ token-mirrored; `color-scheme: light !important` |
| PER/CER/MER never combined anywhere | ✅ verified across all card/profile renders |
| No removed sections/components vs. pre-A16 | ✅ all original sections retained; wrappers/variants only |
| Mobile 390 / tablet 768 overflow | ✅ 0 offenders (section-nav chip rail is a contained `overflow-x-auto` scroller) |
