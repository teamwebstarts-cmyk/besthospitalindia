import type { CatalogueSubmission } from "@/lib/catalogue/submissions"

const PARTNER_SCALAR_KEYS = ["name", "phone", "city", "note"] as const
const PARTNER_PROFILE_KEYS = ["overview", "state", "imageUrl"] as const

export function partnerPatchNeedsReapproval(
  existing: CatalogueSubmission,
  patch: Partial<CatalogueSubmission>,
): boolean {
  for (const key of PARTNER_SCALAR_KEYS) {
    const next = patch[key]
    if (next !== undefined && next !== existing[key]) return true
  }
  for (const key of PARTNER_PROFILE_KEYS) {
    const next = patch[key]
    if (next === undefined) continue
    const prev = existing[key] ?? ""
    if (next !== prev) return true
  }
  return false
}