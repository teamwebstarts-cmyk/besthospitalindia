/**
 * Shared discovery-shell contracts — BestHospitalIndia (A03).
 *
 * Consumed by A03 (facilities) and reusable by A04 (hospitals), A05 (doctors)
 * and A06 (treatments) listing pages. The filter state itself lives in the URL
 * search params of the parent listing page; these components are fully
 * controlled — they render the current values and write changes back. They
 * never fetch, and they never own filter state.
 *
 * TWO INTEGRATION MODES (React server/client boundary rules):
 * - Client parents pass `onFiltersChange` / `onSortChange` callbacks.
 * - Server parents pass `basePath` (+ current params). The shell composes the
 *   URL itself with the pure helpers below and navigates via the router.
 *   Functions cannot cross the server→client boundary, so server pages MUST
 *   use the URL mode.
 */

import type { ReactNode } from "react"

// ---------------------------------------------------------------------------
// Facet configuration
// ---------------------------------------------------------------------------

/** A single selectable option inside any facet kind. */
export interface DiscoveryFacetOption {
  /** Canonical URL-param value (stable, shareable, lowercase kebab by convention). */
  value: string
  /** Human-facing label shown on the checkbox / in the select. */
  label: string
  /** Optional supporting count or hint rendered beside the label. */
  hint?: string
}

/**
 * A checkbox multi-select facet. Selecting any option keeps records that match
 * ANY selected value (OR within the facet); separate facets compose AND.
 */
export interface DiscoveryMultiSelectFacet {
  kind: "multi-select"
  /** URL search param this facet reads/writes, e.g. "specialty". */
  param: string
  /** Group label rendered as the facet heading. */
  label: string
  options: DiscoveryFacetOption[]
}

/** A select facet (single value at a time, e.g. city or single-choice filters). */
export interface DiscoverySelectFacet {
  kind: "select"
  param: string
  label: string
  /** Select facets may show an explicit "no preference" choice. */
  includeBlank?: { value: string; label: string }
  options: DiscoveryFacetOption[]
}

/** Union of facet configs a listing page may pass to ListingFilters. */
export type DiscoveryFacet = DiscoveryMultiSelectFacet | DiscoverySelectFacet

/**
 * Shape of the currently-applied filter values, keyed by facet param.
 * The parent page derives this from its URL searchParams (Promise) and passes
 * it down. Multi-select params hold string arrays; single-value params (e.g.
 * q, city) may hold a plain string or a single-element array — consumers
 * normalize internally via toFilterValueList. Scalars are accepted for
 * convenience when composing object literals inline.
 */
export type DiscoveryFilterValues = Record<string, string | string[] | undefined>

