/**
 * Facilities listing route — /facilities (A03 Facility Discovery).
 *
 * Server Component. URL searchParams (Next 16: a Promise) drive everything —
 * q, category, city, specialty, service, sort, page compose AND. Filtering,
 * sorting and paging run through the frozen pure selectors in @/lib/search;
 * this page never fetches and holds no state. All data is FICTIONAL demo
 * fixtures from @/data.
 *
 * Discovery shell wiring: server pages cannot pass function props to client
 * components, so ListingFilters / UrlPagination run in URL
 * mode (basePath + current params); the shell composes canonical URLs itself.
 *
 * Spec: docs/implementation/pages/02-facilities.md.
 */

import type { Metadata } from "next"

import { facilities, specialties } from "@/data"
import { getSpecialtyBySlug, paginate, searchFacilities } from "@/lib/search"
import { DirectoryPageIntro } from "@/components/shared/directory-page-intro"
import { EmptyState } from "@/components/shared/empty-state"
import { SectionHeading } from "@/components/shared/section-heading"
import { FacilityListingCard } from "@/features/content/facility-listing/facility-listing-card"
import { FaqList } from "@/features/content/faq-list"
import { FACILITY_CATEGORY_LABELS } from "@/features/discovery/facility-meta"
import { FacilityListingSearch } from "@/features/discovery/facility-listing-search"
import { ListingFilters } from "@/features/discovery/listing-filters"
import { UrlPagination } from "@/features/discovery/url-pagination"
import { buildFilterQueryString, readFilterValues } from "@/features/discovery/types"
import { homeSectionInnerClassName } from "@/features/content/home-sections"
import { ROUTES } from "@/constants/routes"
import { fullBleedClassName } from "@/lib/full-bleed"
import { cn } from "@/lib/utils"
import type { FacilityCategory } from "@/types"

const PAGE_SIZE = 10
const BASE_PATH = ROUTES.public.facilities
const FACILITY_LABEL = "facility"
const FACILITY_PLURAL_LABEL = "facilities"
const DEFAULT_SORT = "relevance"

/** Canonical (lowercase) FacilityCategory vocabulary for the URL param. */
const FACILITY_CATEGORIES: readonly FacilityCategory[] = [
  "hospital",
  "specialty_centre",
  "diagnostic_lab",
  "rehabilitation",
  "wellness",
  "medical_tourism",
]

const SORT_OPTIONS = [
  { value: "relevance", label: "Recommended" },
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "name-desc", label: "Name (Z–A)" },
] as const

const facilitiesDirectoryFaqs = [
  {
    id: "facilities-faq-what-is-listed",
    order: 1,
    question: "What is listed on this page?",
    answer:
      "Hospitals, specialty centres, diagnostic labs, rehabilitation centres, wellness centres and medical-tourism services across India. Each listing links to a facility profile with category, location, services and verification status.",
  },
  {
    id: "facilities-faq-filters",
    order: 2,
    question: "How do the filters combine?",
    answer:
      "Filters within one group match any selected value; different groups compose AND. Every filter, the sort order and the page number are reflected in the URL, so any filtered view is shareable and bookmarkable.",
  },
  {
    id: "facilities-faq-verification",
    order: 3,
    question: "What does the verification badge mean?",
    answer:
      "It reflects the verification status on each facility record (verified, pending or unverified). Status is updated as our team completes registry and accreditation checks — nothing is shown as verified without a verified record.",
  },
] as const

type SortValue = (typeof SORT_OPTIONS)[number]["value"]

type RawSearchParams = Record<string, string | string[] | undefined>

/** First param value, trimmed; empty → undefined. */
function firstParam(raw: string | string[] | undefined): string | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (value === undefined) return undefined
  const trimmed = value.trim()
  return trimmed === "" ? undefined : trimmed
}

