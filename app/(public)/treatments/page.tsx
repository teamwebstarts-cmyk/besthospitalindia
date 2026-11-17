import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { StethoscopeIcon } from "lucide-react"

import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { EmptyState } from "@/components/shared/empty-state"
import { LoadingSkeleton } from "@/components/shared/loading-skeleton"
import { UrlPagination } from "@/features/discovery/url-pagination"
import {
  readFilterValues,
} from "@/features/discovery/types"
import { SectionHeading } from "@/components/shared/section-heading"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ROUTES } from "@/constants/routes"
import { specialties } from "@/data"
import {
  EnquiryCta,
  TreatmentCard,
} from "@/features/medical-tourism"
import { TreatmentFilters, type TreatmentSortValue } from "@/features/medical-tourism/components/treatment-filters"
import {
  doctorIdsForTreatment,
  hospitalIdsForTreatment,
  selectTreatments,
  specialtyForTreatment,
} from "@/features/medical-tourism/selectors"

/**
 * /treatments — listing with URL-param search/filter/sort/pagination (Agent A06).
 *
 * Spec: implementation/10-treatments.md. Search + specialty filter + sort +
 * page live in the URL and are resolved by pure selectors
 * (features/medical-tourism/selectors) over the frozen treatment fixtures —
 * the displayed set genuinely changes, never just control appearance.
 * lib/search is untouched. Unknown params degrade to defaults. Pagination uses
 * the shared UrlPagination wrapper (serializable props — functions cannot
 * cross the server→client boundary). A no-JS GET form mirrors the
 * search input so the listing still filters with client JS disabled.
 */

export const metadata: Metadata = {
  title: "Treatments",
  description:
    "Browse the demo treatment taxonomy by specialty, search by name and open treatment pages listing demo hospitals and doctors. Demo platform — no prices, outcomes or medical advice.",
  alternates: { canonical: ROUTES.public.treatments },
}

const PAGE_SIZE = 9

const SORT_VALUES: TreatmentSortValue[] = ["relevance", "name-asc", "name-desc"]

function parseSearchParam(
  value: string | string[] | undefined
): string {
  if (Array.isArray(value)) return value[0] ?? ""
  return value ?? ""
}

export default async function TreatmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams

  const query = parseSearchParam(params.q).slice(0, 100)
  const specialtyParam = parseSearchParam(params.specialty)
  const specialty =
    specialtyParam === "all" || specialties.some((s) => s.id === specialtyParam)
      ? specialtyParam
      : ""
  const sortParam = parseSearchParam(params.sort) as TreatmentSortValue
  const sort: TreatmentSortValue = SORT_VALUES.includes(sortParam)
    ? sortParam
    : "relevance"
  const pageParam = Number.parseInt(parseSearchParam(params.page), 10)
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1

  const results = selectTreatments({ query, specialtyId: specialty, sort })

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = results.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  // Serializable filter state for UrlPagination (functions cannot cross the
  // server→client boundary — see BUG-005 in docs/qa/PUBLIC-WEBSITE-BUG-REGISTER.md).
  // `q`/`specialty`/`sort` round-trip through the URL exactly as before; page
  // hrefs are built client-side by UrlPagination from these values.
  const filterValues = readFilterValues({ q: query, specialty: specialty && specialty !== "all" ? specialty : "" })
  const activeSort = sort !== "relevance" ? sort : undefined

  return (
    <div className="space-y-10 py-8 sm:space-y-14">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Treatments" }]}
        className="mb-2"
      />

      {/* Header */}
      <section aria-labelledby="treatments-heading" className="space-y-3">
        <h1 id="treatments-heading" className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Treatments
        </h1>
        <p className="max-w-3xl text-base text-muted-foreground">
          The demo treatment taxonomy across {specialties.length} specialties.
          Search, filter and sort genuinely operate on the fixture set via the
          URL. Every listing links to demo hospitals and doctors — this
          platform shows no prices, outcomes or guarantees, and provides no
          medical advice.
        </p>
      </section>

      {/* Filters (client enhancement) + no-JS fallback form */}
      <section aria-label="Filter and sort treatments">
        <Suspense
          fallback={<LoadingSkeleton variant="table" className="h-24" />}
        >
          <TreatmentFilters query={query} specialty={specialty} sort={sort} />
        </Suspense>
        <noscript>
          <form
            action={ROUTES.public.treatments}
            method="get"
            className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
            aria-label="Fallback filters (work without JavaScript)"
          >
            <span className="text-xs">No-JS fallback:</span>
            <input type="hidden" name="specialty" value={specialty} />
            <input type="hidden" name="sort" value={sort} />
            <input
              type="search"
              name="q"
              defaultValue={query}
              aria-label="Search treatments without JavaScript"
              className="h-8 w-48 rounded-md border border-input bg-transparent px-2 text-sm"
            />
            <button
              type="submit"
              className="h-8 rounded-md border px-2.5 text-xs font-medium hover:bg-muted"
            >
              Apply
            </button>
          </form>
        </noscript>
      </section>

      {/* Results toolbar */}
      <section aria-label="Treatment results" className="space-y-4">
        <SectionHeading
          as="h2"
          title={`${results.length} ${results.length === 1 ? "treatment" : "treatments"} found`}
          description={
            query || specialty
              ? "Filtering is applied to the fixture set; adjust the controls above to change the URL."
              : "Showing the full fixture set in featured order."
          }
        />

        {pageItems.length === 0 ? (
          <EmptyState
            icon={StethoscopeIcon}
            title="No treatments match your filters"
            description="Try a different search term or clear the specialty filter — the demo taxonomy only contains fixture entries."
            action={{ label: "Clear all filters", href: ROUTES.public.treatments }}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((treatment) => (
              <TreatmentCard
                key={treatment.id}
                treatment={treatment}
                specialty={specialtyForTreatment(treatment)}
                hospitalCount={hospitalIdsForTreatment(treatment.id).length}
                doctorCount={doctorIdsForTreatment(treatment.id).length}
              />
            ))}
          </div>
        )}

        {results.length > PAGE_SIZE ? (
          <UrlPagination
            page={safePage}
            totalPages={totalPages}
            basePath={ROUTES.public.treatments}
            values={filterValues}
            sort={activeSort}
            className="pt-2"
          />
        ) : null}
      </section>

      {/* Specialty browse */}
      <section aria-label="Browse treatments by specialty" className="space-y-4">
        <SectionHeading
          as="h2"
          title="Browse by specialty"
          description="Each specialty deep-links into this listing with the filter applied."
        />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {specialties.map((item) => (
            <li key={item.id}>
              <Card size="sm" className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <StethoscopeIcon aria-hidden className="size-4 text-muted-foreground" />
                    {item.name}
                  </CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`${ROUTES.public.treatments}?specialty=${encodeURIComponent(item.id)}`}
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    View treatments
                    <span className="sr-only"> in {item.name}</span>
                  </Link>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {/* Enquiry CTA */}
      <EnquiryCta
        title="Need help choosing? Record a demo enquiry"
        description="Tell the demo form which specialty or treatment interests you. Entries stay in this browser session — no provider is contacted."
        enquiryParams={
          specialty && specialty !== "all" ? { specialty } : undefined
        }
      />
    </div>
  )
}
