/**
 * Pure selectors for treatment discovery — Agent A06.
 *
 * Mirrors the lib/search contract style (pure, deterministic, no mutation) but
 * operates on the treatment/specialty taxonomy, which lib/search does not cover.
 * lib/search stays untouched per task ownership; these helpers only consume the
 * frozen @/data fixtures. Sorting keeps fixture order unless name sorting is
 * requested; ties always break by id for determinism.
 */

import { doctors, hospitals, specialties, treatments } from "@/data"
import type { Specialty, Treatment } from "@/types"

/** Sort options for treatment listings. */
export type TreatmentSort = "relevance" | "name-asc" | "name-desc"

export interface TreatmentQuery {
  /** Free-text query over treatment name/description + specialty name. */
  query?: string
  /** Exact specialty id; "all" or empty means no constraint. */
  specialtyId?: string
  sort?: TreatmentSort
}

/** Split a query into lowercase tokens; empty query → no constraints. */
function queryTokens(query: string | undefined): string[] {
  return (query ?? "")
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length > 0)
}

/** Every token must appear in at least one field (AND across tokens). */
function matchesQuery(
  tokens: readonly string[],
  fields: readonly (string | undefined)[]
): boolean {
  return tokens.every((token) =>
    fields.some((field) => (field ?? "").toLowerCase().includes(token))
  )
}

/**
 * Hospitals offering a treatment, preserving fixture order.
 * Reads the frozen hospital fixtures; returns hospital ids for counts/links.
 */
export function hospitalIdsForTreatment(treatmentId: string): string[] {
  return hospitals
    .filter((hospital) => hospital.treatments.includes(treatmentId))
    .map((hospital) => hospital.id)
}

/**
 * Doctors listing a treatment, preserving fixture order (ids only).
 * Uses each doctor's own `treatments` list; falls back to doctors linked to
 * hospitals offering the treatment only when the doctor list is empty for
 * every related hospital (keeps counts consistent with fixture relations).
 */
export function doctorIdsForTreatment(treatmentId: string): string[] {
  const direct = doctors
    .filter((doctor) => doctor.treatments.includes(treatmentId))
    .map((doctor) => doctor.id)
  if (direct.length > 0) return direct
  return hospitals
    .filter((hospital) => hospital.treatments.includes(treatmentId))
    .flatMap((hospital) => hospital.doctorIds)
    .filter((doctorId, index, all) => all.indexOf(doctorId) === index)
}

/**
 * Filter + sort treatments. Pure: no fixture mutation, stable id tie-breaks.
 * Unmatched specialtyId (unknown id) yields an empty result, mirroring the
 * lib/search "unknown filter value matches nothing" behavior.
 */
export function selectTreatments(query: TreatmentQuery = {}): Treatment[] {
  const { query: text, specialtyId, sort = "relevance" } = query
  const tokens = queryTokens(text)
  const specialtyById = new Map(specialties.map((s) => [s.id, s] as const))

  const matched = treatments.filter((treatment) => {
    if (specialtyId && specialtyId !== "all" && treatment.specialtyId !== specialtyId) {
      return false
    }
    if (
      !matchesQuery(tokens, [
        treatment.name,
        treatment.description,
        specialtyById.get(treatment.specialtyId)?.name,
      ])
    ) {
      return false
    }
    return true
  })

  if (sort === "name-asc" || sort === "name-desc") {
    const dir = sort === "name-asc" ? 1 : -1
    return matched
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name) * dir || a.id.localeCompare(b.id))
  }

  // relevance: fixture order
  return matched
}

/** Specialty for a treatment id (typed lookup over frozen fixtures). */
export function specialtyForTreatment(treatment: Treatment): Specialty | undefined {
  return specialties.find((s) => s.id === treatment.specialtyId)
}
