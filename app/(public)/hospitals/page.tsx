/**
 * /hospitals — Hospital directory (Agent A04).
 *
 * Spec: implementation/pages/04-hospitals.md — Breadcrumb; heading; filters;
 * hospital cards with separate PER/CER; pagination; FAQ.
 *
 * URL-driven (10-routing-and-layouts.md): filters, sort and page live in the
 * search params. Filters compose AND (lib/search contract). Sorting operates
 * on ONE rating kind at a time — "PER (high → low)" and "CER (high → low)"
 * are separate sort options, and no combined score exists anywhere. Missing
 * scores sort last (lib/search), never as 0.
 *
 * A03's discovery shell (ListingFilters / UrlPagination) is
 * consumed in Server-Component URL mode: the page awaits searchParams, derives
 * filter values via readFilterValues, and the shell components write changes
 * back to the URL themselves.
 */

import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { Building2Icon } from "lucide-react"

import { DirectoryPageIntro } from "@/components/shared/directory-page-intro"
import { FaqList } from "@/features/content/faq-list"
import { EmptyState } from "@/components/shared/empty-state"
import { SectionHeading } from "@/components/shared/section-heading"
import { FeaturedHospitalCard } from "@/features/content/featured-hospitals/featured-hospital-card"
import "@/features/content/featured-hospitals/featured-hospitals.css"
import {
  ListingFilters,
} from "@/features/discovery/listing-filters"
import { UrlPagination } from "@/features/discovery/url-pagination"
import { DirectoryFilterBar } from "@/features/discovery/directory-filter-bar"
import { LoadingSkeleton } from "@/components/shared/loading-skeleton"
import {
  buildFilterQueryString,
  readFilterValues,
} from "@/features/discovery/types"
import { hospitals, specialties } from "@/data"
import { matchingPublishedHospitals, publishedHospitals } from "@/lib/catalogue/published"
import { isCataloguePublic } from "@/lib/catalogue/store"
import { paginate, searchHospitals, type SearchSort } from "@/lib/search"
import { ROUTES } from "@/constants/routes"
import { NOT_RATED_MESSAGE } from "@/constants/rating"
import { homeSectionInnerClassName } from "@/features/content/home-sections"
import { fullBleedClassName } from "@/lib/full-bleed"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10
const BASE_PATH = ROUTES.public.hospitals

const hospitalDirectoryFaqs = [
  {
    id: "hospital-faq-ratings",
    order: 1,
    question: "What do PER and CER mean on a hospital card?",
    answer: `PER (Patient Experience Rating) reflects patient feedback about care and service. CER (Clinical Expertise Rating) is an evidence-based clinical assessment. They are always displayed separately — we never combine them into one score. Ratings without an approved score show “${NOT_RATED_MESSAGE}”, never 0/5.`,
  },
  {
    id: "hospital-faq-missing",
    order: 2,
    question: 'Why do some hospitals show “Not yet rated”?',
    answer:
      "Some providers have not completed an assessment workflow yet. A missing score is a missing score — the directory never substitutes 0 or a placeholder average.",
  },
  {
    id: "hospital-faq-verification",
    order: 3,
    question: "How are hospitals and ratings verified?",
    answer: (
      <>
        Each hospital profile lists accreditations and independent PER and CER ratings with evidence
        metadata. See the{" "}
        <Link
          href={ROUTES.public.ratingMethodology}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          rating methodology
        </Link>{" "}
        page for how ratings are presented.
      </>
    ),
  },
] as const

const DEFAULT_SORT: SearchSort = "relevance"

const HOSPITAL_SORT_OPTIONS = [
  { value: "relevance", label: "Featured order" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "rating-desc-per", label: "PER (high → low)" },
  { value: "rating-desc-cer", label: "CER (high → low)" },
] as const

/** Map the URL ?sort= value onto the lib/search contract (one rating kind only). */
function resolveSort(raw: string | undefined): { sort: SearchSort; ratingKind?: "PER" | "CER" } {
  switch (raw) {
    case "name-asc":
      return { sort: "name-asc" }
    case "name-desc":
      return { sort: "name-desc" }
    case "rating-desc-per":
      return { sort: "rating-desc", ratingKind: "PER" }
    case "rating-desc-cer":
      return { sort: "rating-desc", ratingKind: "CER" }
    default:
      return { sort: DEFAULT_SORT }
  }
}

