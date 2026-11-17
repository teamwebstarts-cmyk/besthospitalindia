/**
 * /doctors — doctor directory listing (Agent A05).
 *
 * Spec source: implementation/pages/07-doctors.md + 10-routing-and-layouts.md
 * (URL-reflected filters/sort/page). Server Component: reads `searchParams`
 * (a Promise in Next.js 15+/16), runs the pure `searchDoctors` selector with
 * AND-composed filters, then paginates and renders DoctorCards.
 *
 * Shared discovery shell (A03, server-parent URL mode): ListingFilters renders
 * doctor-specific facets (city, specialization) behind the mobile filter
 * sheet; ResultsToolbar shows the count + sort; UrlPagination keeps ?page= in
 * the URL. Free-text search (?q=, matching doctor name/specialty/hospital
 * text) is a separate GET form so the full query stays shareable.
 *
 * URL contract (all optional, shareable):
 *   ?q=<text>&city=<city>&specialization=<specialty id>
 *   &sort=name-asc|name-desc|per-desc|mer-desc&page=<1-based>
 *
 * RATINGS RULE: the PER and MER sort options are separate — they are never
 * combined into one score (SearchOptions.ratingKind carries exactly one kind).
 */

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { EmptyState } from "@/components/shared/empty-state"
import { SectionHeading } from "@/components/shared/section-heading"
import { doctors as doctorsList, specialties } from "@/data"
import { ROUTES } from "@/constants/routes"
import { paginate, searchDoctors } from "@/lib/search"
import type { RatingKindForSort, SearchSort } from "@/lib/search"
import { DoctorCard } from "@/features/providers/components/doctor-card"
import { ListingFilters } from "@/features/discovery/listing-filters"
import { ResultsToolbar } from "@/features/discovery/results-toolbar"
import { UrlPagination } from "@/features/discovery/url-pagination"
import {
  buildFilterQueryString,
  readFilterValues,
  type DiscoveryFacet,
} from "@/features/discovery/types"

// ---------------------------------------------------------------------------
// URL param parsing — safe, deterministic, tolerant of unknown values
// ---------------------------------------------------------------------------

const SORT_OPTIONS = [
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "name-desc", label: "Name (Z–A)" },
  { value: "per-desc", label: "Patient Experience Rating (high to low)" },
  { value: "mer-desc", label: "Medical Expertise Rating (high to low)" },
] as const

type SortValue = (typeof SORT_OPTIONS)[number]["value"]

const DEFAULT_SORT: SortValue = "name-asc"
const PAGE_SIZE = 6

