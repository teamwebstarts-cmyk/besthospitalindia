/**
 * Provider label lookups for A12 admin queues (hospitals + doctors).
 *
 * Small local helpers so review/rating managers can render provider names
 * without importing `lib/search.ts` (which pulls the whole fixture graph) —
 * and without a new shared export (A01 owns `data/`; gaps are reported, not
 * patched by page agents). Hospital and doctor ids are globally unique across
 * the frozen fixtures (prefixed `hosp-` / `doc-`), so the id prefix selects
 * the lookup table safely.
 */

import { doctorById, hospitalById } from "@/data"

export function providerName(providerType: "hospital" | "doctor", providerId: string): string {
  if (providerType === "hospital") {
    return hospitalById[providerId]?.name ?? providerId
  }
  return doctorById[providerId]?.name ?? providerId
}

/** Demo profile link for a provider, when one exists on the public site. */
export function providerProfileHref(
  providerType: "hospital" | "doctor",
  providerId: string,
): string | null {
  const record =
    providerType === "hospital" ? hospitalById[providerId] : doctorById[providerId]
  if (!record) return null
  return providerType === "hospital"
    ? `/hospitals/${record.slug}`
    : `/doctors/${record.slug}`
}
