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
 * sheet; free-text search sits above results; UrlPagination keeps ?page= in
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

import Link from "next/link"

import { DirectoryPageIntro } from "@/components/shared/directory-page-intro"
import { EmptyState } from "@/components/shared/empty-state"
import { SectionHeading } from "@/components/shared/section-heading"
import { FindDoctorCard } from "@/features/content/find-doctors/find-doctor-card"
import "@/features/content/find-doctors/find-doctors.css"
import { FaqList } from "@/features/content/faq-list"
import { homeSectionInnerClassName } from "@/features/content/home-sections"
import { NOT_RATED_MESSAGE } from "@/constants/rating"
import { fullBleedClassName } from "@/lib/full-bleed"
import { cn } from "@/lib/utils"
import { doctors as doctorsList, specialties } from "@/data"
import { ROUTES } from "@/constants/routes"
import { paginate, searchDoctors } from "@/lib/search"
import type { RatingKindForSort, SearchSort } from "@/lib/search"
import { DoctorListingSearch } from "@/features/discovery/doctor-listing-search"
import { ListingFilters } from "@/features/discovery/listing-filters"
import { UrlPagination } from "@/features/discovery/url-pagination"
import {
  buildFilterQueryString,
  readFilterValues,
  toFilterValueList,
  type DiscoveryFacet,
} from "@/features/discovery/types"
import type { VerificationStatus } from "@/types"

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
const PAGE_SIZE = 10
const BASE_PATH = ROUTES.public.doctors

