/**
 * Pure, deterministic search/filter/sort/paginate selectors — BestHospitalIndia (A01).
 *
 * Contract source: implementation/09-data-models-and-mock-data.md "Utility contracts"
 * + 01-requirements.md "Data and interaction requirements" (URL-param-driven,
 * filters compose AND). All functions are pure: no input mutation, no randomness,
 * stable ordering with deterministic tie-breaks by id.
 *
 * RATINGS RULE: sorting by 'rating-desc' operates on ONE explicit rating kind
 * ('PER' | 'CER' | 'MER') supplied via SearchOptions.ratingKind. These selectors
 * never derive or sort on a combined score, and unrated (null) records always
 * sort last — a missing score is never treated as 0. If 'rating-desc' is
 * requested without a ratingKind, the sort deterministically falls back to
 * fixture order (relevance) rather than guessing a kind.
 */

import {
  doctorById,
  hospitalById,
  specialtyBySlug,
  doctors,
  facilities,
  hospitals,
  treatmentById,
  treatments,
  treatmentBySlug,
} from '@/data';
import type {
  Doctor,
  Facility,
  FacilityCategory,
  Hospital,
  RatingSummary,
  Specialty,
  Treatment,
} from '@/types';

// ---------------------------------------------------------------------------
// Shared filter / sort contract
// ---------------------------------------------------------------------------

export interface SearchFilters {
  /** Free-text query, case-insensitive; tokens AND-composed across fields. */
  query?: string;
  /** City filter (exact, case-insensitive). */
  city?: string;
  /** State filter (exact, case-insensitive). */
  state?: string;
  /** AND-composed specialty-id filter (hospital must have ALL). */
  specialties?: string[];
  /** AND-composed treatment-id filter (record must have ALL). */
  treatments?: string[];
  /** AND-composed service filter (Facility; service strings are demo labels). */
  services?: string[];
  /** Hospital facilityType (exact, case-insensitive). */
  facilityType?: string;
  /** Facility category filter (record matches ANY listed category). */
  categories?: FacilityCategory[];
  /** Doctor specialization (specialty id, exact). */
  specialization?: string;
  /** AND-composed hospital-id filter (doctor must be linked to ALL). */
  hospitalIds?: string[];
  /** AND-composed language filter (doctor must speak ALL). */
  languages?: string[];
  /** Verification-status filter (record matches ANY listed status). */
  verificationStatuses?: Hospital['verificationStatus'][];
}

export type SearchSort =
  | 'relevance'
  | 'rating-desc'
  | 'name-asc'
  | 'name-desc'
  | 'experience-desc';

export interface SearchOptions {
  /**
   * Required when sort is 'rating-desc': the single rating kind to sort on.
   * Never combined with any other kind.
   */
  ratingKind?: 'PER' | 'CER' | 'MER';
}

export type RatingKindForSort = NonNullable<SearchOptions['ratingKind']>;

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

/** Case-insensitive "contains"; undefined-safe. */
function contains(haystack: string | undefined, needle: string): boolean {
  return (haystack ?? '').toLowerCase().includes(needle.toLowerCase());
}

/** Case-insensitive exact match. */
function equalsIgnoreCase(a: string | undefined, b: string): boolean {
  return (a ?? '').toLowerCase() === b.toLowerCase();
}

/** True when every required id is present in the record's id list (AND semantics). */
function includesAll(ids: readonly string[] | undefined, required: readonly string[]): boolean {
  if (required.length === 0) return true;
  const set = new Set(ids ?? []);
  return required.every((id) => set.has(id));
}