function isSortValue(value: string): value is SortValue {
  return SORT_OPTIONS.some((option) => option.value === value)
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

/** A param counts only when a non-empty trimmed string value exists. */
function presentParam(value: string | string[] | undefined): string | undefined {
  const first = firstParam(value)?.trim()
  return first ? first : undefined
}

function parsePage(value: string | string[] | undefined): number {
  const parsed = Number.parseInt(firstParam(value) ?? "", 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

function parseSort(value: string | string[] | undefined): SortValue {
  const raw = firstParam(value)
  return raw && isSortValue(raw) ? raw : DEFAULT_SORT
}

/** Map a URL sort value onto the shared SearchSort contract (PER/MER stay separate). */
function resolveSort(sortValue: SortValue): { sort: SearchSort; ratingKind?: RatingKindForSort } {
  switch (sortValue) {
    case "name-desc":
      return { sort: "name-desc" }
    case "per-desc":
      return { sort: "rating-desc", ratingKind: "PER" }
    case "mer-desc":
      return { sort: "rating-desc", ratingKind: "MER" }
    case "name-asc":
    default:
      return { sort: "name-asc" }
  }
}

/** Doctor-specific facets per 04-reference-design-audit.md — no hospital labels. */
const FILTER_FACETS: DiscoveryFacet[] = [
  {
    kind: "select",
    param: "city",
    label: "City",
    includeBlank: { value: "", label: "All cities" },
    options: [...new Set(doctorsList.map((doctor) => doctor.city))]
      .sort((a, b) => a.localeCompare(b))
      .map((city) => ({ value: city, label: city })),
  },
  {
    kind: "select",
    param: "specialization",
    label: "Specialization",
    includeBlank: { value: "", label: "All specializations" },
    options: specialties.map((specialty) => ({ value: specialty.id, label: specialty.name })),
  },
]

// ---------------------------------------------------------------------------
// Free-text search form (?q=) — doctor name, specialty or hospital text.
// GET form so the submitted URL remains shareable; kept separate from the
// facet shell because ListingFilters is facet-only by contract.
// ---------------------------------------------------------------------------

function DoctorQueryForm({ currentQuery, preserved }: { currentQuery: string; preserved: { city?: string; specialization?: string; sort: SortValue } }) {
  return (
    <form
      method="get"
      action={ROUTES.public.doctors}
      role="search"
      aria-label="Search doctors"
      className="flex flex-wrap items-center gap-2"
    >
      {/* Preserve active facets/sort when submitting a new query. */}
      {preserved.city ? <input type="hidden" name="city" value={preserved.city} /> : null}
      {preserved.specialization ? (
        <input type="hidden" name="specialization" value={preserved.specialization} />
      ) : null}
      {preserved.sort !== DEFAULT_SORT ? (
        <input type="hidden" name="sort" value={preserved.sort} />
      ) : null}
      <Input
        type="search"
        name="q"
        defaultValue={currentQuery}
        placeholder="Search by name, specialty or hospital…"
        aria-label="Search doctors by name, specialty or hospital"
        className="w-full sm:max-w-none"
      />
      <Button type="submit">Search</Button>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface DoctorsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export const metadata = {
  title: "Doctor Directory",
  description:
    "Browse demo doctor profiles by city, specialization and hospital association, with independent patient-experience and medical-expertise ratings. Fictional demo data only.",
}

export default async function DoctorsPage({ searchParams }: DoctorsPageProps) {
  const params = await searchParams
  const q = presentParam(params.q)
  const city = presentParam(params.city)
  const specialization = presentParam(params.specialization)
  const sort = parseSort(params.sort)
  const page = parsePage(params.page)

  const { sort: searchSort, ratingKind } = resolveSort(sort)
  const results = searchDoctors(
    { query: q, city, specialization },
    undefined,
    searchSort,
    ratingKind ? { ratingKind } : undefined
  )
  const { items, total, totalPages } = paginate(results, page, PAGE_SIZE)

  // Facet values keyed by facet param, as A03's shell expects (URL is the truth).
  const filterValues = readFilterValues({ city: params.city, specialization: params.specialization })
  // Scalars preserved across facet/sort changes (never page).
  const preservedScalars = { q: q ?? "", sort }

  return (
    <div className="space-y-6 py-8">
      <div className="space-y-3">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Doctors" }]} />
        <SectionHeading
          as="h1"
          title="Find the right doctor"
          description="Browse demo doctor profiles by city, specialization and hospital association. Patient Experience (PER) and Medical Expertise (MER) ratings are always shown as independent modules — never a combined score. All data is fictional demo data."
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Facet column (desktop) / filter sheet (mobile) — A03 shell */}
        <aside aria-label="Doctor filters">
          <div className="mb-4">
            <DoctorQueryForm
              currentQuery={q ?? ""}
              preserved={{
                city: filterValues.city?.[0],
                specialization: filterValues.specialization?.[0],
                sort,
              }}
            />
          </div>
          <ListingFilters
            facets={FILTER_FACETS}
            values={filterValues}
            basePath={ROUTES.public.doctors}
            extraParams={preservedScalars}
            triggerLabel="Filters"
          />
        </aside>

        <div className="min-w-0 space-y-4">
          <ResultsToolbar
            total={total}
            entityLabel="doctor"
            sortOptions={SORT_OPTIONS}
            sortValue={sort}
            basePath={ROUTES.public.doctors}
            currentParams={params}
          />

          {q ? (
            <p className="text-sm text-muted-foreground">
              Matching “{q}”.{" "}
              <a
                href={`${ROUTES.public.doctors}${buildFilterQueryString(filterValues, { sort })}`}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Clear the search text
              </a>
            </p>
          ) : null}

          {items.length > 0 ? (
            <>
              <ul className="grid gap-4 sm:grid-cols-2" aria-label="Doctor results">
                {items.map((doctor) => (
                  <li key={doctor.id} className="min-w-0">
                    <DoctorCard doctor={doctor} />
                  </li>
                ))}
              </ul>
              <UrlPagination
                page={page}
                totalPages={totalPages}
                basePath={ROUTES.public.doctors}
                values={filterValues}
                sort={sort}
              />
            </>
          ) : (
            <EmptyState
              title="No doctors match these filters"
              description="Try a different city or specialization, or clear the filters to see all demo doctor profiles."
              action={{ label: "Clear all filters", href: ROUTES.public.doctors }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