/** Normalize one filter value entry to a string array (pure). */
export function toFilterValueList(value: string | string[] | undefined): string[] {
  if (value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

// ---------------------------------------------------------------------------
// Component props
// ---------------------------------------------------------------------------

/** Entity listing the GlobalSearch can route to. */
export type SearchEntityType = "hospitals" | "doctors" | "treatments" | "facilities"

export interface GlobalSearchProps {
  /** Preselected entity type (still switchable in the select). */
  defaultEntityType?: SearchEntityType
  /** Initial query text (e.g. from the current listing's ?q= param). */
  initialQuery?: string
  /** Route path each entity type submits to, keyed by entity type. */
  routes: Record<SearchEntityType, string>
  /** Submit button label (default "Search"). */
  submitLabel?: string
  /** Accessible label for the query field. */
  queryLabel?: string
  className?: string
  /** `header` — single pill row for the site chrome (same submit behaviour). */
  layout?: "default" | "header"
}

export interface ListingFiltersProps {
  /** Facet configuration for this entity's listing. */
  facets: DiscoveryFacet[]
  /** Current applied values keyed by facet param (from URL searchParams). */
  values: DiscoveryFilterValues
  /**
   * Client-parent mode: receives the next full set of filter values; the
   * parent composes the URL itself.
   */
  onFiltersChange?: (nextValues: DiscoveryFilterValues) => void
  /**
   * Server-parent mode: base path of the listing (e.g. "/facilities"). Filter
   * changes are written to URL params and ?page= is reset to 1.
   */
  basePath?: string
  /**
   * Server-parent mode: scalar params preserved across filter changes
   * (e.g. { q, sort }). `page` must not be included — it resets on change.
   */
  extraParams?: Record<string, string | undefined>
  /** Label for the mobile filter trigger and sheet (default "Filters"). */
  triggerLabel?: string
  /** Show an active-facet count on the mobile trigger. */
  showActiveCount?: boolean
  className?: string
}

/** Sort option contract for ResultsToolbar. */
export interface SortOption {
  /** Canonical ?sort= value, e.g. "relevance" | "name-asc". */
  value: string
  label: string
}

export interface ResultsToolbarProps {
  /** Total result count for the current filter/sort state. */
  total: string | number
  /** Singular entity word, e.g. "facility"; count line reads "N facilities". */
  entityLabel: string
  /**
   * Optional plural entity word when pluralization is irregular
   * (e.g. entityLabel "facility" → pluralLabel "facilities", not "facilitys").
   * Falls back to `${entityLabel}s` when omitted.
   */
  pluralLabel?: string
  /** Available sort options (entity-specific). Readonly — `as const` literals accepted. */
  sortOptions: readonly SortOption[]
  /** Currently applied ?sort= value. */
  sortValue: string
  /**
   * Client-parent mode: receives the next sort value; the parent composes
   * the URL.
   */
  onSortChange?: (nextSort: string) => void
  /**
   * Server-parent mode: base path of the listing. Sort changes are written to
   * the ?sort= param and ?page= is reset to 1.
   */
  basePath?: string
  /**
   * Server-parent mode: the raw URL searchParams of the current page. All
   * non-page/non-sort params are preserved; ?sort= is replaced.
   */
  currentParams?: Record<string, string | string[] | undefined>
  /** Optional view-mode slot (e.g. grid/list toggle) owned by the parent page. */
  viewToggle?: ReactNode
  className?: string
}

export interface UrlPaginationProps {
  /** Current 1-based page. */
  page: number
  /** Total number of pages. */
  totalPages: number
  /** Base path of the listing (e.g. "/facilities"). */
  basePath: string
  /** Current filter values (q/category/…); preserved across page changes. */
  values: DiscoveryFilterValues
  /** Current sort value; preserved across page changes. */
  sort?: string
  className?: string
}

// ---------------------------------------------------------------------------
// Shared helpers (pure; usable by any page agent)
// ---------------------------------------------------------------------------

/**
 * Extract string values for one param from Next 16 searchParams (Promise —
 * await before use). Single params become single-element arrays. The `page`
 * and `sort` params are excluded (they are pagination/sort, not filters).
 */
export function readFilterValues(
  searchParams: Record<string, string | string[] | undefined>,
): DiscoveryFilterValues {
  const values: DiscoveryFilterValues = {}
  for (const [key, raw] of Object.entries(searchParams)) {
    if (key === "page" || key === "sort") continue
    if (typeof raw === "string") {
      if (raw !== "") values[key] = [raw]
    } else if (Array.isArray(raw)) {
      const cleaned = raw.filter((item) => item !== "")
      if (cleaned.length > 0) values[key] = cleaned
    }
  }
  return values
}

/** Count how many distinct params currently hold a value. */
export function countActiveFilters(values: DiscoveryFilterValues): number {
  return Object.values(values).filter((value) => toFilterValueList(value).length > 0).length
}

/**
 * Build a canonical filter URL string from filter values. Order-independent,
 * deterministic (params sorted alphabetically), omits empty values.
 * `extra` adds scalar params like sort; omit `page` to reset paging to 1.
 */
export function buildFilterQueryString(
  values: DiscoveryFilterValues,
  extra?: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams()
  const sortedParams = Object.keys(values).sort()
  for (const param of sortedParams) {
    for (const value of toFilterValueList(values[param])) {
      params.append(param, value)
    }
  }
  for (const [key, value] of Object.entries(extra ?? {})) {
    if (value !== undefined && value !== "") params.set(key, value)
  }
  const query = params.toString()
  return query === "" ? "" : `?${query}`
}
