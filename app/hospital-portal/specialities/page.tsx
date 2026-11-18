import type { Metadata } from "next"

import { SpecialtyOfferingsManager } from "@/features/hospital-portal/specialty-offerings-manager"
import { PortalPageHeader } from "@/features/hospital-portal/portal-page-header"
import { getDemoHospital } from "@/features/hospital-portal/demo-context"
import { hospitalById } from "@/data"

export const metadata: Metadata = {
  title: "Specialties",
  description: "Manage the selected demo hospital's specialty and treatment offerings.",
}

interface HospitalPortalSpecialitiesPageProps {
  searchParams: Promise<{ hospitalId?: string }>
}

export default async function HospitalPortalSpecialitiesPage({ searchParams }: HospitalPortalSpecialitiesPageProps) {
  const params = await searchParams
  const hospital = (params.hospitalId ? hospitalById[params.hospitalId] : undefined) ?? getDemoHospital()

  return (
    <div className="space-y-8">
      <PortalPageHeader
        label="Specialties"
        description={`Select the specialties and treatments ${hospital.name} offers. Choices come from the platform's fixed taxonomy.`}
      />
      <SpecialtyOfferingsManager
        initialSpecialtyIds={hospital.specialties}
        initialTreatmentIds={hospital.treatments}
      />
    </div>
  )
}