const doctorDirectoryFaqs = [
  {
    id: "doctor-faq-ratings",
    order: 1,
    question: "What do PER and MER mean on a doctor card?",
    answer: `PER (Patient Experience Rating) reflects patient feedback about care and communication. MER (Medical Expertise Rating) is an evidence-based assessment of credentials and practice scope. They are always displayed separately — we never combine them into one score. Missing scores show “${NOT_RATED_MESSAGE}”, never 0/5.`,
  },
  {
    id: "doctor-faq-hospitals",
    order: 2,
    question: "How are hospital associations shown?",
    answer:
      "Each doctor card lists hospitals they are associated with. Open a doctor profile for qualifications, languages, treatments and the full PER/MER evidence metadata.",
  },
  {
    id: "doctor-faq-verification",
    order: 3,
    question: "How are doctors and ratings verified?",
    answer: (
      <>
        Doctor profiles list credentials, registration state and independent PER and MER ratings with evidence
        metadata. Verification badges reflect recorded status. See the{" "}
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

function isSortValue(value: string): value is SortValue {
  return SORT_OPTIONS.some((option) => option.value === value)
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
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

const DOCTOR_CITIES = [...new Set(doctorsList.map((doctor) => doctor.city))].sort((a, b) =>
  a.localeCompare(b),
)
const DOCTOR_STATES = [...new Set(doctorsList.map((doctor) => doctor.state))].sort((a, b) =>
  a.localeCompare(b),
)
const DOCTOR_LANGUAGES = [...new Set(doctorsList.flatMap((doctor) => doctor.languages))].sort(
  (a, b) => a.localeCompare(b),
)

/** Doctor-specific facets — city, specialization, verification, languages, etc. */
const FILTER_FACETS: DiscoveryFacet[] = [
  {
    kind: "select",
    param: "city",
    label: "City",
    includeBlank: { value: "", label: "All cities" },
    options: DOCTOR_CITIES.map((city) => ({ value: city, label: city })),
  },
  {
    kind: "select",
    param: "state",
    label: "State",
    includeBlank: { value: "", label: "All states" },
    options: DOCTOR_STATES.map((state) => ({ value: state, label: state })),
  },
  {
    kind: "select",
    param: "specialization",
    label: "Specialization",
    includeBlank: { value: "", label: "All specializations" },
    options: specialties.map((specialty) => ({ value: specialty.id, label: specialty.name })),
  },
  {
    kind: "select",
    param: "verification",
    label: "Verification",
    includeBlank: { value: "", label: "Any status" },
    options: [
      { value: "verified", label: "Verified" },
      { value: "pending", label: "Pending review" },
      { value: "unverified", label: "Unverified" },
      { value: "rejected", label: "Rejected" },
      { value: "expired", label: "Expired" },
    ],
  },
  {
    kind: "multi-select",
    param: "language",
    label: "Languages spoken",
    options: DOCTOR_LANGUAGES.map((language) => ({ value: language, label: language })),
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
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface DoctorsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export const metadata = {
  title: "Doctor Directory",
  description:
    "Browse doctor profiles by city, specialization and hospital association, with independent patient-experience and medical-expertise ratings.",
}

export default async function DoctorsPage({ searchParams }: DoctorsPageProps) {
  const params = await searchParams
  const filterValues = readFilterValues(params)
  const q = filterValues.q?.[0]
  const city = filterValues.city?.[0]
  const specialization = filterValues.specialization?.[0]
  const state = filterValues.state?.[0]
  const verification = filterValues.verification?.[0]
  const languages = toFilterValueList(filterValues.language)
  const ratingStatus = filterValues["rating-status"]?.[0]
  const sort = parseSort(params.sort)
  const page = parsePage(params.page)

  const { sort: searchSort, ratingKind } = resolveSort(sort)
  const matched = searchDoctors(
    {
      query: q,
      city,
      specialization,
      state,
      languages: languages.length > 0 ? languages : undefined,
      verificationStatuses: verification
        ? [verification as VerificationStatus]
        : undefined,
    },
    undefined,
    searchSort,
    ratingKind ? { ratingKind } : undefined,
  )

  const statusFiltered =
    ratingStatus === undefined || ratingStatus === ""
      ? matched
      : matched.filter((doctor) => {
          const ratings = [doctor.ratings.per, doctor.ratings.mer]
          if (ratingStatus === "published") {
            return ratings.some((rating) => rating.status === "published" && rating.score !== null)
          }
          if (ratingStatus === "pending") {
            return ratings.some((rating) => rating.status === "pending")
          }
          if (ratingStatus === "not_assessed") {
            return ratings.every((rating) => rating.score === null)
          }
          return true
        })

  const { items, total, totalPages } = paginate(statusFiltered, page, PAGE_SIZE)
  const paginationPage = Math.min(Math.max(1, page), totalPages)

  // Scalars preserved across facet changes (never page).
  const preservedScalars = { q: q ?? "" }

  return (
    <div className="flex flex-col">
      <section
        aria-label="Doctor directory"
        className={cn(
          fullBleedClassName,
          "border-b border-border/70 bg-background py-5 sm:py-10",
        )}
      >
        <div className={homeSectionInnerClassName}>
          <DirectoryPageIntro
            className="mb-4 sm:mb-8"
            title="Doctors"
            description="Browse by city and specialty. PER and MER stay separate."
          />
          <div className="grid gap-3 sm:gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
            <aside aria-label="Doctor filters" className="lg:sticky lg:top-24 lg:self-start">
              <ListingFilters
                facets={FILTER_FACETS}
                values={filterValues}
                basePath={BASE_PATH}
                extraParams={preservedScalars}
                triggerLabel="Filters"
              />
            </aside>

            <div className="min-w-0 space-y-4">
              <DoctorListingSearch
                basePath={BASE_PATH}
                initialQuery={q ?? ""}
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
                      { sort },
                    )}`}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Clear the search text
                  </a>
                </p>
              ) : null}

              {total === 0 ? (
                <EmptyState
                  title="No doctors match these filters"
                  description="Try a different city, state or specialization, or clear the filters to see all doctor profiles."
                  action={{ label: "Clear all filters", href: BASE_PATH }}
                />
              ) : (
                <>
                  {items.length === 0 ? (
                    <EmptyState
                      title="This page is beyond the last result"
                      description={`The directory has ${total} ${total === 1 ? "doctor" : "doctors"} across ${totalPages} ${totalPages === 1 ? "page" : "pages"}. Go back to page 1 to browse them.`}
                      action={{
                        label: "Back to page 1",
                        href: `${BASE_PATH}${buildFilterQueryString(filterValues, { sort })}`,
                      }}
                    />
                  ) : (
                    <ul className="fd-grid fd-grid--directory list-none p-0" aria-label="Doctor results">
                      {items.map((doctor) => (
                        <li key={doctor.id} className="flex min-w-0">
                          <FindDoctorCard doctor={doctor} />
                        </li>
                      ))}
                    </ul>
                  )}

                  <UrlPagination
                    page={paginationPage}
                    totalPages={totalPages}
                    basePath={BASE_PATH}
                    values={filterValues}
                    sort={sort}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="doctors-directory-faq-heading"
        className={cn(
          fullBleedClassName,
          "border-t border-border/70 bg-white py-8 sm:py-10",
        )}
      >
        <div className={homeSectionInnerClassName}>
          <SectionHeading
            as="h2"
            id="doctors-directory-faq-heading"
            title="Doctor directory FAQ"
          />
          <FaqList faqs={doctorDirectoryFaqs} variant="cards" />
        </div>
      </section>
    </div>
  )
}
