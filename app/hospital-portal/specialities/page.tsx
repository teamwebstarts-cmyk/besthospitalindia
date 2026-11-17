import type { Metadata } from "next"

import { SpecialtyOfferingsManager } from "@/features/hospital-portal/specialty-offerings-manager"
import { PortalPageHeader } from "@/features/hospital-portal/portal-page-header"
import { getDemoHospital } from "@/features/hospital-portal/demo-context"

/**
 * /hospital-portal/specialities — specialties & treatments management (pages/48).
 *
 * Server Component: resolves the demo hospital's offering lists from the
 * frozen fixtures and hands them to the client manager. Only taxonomy entries
 * can be selected (spec: "Only known taxonomy entries; no fabricated
 * treatment claims").
 */

export const metadata: Metadata = {
  title: "Specialities",
  description:
    "Manage the demo hospital's specialty and treatment offerings from the fixed demo taxonomy (fictional demo data).",
}

export default function HospitalPortalSpecialitiesPage() {
  const hospital = getDemoHospital()

  return (
    <div className="space-y-8">
      <PortalPageHeader
        label="Specialities"
        description="Select the specialties and treatments your facility offers. Choices come from the platform's fixed taxonomy — custom or unlisted entries cannot be added in the demo."
      />

      <SpecialtyOfferingsManager
        initialSpecialtyIds={hospital.specialties}
        initialTreatmentIds={hospital.treatments}
      />
    </div>
  )
}
