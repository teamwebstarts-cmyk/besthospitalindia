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
 * components, so ListingFilters / ResultsToolbar / UrlPagination run in URL
 * mode (basePath + current params); the shell composes canonical URLs itself.
 *
 * Spec: docs/implementation/pages/02-facilities.md.
 */

import Link from "next/link"
import type { Metadata } from "next"
import { MapPinIcon } from "lucide-react"

import { facilities, specialties } from "@/data"
import { getSpecialtyBySlug, paginate, searchFacilities } from "@/lib/search"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { EmptyState } from "@/components/shared/empty-state"
import { SectionHeading } from "@/components/shared/section-heading"
import { StatusBadge } from "@/components/shared/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { GlobalSearch } from "@/features/discovery/global-search"
import { FACILITY_CATEGORY_LABELS } from "@/features/discovery/facility-meta"
import { ListingFilters } from "@/features/discovery/listing-filters"
import { ResultsToolbar } from "@/features/discovery/results-toolbar"
import { UrlPagination } from "@/features/discovery/url-pagination"
import { readFilterValues } from "@/features/discovery/types"
import type { FacilityCategory } from "@/types"

const PAGE_SIZE = 9
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
    hint: `${facilities.filter((facility) => facility.category === category).length}`,
  }))
}

/** Distinct, alphabetically sorted city facet from the fixture set. */
function getCityOptions() {
  const countsByCity = new Map<string, number>()
  for (const facility of facilities) {
    countsByCity.set(facility.city, (countsByCity.get(facility.city) ?? 0) + 1)
  }
  return [...countsByCity.entries()]
    .sort(([cityA], [cityB]) => cityA.localeCompare(cityB))
    .map(([city, count]) => ({
      value: city,
      label: city,
      hint: `${count} ${count === 1 ? FACILITY_LABEL : "facilities"}`,
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
      "Browse fictional demo healthcare facilities — hospitals, specialty centres, diagnostic labs, rehabilitation, wellness and medical-tourism services — filtered by category, city, specialty and service. Demo data only.",
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

  // --- Discovery shell state (URL is the single source of truth) ----------
  // Scoped to the facility params this page owns; page/sort are handled
  // separately and unknown params never inflate the active-filter count.
  const filterValues = readFilterValues({
    q: q === "" ? undefined : q,
    category,
    city,
    specialty: specialtySlug,
    service,
  })

  return (
    <div className="space-y-8 py-8">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Facilities" }]}
      />

      <header className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Healthcare Facilities Directory
          </h1>
          <p className="max-w-2xl text-sm text-balance text-muted-foreground">
            Fictional demo facilities across India — hospitals, specialty
            centres, diagnostic labs, rehabilitation, wellness and
            medical-tourism services. Every record is demo data, not a real
            provider.
          </p>
        </div>
        <GlobalSearch
          defaultEntityType="facilities"
          initialQuery={q}
          routes={{
            hospitals: "/hospitals",
            doctors: "/doctors",
            treatments: "/treatments",
            facilities: "/facilities",
          }}
          className="max-w-2xl"
        />
      </header>

      <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
        <aside aria-label="Facility filters">
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
            basePath="/facilities"
            extraParams={{ q: q === "" ? undefined : q, sort }}
          />
        </aside>

        <section aria-label="Facility results" className="min-w-0 space-y-4">
          <ResultsToolbar
            total={total}
            entityLabel={FACILITY_LABEL}
            pluralLabel={FACILITY_PLURAL_LABEL}
            sortOptions={[...SORT_OPTIONS]}
            sortValue={sort}
            basePath="/facilities"
            currentParams={params}
          />

          {items.length === 0 ? (
            <EmptyState
              title="No facilities match your filters"
              description="Try removing a filter or broadening your search to see more demo facilities."
              action={{ label: "Clear all filters", href: "/facilities" }}
            />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((facility) => (
                <li key={facility.id} className="min-w-0">
                  <Card size="sm" className="h-full">
                    <CardHeader>
                      <Badge variant="secondary">
                        {FACILITY_CATEGORY_LABELS[facility.category]}
                      </Badge>
                      <CardTitle>
                        <Link
                          href={`/facilities/${facility.slug}`}
                          className="hover:underline"
                        >
                          {facility.name}
                        </Link>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1.5">
                        <MapPinIcon aria-hidden className="size-3.5 shrink-0" />
                        {facility.city}, {facility.state}
                      </CardDescription>
                      <CardAction>
                        <StatusBadge status={facility.verificationStatus} />
                      </CardAction>
                    </CardHeader>
                    <CardContent>
                      <ul
                        aria-label="Services offered"
                        className="flex flex-wrap gap-1.5"
                      >
                        {facility.services.slice(0, 3).map((serviceLabel) => (
                          <li key={serviceLabel}>
                            <Badge variant="outline">{serviceLabel}</Badge>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        size="sm"
                        render={<Link href={`/facilities/${facility.slug}`} />}
                      >
                        View facility
                      </Button>
                    </CardFooter>
                  </Card>
                </li>
              ))}
            </ul>
          )}

          <UrlPagination
            page={page}
            totalPages={totalPages}
            basePath="/facilities"
            values={filterValues}
            sort={sort}
          />
        </section>
      </div>

      <section aria-labelledby="facilities-faq-heading" className="border-t pt-8">
        <SectionHeading
          title="Facilities directory FAQ"
          description="How this demo directory works. All content is fictional demo data."
        />
        <Accordion className="mt-4">
          <AccordionItem value="what-is-listed">
            <AccordionTrigger>What is listed on this page?</AccordionTrigger>
            <AccordionContent>
              <p>
                Fictional demo facility records — hospitals, specialty centres,
                diagnostic labs, rehabilitation centres, wellness centres and
                medical-tourism services — used to demonstrate the directory
                pattern. No real provider is represented anywhere on this page.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="how-filters-combine">
            <AccordionTrigger>How do the filters combine?</AccordionTrigger>
            <AccordionContent>
              <p>
                Filters within one group match any selected value; different
                groups compose AND. Every filter, the sort order and the page
                number are reflected in the URL, so any filtered view is
                shareable and bookmarkable.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="verification-badges">
            <AccordionTrigger>What does the verification badge mean?</AccordionTrigger>
            <AccordionContent>
              <p>
                It mirrors the mock verification status carried by each demo
                record (verified, pending or unverified). It is a display state
                only — nothing in this demo has been checked against any real
                registry or accreditation body.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  )
}