export const metadata: Metadata = {
  title: "Hospitals",
  description:
    "Browse hospitals across India with independent patient experience (PER) and clinical expertise (CER) ratings, filters and city coverage.",
  alternates: { canonical: BASE_PATH },
}

interface HospitalsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function HospitalsPage({ searchParams }: HospitalsPageProps) {
  const params = await searchParams
  const filterValues = readFilterValues(params)

  const rawSort = typeof params.sort === "string" ? params.sort : undefined
  const rawPage = typeof params.page === "string" ? Number.parseInt(params.page, 10) : NaN
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1
  const { sort, ratingKind } = resolveSort(rawSort)

  // URL param names align with the SearchFilters contract; values compose AND.
  const q = filterValues.q?.[0]
  const city = filterValues.city?.[0]
  const state = filterValues.state?.[0]
  const rawSpecialty = filterValues.specialty
  const specialtyIds = Array.isArray(rawSpecialty) ? rawSpecialty : rawSpecialty ? [rawSpecialty] : []
  const accreditation = filterValues.accreditation?.[0]
  const ratingStatus = filterValues["rating-status"]?.[0]

  const results = searchHospitals(
    { query: q, city, state, specialties: specialtyIds },
    undefined,
    sort,
    ratingKind ? { ratingKind } : undefined,
  ).filter((hospital) => isCataloguePublic("hospital", hospital.id))
    .concat(matchingPublishedHospitals({ query: q, city, state, specialties: specialtyIds }))

  // Facet-local refinements handled page-side (rating status is display-only
  // metadata, so it filters on the rendered RatingSummary rather than lib/search).
  const statusFiltered =
    ratingStatus === undefined || ratingStatus === ""
      ? results
      : results.filter((hospital) => {
          const ratings = [hospital.ratings.per, hospital.ratings.cer]
          if (ratingStatus === "published") return ratings.some((r) => r.status === "published" && r.score !== null)
          if (ratingStatus === "pending") return ratings.some((r) => r.status === "pending")
          if (ratingStatus === "not_assessed") return ratings.every((r) => r.score === null)
          return true
        })

  const accreditationFiltered =
    accreditation === undefined || accreditation === ""
      ? statusFiltered
      : statusFiltered.filter((hospital) =>
          accreditation === "any"
            ? hospital.accreditations.length > 0
            : accreditation === "none"
              ? hospital.accreditations.length === 0
              : true,
        )

  const filtered = accreditationFiltered
  const { items, total, totalPages } = paginate(filtered, page, PAGE_SIZE)
  const paginationPage = Math.min(Math.max(1, page), totalPages)

  // Facet options derived from fixtures — no hardcoded arrays in JSX.
  const cities = [...new Set([
    ...hospitals.filter((hospital) => isCataloguePublic("hospital", hospital.id)).map((hospital) => hospital.city),
    ...publishedHospitals().map((hospital) => hospital.city),
  ])].sort((a, b) => a.localeCompare(b))

  const facetValues: Record<string, string[]> = {
    ...(q ? { q: [q] } : {}),
    ...(city ? { city: [city] } : {}),
    ...(state ? { state: [state] } : {}),
    ...(specialtyIds.length > 0 ? { specialty: specialtyIds } : {}),
    ...(accreditation ? { accreditation: [accreditation] } : {}),
    ...(ratingStatus ? { "rating-status": [ratingStatus] } : {}),
  }

  const preservedScalars = { q: q ?? "" }

