import type { Metadata } from "next"

import { DoctorAssociationManager } from "@/features/hospital-portal/doctor-association-manager"
import { PortalPageHeader } from "@/features/hospital-portal/portal-page-header"
import { getDemoHospital } from "@/features/hospital-portal/demo-context"
import { doctors, hospitalById } from "@/data"
import { getRelatedDoctors } from "@/lib/search"

export const metadata: Metadata = {
  title: "Doctors",
  description: "Manage doctor associations for the selected demo hospital.",
}

interface HospitalPortalDoctorsPageProps {
  searchParams: Promise<{ hospitalId?: string }>
}

export default async function HospitalPortalDoctorsPage({ searchParams }: HospitalPortalDoctorsPageProps) {
  const params = await searchParams
  const hospital = (params.hospitalId ? hospitalById[params.hospitalId] : undefined) ?? getDemoHospital()
  const associated = getRelatedDoctors(hospital.id)

  return (
    <div className="space-y-8">
      <PortalPageHeader
        label="Doctors"
        description={`Manage the doctors associated with ${hospital.name}. Association changes remain local demo state and are pending admin review.`}
      />
      <DoctorAssociationManager
        hospitalId={hospital.id}
        associatedDoctors={associated}
        allDoctors={doctors}
      />
    </div>
  )
}