/** Parse a positive 1-based page number; anything else falls back to 1. */
function parsePage(raw: string | string[] | undefined): number {
  const value = firstParam(raw)
  if (value === undefined) return 1
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

/** Category facet options derived from the fixture set (with counts). */
function getCategoryOptions() {
  return FACILITY_CATEGORIES.map((category) => ({
    value: category,
    label: FACILITY_CATEGORY_LABELS[category],
  }))
}

/** Distinct, alphabetically sorted city facet from the fixture set. */
function getCityOptions() {
  const cities = new Set<string>()
  for (const facility of facilities) {
    cities.add(facility.city)
  }
  return [...cities]
    .sort((cityA, cityB) => cityA.localeCompare(cityB))
    .map((city) => ({
      value: city,
      label: city,
    }))
}

/** Distinct service facet from the fixture set (exact demo labels). */
function getServiceOptions() {
  const byLabel = new Map<string, string>()
  for (const facility of facilities) {
    for (const service of facility.services) {
      if (!byLabel.has(service)) byLabel.set(service, service)
    }
  }
  return [...byLabel.keys()]
    .sort((a, b) => a.localeCompare(b))
    .map((service) => ({ value: service, label: service }))
}

export function generateMetadata(): Metadata {
  return {
    title: "Healthcare Facilities Directory",
    description:
      "Browse healthcare facilities — hospitals, specialty centres, diagnostic labs, rehabilitation, wellness and medical-tourism services — filtered by category, city, specialty and service.",
    alternates: { canonical: "/facilities" },
  }
}

export default async function FacilitiesPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const params = await searchParams

  // --- URL params → typed filters (canonical values only) -----------------
  const q = firstParam(params.q) ?? ""
  const categoryParam = firstParam(params.category)?.toLowerCase()
  const city = firstParam(params.city)
  const specialtySlug = firstParam(params.specialty)?.toLowerCase()
  const service = firstParam(params.service)
  const sortParam = firstParam(params.sort)
  const page = parsePage(params.page)

  const category: FacilityCategory | undefined = FACILITY_CATEGORIES.find(
    (candidate) => candidate === categoryParam,
  )
  const selectedSpecialty = specialtySlug ? getSpecialtyBySlug(specialtySlug) : undefined
  const sort: SortValue = SORT_OPTIONS.some((option) => option.value === sortParam)
    ? (sortParam as SortValue)
    : DEFAULT_SORT

  // --- Pure selector pipeline (AND-composed) ------------------------------
  const results = searchFacilities(
    q === "" ? undefined : q,
    {
      categories: category ? [category] : undefined,
      city,
      specialties: selectedSpecialty ? [selectedSpecialty.id] : undefined,
      services: service ? [service] : undefined,
    },
    sort,
  )
  const { items, total, totalPages } = paginate(results, page, PAGE_SIZE)
  const paginationPage = Math.min(Math.max(1, page), totalPages)

  // --- Discovery shell state (URL is the single source of truth) ----------
  const filterValues = readFilterValues({
    q: q === "" ? undefined : q,
    category: params.category,
    city: params.city,
    specialty: params.specialty,
    service: params.service,
  })
  const preservedScalars = { q: q === "" ? undefined : q }
  const sortExtra = sort !== DEFAULT_SORT ? { sort } : undefined

  return (
    <div className="flex flex-col">
      <section
        aria-label="Facility directory"
        className={cn(
          fullBleedClassName,
          "border-b border-border/70 bg-background py-8 sm:py-10",
        )}
      >
        <div className={homeSectionInnerClassName}>
          <DirectoryPageIntro
            className="mb-8"
            title="Facilities"
            description="Hospitals, labs, centres and wellness listings across India — filter by category, city or service."
          />
          <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
            <aside aria-label="Facility filters" className="lg:sticky lg:top-24 lg:self-start">
          <ListingFilters
            facets={[
              {
                kind: "multi-select",
                param: "category",
                label: "Facility category",
                options: getCategoryOptions(),
              },
              {
                kind: "select",
                param: "city",
                label: "City",
                includeBlank: { value: "__all__", label: "All cities" },
                options: getCityOptions(),
              },
              {
                kind: "multi-select",
                param: "specialty",
                label: "Specialty",
                options: specialties.map((specialty) => ({
                  value: specialty.slug,
                  label: specialty.name,
                })),
              },
              {
                kind: "select",
                param: "service",
                label: "Service",
                includeBlank: { value: "__all__", label: "All services" },
                options: getServiceOptions(),
              },
            ]}
            values={filterValues}
            basePath={BASE_PATH}
            extraParams={{ ...preservedScalars, ...sortExtra }}
          />
        </aside>

        <section aria-label="Facility results" className="min-w-0 space-y-4">
          <FacilityListingSearch
            basePath={BASE_PATH}
            initialQuery={q}
            filterValues={filterValues}
            sort={sort}
            defaultSort={DEFAULT_SORT}
          />

          {q ? (
            <p className="text-sm text-muted-foreground">
              Matching “{q}”.{" "}
              <a
                href={`${BASE_PATH}${buildFilterQueryString(
                  { ...filterValues, q: undefined },
                  sortExtra,
                )}`}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Clear the search text
              </a>
            </p>
          ) : null}

          {total === 0 ? (
            <EmptyState
              title="No facilities match your filters"
              description="Try removing a filter or broadening your search to see more facilities."
              action={{ label: "Clear all filters", href: BASE_PATH }}
            />
          ) : (
            <>
              {items.length === 0 ? (
                <EmptyState
                  title="This page is beyond the last result"
                  description={`The directory has ${total} ${total === 1 ? FACILITY_LABEL : FACILITY_PLURAL_LABEL} across ${totalPages} ${totalPages === 1 ? "page" : "pages"}. Go back to page 1 to browse them.`}
                  action={{
                    label: "Back to page 1",
                    href: `${BASE_PATH}${buildFilterQueryString(filterValues, sortExtra)}`,
                  }}
                />
              ) : (
                <ul className="fh-grid fh-grid--directory list-none p-0">
                  {items.map((facility) => (
                    <li key={facility.id} className="flex min-w-0">
                      <FacilityListingCard facility={facility} className="w-full" />
                    </li>
                  ))}
                </ul>
              )}

              <UrlPagination
                page={paginationPage}
                totalPages={totalPages}
                basePath={BASE_PATH}
                values={filterValues}
                sort={sort !== DEFAULT_SORT ? sort : undefined}
              />
            </>
          )}
            </section>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="facilities-faq-heading"
        className={cn(
          fullBleedClassName,
          "border-t border-border/70 bg-white py-8 sm:py-10",
        )}
      >
        <div className={homeSectionInnerClassName}>
          <SectionHeading
            as="h2"
            id="facilities-faq-heading"
            title="Facilities directory FAQ"
            description="How the facilities directory works, including filters, verification badges and profile pages."
          />
          <FaqList faqs={facilitiesDirectoryFaqs} variant="cards" />
        </div>
      </section>
    </div>
  )
}