  return (
    <div className="flex flex-col">
      <section
        aria-label="Hospital directory"
        className={cn(
          fullBleedClassName,
          "border-b border-border/70 bg-background py-5 sm:py-10",
        )}
      >
        <div className={homeSectionInnerClassName}>
          <DirectoryPageIntro
            className="mb-4 sm:mb-8"
            title="Hospitals"
            description="Compare hospitals with separate PER and CER ratings."
          />
          <div className="grid gap-3 sm:gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside
          aria-label="Hospital filters"
          className="hidden lg:sticky lg:top-24 lg:block lg:self-start"
        >
          <ListingFilters
            facets={[
              {
                kind: "select",
                param: "city",
                label: "City",
                includeBlank: { value: "", label: "All cities" },
                options: cities.map((cityName) => ({ value: cityName, label: cityName })),
              },
              {
                kind: "multi-select",
                param: "specialty",
                label: "Specialty",
                options: specialties.map((specialty) => ({ value: specialty.id, label: specialty.name })),
              },
              {
                kind: "select",
                param: "accreditation",
                label: "Accreditation",
                includeBlank: { value: "", label: "Any accreditation state" },
                options: [
                  { value: "any", label: "Has accreditations" },
                  { value: "none", label: "No accreditations listed" },
                ],
              },
              {
                kind: "select",
                param: "rating-status",
                label: "Rating status",
                includeBlank: { value: "", label: "Any rating status" },
                options: [
                  { value: "published", label: "Has a published rating" },
                  { value: "pending", label: "Assessment pending" },
                  { value: "not_assessed", label: "Not yet rated" },
                ],
              },
            ]}
            values={facetValues}
            basePath={BASE_PATH}
            extraParams={{ ...preservedScalars, ...(rawSort ? { sort: rawSort } : {}) }}
          />
        </aside>

        <div className="space-y-6">
          <Suspense fallback={<LoadingSkeleton variant="table" className="h-28 rounded-xl" />}>
            <DirectoryFilterBar
              basePath={BASE_PATH}
              search={{
                label: "Search hospitals",
                placeholder: "Name, city or specialty…",
                value: q ?? "",
              }}
              selects={[
                {
                  id: "hospital-filter-city",
                  param: "city",
                  label: "City",
                  value: city ?? "",
                  emptyValue: "",
                  options: [
                    { value: "", label: "All cities" },
                    ...cities.map((cityName) => ({ value: cityName, label: cityName })),
                  ],
                },
                {
                  id: "hospital-filter-specialty",
                  param: "specialty",
                  label: "Specialty",
                  value: specialtyIds[0] ?? "all",
                  emptyValue: "all",
                  options: [
                    { value: "all", label: "All specialties" },
                    ...specialties.map((specialty) => ({
                      value: specialty.id,
                      label: specialty.name,
                    })),
                  ],
                },
              ]}
              sort={{
                param: "sort",
                value: rawSort ?? DEFAULT_SORT,
                defaultValue: DEFAULT_SORT,
                options: HOSPITAL_SORT_OPTIONS,
              }}
            />
          </Suspense>

          {q ? (
            <p className="text-sm text-muted-foreground">
              Matching “{q}”.{" "}
              <a
                href={`${BASE_PATH}${buildFilterQueryString(
                  { ...filterValues, q: undefined },
                  rawSort ? { sort: rawSort } : undefined,
                )}`}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Clear the search text
              </a>
            </p>
          ) : null}

          {total === 0 ? (
            <EmptyState
              icon={Building2Icon}
              title="No hospitals match these filters"
              description="Try removing a filter — for example the specialty or rating status — or clear everything to browse the full directory."
              action={{
                label: "Clear all filters",
                href: BASE_PATH,
              }}
            />
          ) : (
            <>
              {items.length === 0 ? (
                <EmptyState
                  icon={Building2Icon}
                  title="This page is beyond the last result"
                  description={`The directory has ${total} ${total === 1 ? "hospital" : "hospitals"} across ${totalPages} ${totalPages === 1 ? "page" : "pages"}. Go back to page 1 to browse them.`}
                  action={{ label: "Back to page 1", href: BASE_PATH }}
                />
              ) : (
                <ul className="fh-grid fh-grid--directory list-none p-0" aria-label="Hospital results">
                  {items.map((hospital) => (
                    <li key={hospital.id} className="flex min-h-0 min-w-0">
                      <FeaturedHospitalCard hospital={hospital} />
                    </li>
                  ))}
                </ul>
              )}

              <UrlPagination
                page={paginationPage}
                totalPages={totalPages}
                basePath={BASE_PATH}
                values={filterValues}
                sort={rawSort}
              />
            </>
          )}
          </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="hospitals-directory-faq-heading"
        className={cn(
          fullBleedClassName,
          "border-t border-border/70 bg-white py-8 sm:py-10",
        )}
      >
        <div className={homeSectionInnerClassName}>
          <SectionHeading
            as="h2"
            id="hospitals-directory-faq-heading"
            title="Hospital directory FAQ"
          />
          <FaqList faqs={hospitalDirectoryFaqs} variant="cards" />
        </div>
      </section>
    </div>
  )
}