/** Split a query into lowercase tokens; empty query → no constraints. */
function queryTokens(query: string | undefined): string[] {
  return (query ?? '')
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

/** Every token must appear in at least one field (AND across tokens, OR within fields). */
function matchesQuery(tokens: readonly string[], fields: readonly (string | undefined)[]): boolean {
  return tokens.every((token) => fields.some((field) => contains(field, token)));
}

/** Merge the positional (query, filters) arguments into one filters object. */
function mergeArgs(
  query: string | SearchFilters | undefined,
  filters: SearchFilters | undefined,
): SearchFilters {
  if (typeof query === 'string' || query === undefined) {
    return { ...(filters ?? {}), query: query ?? filters?.query };
  }
  return { ...query, ...(filters ?? {}) };
}

/**
 * Minimal structural shape needed for sorting. Hospital/Doctor satisfy it;
 * Facility satisfies it without `ratings`/`yearsExperience`. This keeps the
 * sort helpers cast-free.
 */
interface SortableRecord {
  id: string;
  name: string;
  yearsExperience?: number | null;
  ratings?: { per: RatingSummary; cer?: RatingSummary; mer?: RatingSummary };
}

/** Pick the requested RatingSummary — never a blend. */
function pickRating(ratings: SortableRecord['ratings'], kind: RatingKindForSort): RatingSummary | undefined {
  if (!ratings) return undefined;
  if (kind === 'PER') return ratings.per;
  if (kind === 'CER') return ratings.cer;
  return ratings.mer;
}

/**
 * Compare two records by ONE rating kind. Unrated (null/absent) sorts LAST so a
 * missing score is never misread as 0. Ties break by id for determinism.
 */
function compareByRating(a: SortableRecord, b: SortableRecord, kind: RatingKindForSort): number {
  const va = pickRating(a.ratings, kind)?.score ?? null;
  const vb = pickRating(b.ratings, kind)?.score ?? null;
  if (va === null && vb === null) return a.id.localeCompare(b.id);
  if (va === null) return 1;
  if (vb === null) return -1;
  return vb - va || a.id.localeCompare(b.id);
}

/** Stable alphabetical comparator with id tie-break. */
function compareByName(
  a: { name: string; id: string },
  b: { name: string; id: string },
  dir: 1 | -1,
): number {
  const byName = a.name.localeCompare(b.name) * dir;
  return byName !== 0 ? byName : a.id.localeCompare(b.id);
}

/** Apply the shared sort contract; always returns a new array (no input mutation). */
function applySort<T extends SortableRecord>(
  items: T[],
  sort: SearchSort,
  ratingKind: RatingKindForSort | undefined,
): T[] {
  const copy = items.slice();
  switch (sort) {
    case 'rating-desc':
      // No explicit kind → deterministic fallback to fixture order; never a combined sort.
      if (!ratingKind) return copy;
      return copy.sort((a, b) => compareByRating(a, b, ratingKind));
    case 'name-asc':
      return copy.sort((a, b) => compareByName(a, b, 1));
    case 'name-desc':
      return copy.sort((a, b) => compareByName(a, b, -1));
    case 'experience-desc':
      // Unspecified experience (null) sorts last, never as 0 years.
      return copy.sort(
        (a, b) => (b.yearsExperience ?? -1) - (a.yearsExperience ?? -1) || a.id.localeCompare(b.id),
      );
    case 'relevance':
    default:
      return copy;
  }
}

// ---------------------------------------------------------------------------
// Hospital search
// ---------------------------------------------------------------------------

function filterHospitals(items: readonly Hospital[], filters: SearchFilters): Hospital[] {
  const tokens = queryTokens(filters.query);
  return items.filter((h) => {
    if (!matchesQuery(tokens, [h.name, h.city, h.state, h.facilityType, h.overview])) return false;
    if (filters.city && !equalsIgnoreCase(h.city, filters.city)) return false;
    if (filters.state && !equalsIgnoreCase(h.state, filters.state)) return false;
    if (filters.facilityType && !equalsIgnoreCase(h.facilityType, filters.facilityType)) return false;
    if (!includesAll(h.specialties, filters.specialties ?? [])) return false;
    if (!includesAll(h.treatments, filters.treatments ?? [])) return false;
    if (
      filters.verificationStatuses?.length &&
      !filters.verificationStatuses.includes(h.verificationStatus)
    ) {
      return false;
    }
    return true;
  });
}

/**
 * Filter + sort hospitals. `query` may be a free-text string or a full filters
 * object; positional `filters` compose AND with it.
 */
export function searchHospitals(
  query: string | SearchFilters | undefined,
  filters?: SearchFilters,
  sort: SearchSort = 'relevance',
  options?: SearchOptions,
): Hospital[] {
  const merged = mergeArgs(query, filters);
  const matched = filterHospitals(hospitals, merged);
  return applySort(matched, sort, options?.ratingKind);
}

// ---------------------------------------------------------------------------
// Doctor search
// ---------------------------------------------------------------------------

function filterDoctors(items: readonly Doctor[], filters: SearchFilters): Doctor[] {
  const tokens = queryTokens(filters.query);
  return items.filter((d) => {
    if (!matchesQuery(tokens, [d.name, d.city, d.state, d.specialization, ...d.qualifications])) {
      return false;
    }
    if (filters.city && !equalsIgnoreCase(d.city, filters.city)) return false;
    if (filters.state && !equalsIgnoreCase(d.state, filters.state)) return false;
    if (filters.specialization && d.specialization !== filters.specialization) return false;
    if (!includesAll(d.hospitalIds, filters.hospitalIds ?? [])) return false;
    if (!includesAll(d.treatments, filters.treatments ?? [])) return false;
    if (!includesAll(d.languages, filters.languages ?? [])) return false;
    if (
      filters.verificationStatuses?.length &&
      !filters.verificationStatuses.includes(d.verificationStatus)
    ) {
      return false;
    }
    return true;
  });
}

/** Filter + sort doctors (same contract as searchHospitals). */
export function searchDoctors(
  query: string | SearchFilters | undefined,
  filters?: SearchFilters,
  sort: SearchSort = 'relevance',
  options?: SearchOptions,
): Doctor[] {
  const merged = mergeArgs(query, filters);
  const matched = filterDoctors(doctors, merged);
  return applySort(matched, sort, options?.ratingKind);
}

// ---------------------------------------------------------------------------
// Facility search
// ---------------------------------------------------------------------------

function filterFacilities(items: readonly Facility[], filters: SearchFilters): Facility[] {
  const tokens = queryTokens(filters.query);
  return items.filter((f) => {
    if (!matchesQuery(tokens, [f.name, f.city, f.state, f.category, ...f.services])) return false;
    if (filters.city && !equalsIgnoreCase(f.city, filters.city)) return false;
    if (filters.state && !equalsIgnoreCase(f.state, filters.state)) return false;
    if (!includesAll(f.specialties, filters.specialties ?? [])) return false;
    if (!includesAll(f.services, filters.services ?? [])) return false;
    if (filters.categories?.length && !filters.categories.includes(f.category)) return false;
    if (
      filters.verificationStatuses?.length &&
      !filters.verificationStatuses.includes(f.verificationStatus)
    ) {
      return false;
    }
    return true;
  });
}

/** Filter + sort facilities (same contract as searchHospitals). */
export function searchFacilities(
  query: string | SearchFilters | undefined,
  filters?: SearchFilters,
  sort: SearchSort = 'relevance',
  options?: SearchOptions,
): Facility[] {
  const merged = mergeArgs(query, filters);
  const matched = filterFacilities(facilities, merged);
  return applySort(matched, sort, options?.ratingKind);
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export interface Paginated<T> {
  items: T[];
  total: number;
  totalPages: number;
}

/** Pure paginator; page is 1-based, minimum page size 1. Out-of-range → empty items. */
export function paginate<T>(items: readonly T[], page: number, pageSize: number): Paginated<T> {
  const total = items.length;
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const safePage = Math.min(Math.max(1, Math.floor(page)), totalPages);
  const start = (safePage - 1) * safePageSize;
  return {
    items: items.slice(start, start + safePageSize),
    total,
    totalPages,
  };
}

// ---------------------------------------------------------------------------
// Slug / id getters — return undefined when missing (09 contract)
// ---------------------------------------------------------------------------

export function getHospitalBySlug(slug: string): Hospital | undefined {
  return hospitals.find((h) => h.slug === slug);
}

export function getDoctorBySlug(slug: string): Doctor | undefined {
  return doctors.find((d) => d.slug === slug);
}

export function getFacilityBySlug(slug: string): Facility | undefined {
  return facilities.find((f) => f.slug === slug);
}

export function getTreatmentBySlug(slug: string): Treatment | undefined {
  return treatmentBySlug[slug];
}

export function getSpecialtyBySlug(slug: string): Specialty | undefined {
  return specialtyBySlug[slug];
}

export function getHospitalById(id: string): Hospital | undefined {
  return hospitalById[id];
}

export function getDoctorById(id: string): Doctor | undefined {
  return doctorById[id];
}

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

/**
 * Doctors associated with a hospital. Only returns doctors present in fixture
 * data whose own `hospitalIds` include the hospital (two-way consistent).
 */
export function getRelatedDoctors(hospitalId: string): Doctor[] {
  const hospital = hospitalById[hospitalId];
  if (!hospital) return [];
  return hospital.doctorIds
    .map((id) => doctorById[id])
    .filter((d): d is Doctor => d !== undefined && d.hospitalIds.includes(hospitalId));
}

/** Treatments for one specialty, preserving fixture order. */
export function getTreatmentsForSpecialty(specialtyId: string): Treatment[] {
  return treatments.filter((t) => t.specialtyId === specialtyId);
}

/** Treatment lookup by id, for id-based fixture references. */
export function getTreatmentById(id: string): Treatment | undefined {
  return treatmentById[id];
}
