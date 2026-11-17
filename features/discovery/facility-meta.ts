/**
 * Facility presentation metadata — A03 (feature-local, not a shared contract).
 *
 * Display labels for the six FacilityCategory values (types/provider.ts).
 * Both listing and detail routes import from here so category copy stays
 * consistent. If a shared home for this map is agreed, it can graduate to
 * @/constants by the owner.
 */

import type { FacilityCategory } from "@/types"

export const FACILITY_CATEGORY_LABELS: Record<FacilityCategory, string> = {
  hospital: "Hospital",
  specialty_centre: "Specialty centre",
  diagnostic_lab: "Diagnostic lab",
  rehabilitation: "Rehabilitation",
  wellness: "Wellness",
  medical_tourism: "Medical tourism",
}
