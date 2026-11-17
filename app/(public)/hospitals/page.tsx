/**
 * /hospitals — Hospital directory (Agent A04).
 *
 * Spec: implementation/pages/04-hospitals.md — Breadcrumb; heading; filters;
 * result count/sort; hospital cards with separate PER/CER; pagination; FAQ.
 *
 * URL-driven (10-routing-and-layouts.md): filters, sort and page live in the
 * search params. Filters compose AND (lib/search contract). Sorting operates
 * on ONE rating kind at a time — "PER (high → low)" and "CER (high → low)"
 * are separate sort options, and no combined score exists anywhere. Missing
 * scores sort last (lib/search), never as 0.
 *
 * A03's discovery shell (ListingFilters / ResultsToolbar / UrlPagination) is
 * consumed in Server-Component URL mode: the page awaits searchParams, derives
 * filter values via readFilterValues, and the shell components write changes
 * back to the URL themselves.
 */

import type { Metadata } from "next"
import Link from "next/link"
import { Building2Icon } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { EmptyState } from "@/components/shared/empty-state"
import { SectionHeading } from "@/components/shared/section-heading"
import { HospitalCard } from "@/features/providers/components/hospital-card"
import {
  ListingFilters,
} from "@/features/discovery/listing-filters"
import { ResultsToolbar } from "@/features/discovery/results-toolbar"
import { UrlPagination } from "@/features/discovery/url-pagination"
import {
  readFilterValues,
} from "@/features/discovery/types"
import { hospitals, specialties } from "@/data"
import { paginate, searchHospitals, type SearchSort } from "@/lib/search"
import { ROUTES } from "@/constants/routes"
import { NOT_RATED_MESSAGE } from "@/constants/rating"

const PAGE_SIZE = 6
const BASE_PATH = ROUTES.public.hospitals

/** Canonical sort param values — PER and CER sorts stay separate (never combined). */
const SORT_OPTIONS = [
  { value: "relevance", label: "Sort: Featured" },
  { value: "name-asc", label: "Name (A → Z)" },
  { value: "name-desc", label: "Name (Z → A)" },
  { value: "rating-desc-per", label: "PER (high → low)" },
  { value: "rating-desc-cer", label: "CER (high → low)" },
] as const

const DEFAULT_SORT: SearchSort = "relevance"

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
    "Browse demo hospitals across India with independent patient experience (PER) and clinical expertise (CER) ratings, filters and city coverage. Fictional demo directory.",
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
  const rawSpecialty = filterValues.specialty
  const specialtyIds = Array.isArray(rawSpecialty) ? rawSpecialty : rawSpecialty ? [rawSpecialty] : []
  const accreditation = filterValues.accreditation?.[0]
  const ratingStatus = filterValues["rating-status"]?.[0]

  const results = searchHospitals(
    { query: q, city, specialties: specialtyIds },
    undefined,
    sort,
    ratingKind ? { ratingKind } : undefined,
  )

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

  // Facet options derived from fixtures — no hardcoded arrays in JSX.
  const cities = [...new Set(hospitals.map((hospital) => hospital.city))].sort((a, b) => a.localeCompare(b))

  const facetValues: Record<string, string[]> = {
    ...(q ? { q: [q] } : {}),
    ...(city ? { city: [city] } : {}),
    ...(specialtyIds.length > 0 ? { specialty: specialtyIds } : {}),
    ...(accreditation ? { accreditation: [accreditation] } : {}),
    ...(ratingStatus ? { "rating-status": [ratingStatus] } : {}),
  }

  return (
    <div className="space-y-8 py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: ROUTES.public.home },
          { label: "Hospitals" },
        ]}
      />

      <header className="space-y-2">
        <SectionHeading
          as="h1"
          title="Hospitals"
          description="Compare demo hospitals across India. Patient experience (PER) and clinical expertise (CER) ratings are shown independently — they are never combined into a single score."
        />
      </header>

      <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside aria-label="Hospital filters" className="lg:sticky lg:top-24 lg:self-start">
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
            extraParams={{ sort: rawSort }}
          />
        </aside>

        <div className="space-y-6">
          <ResultsToolbar
            total={total}
            entityLabel="hospital"
            sortOptions={[...SORT_OPTIONS]}
            sortValue={rawSort ?? "relevance"}
            basePath={BASE_PATH}
            currentParams={params}
          />

          {total === 0 ? (
            <EmptyState
              icon={Building2Icon}
              title="No hospitals match these filters"
              description="Try removing a filter — for example the specialty or rating status — or clear everything to browse the full demo directory."
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
                <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-label="Hospital results">
                  {items.map((hospital) => (
                    <li key={hospital.id} className="min-w-0">
                      <HospitalCard hospital={hospital} />
                    </li>
                  ))}
                </ul>
              )}

              <UrlPagination
                page={page}
                totalPages={totalPages}
                basePath={BASE_PATH}
                values={filterValues}
                sort={rawSort}
              />
            </>
          )}
        </div>
      </div>

      <section className="space-y-4 border-t pt-8">
        <SectionHeading as="h2" title="Hospital directory FAQ" />
        <Accordion className="max-w-3xl">
          <AccordionItem value="faq-ratings">
            <AccordionTrigger>What do PER and CER mean on a hospital card?</AccordionTrigger>
            <AccordionContent>
              PER (Patient Experience Rating) reflects patient feedback about care and service. CER (Clinical
              Expertise Rating) is an evidence-based clinical assessment. They are always displayed separately —
              this demo never combines them into one score. Ratings without an approved score show
              “{NOT_RATED_MESSAGE}”, never 0/5.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq-missing">
            <AccordionTrigger>Why do some hospitals show “Not yet rated”?</AccordionTrigger>
            <AccordionContent>
              In this demo dataset, some providers have not completed an assessment workflow yet. A missing score
              is a missing score — the directory never substitutes 0 or a placeholder average.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq-verification">
            <AccordionTrigger>Are these hospitals and ratings real?</AccordionTrigger>
            <AccordionContent>
              No. Every hospital, rating, review and accreditation in this directory is fictional demo data
              exercising the product’s trust-first display rules. See the{" "}
              <Link href={ROUTES.public.ratingMethodology} className="font-medium text-primary underline-offset-4 hover:underline">
                rating methodology
              </Link>{" "}
              page for how ratings are presented.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  )
}
