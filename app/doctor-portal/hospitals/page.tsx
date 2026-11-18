import type { Metadata } from "next"

import { PortalPageHeader } from "@/features/doctor-portal/components/portal-page-header"
import { HospitalAssociationsClient } from "@/features/doctor-portal/components/hospital-associations-client"
import { getSessionDoctor } from "@/features/doctor-portal/session"
import { doctorById, hospitalById } from "@/data"

export const metadata: Metadata = {
  title: "Hospital Associations",
  description: "View selected demo doctor hospital associations and send mock association requests.",
}

interface DoctorHospitalsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DoctorHospitalsPage({ searchParams }: DoctorHospitalsPageProps) {
  const params = await searchParams
  const doctorId = typeof params.doctorId === "string" ? params.doctorId : undefined
  const doctor = (doctorId ? doctorById[doctorId] : undefined) ?? getSessionDoctor()
  const associated = (doctor?.hospitalIds ?? [])
    .map((id) => hospitalById[id])
    .filter((hospital) => hospital !== undefined)

  return (
    <div className="space-y-6 py-8">
      <PortalPageHeader
        items={[{ label: "Doctor Portal", href: "/doctor-portal" }, { label: "Hospitals" }]}
        title="Hospital associations"
        description={doctor ? `Review the hospitals associated with ${doctor.name}, and practice sending a mock association request.` : "Review demo hospital associations."}
      />
      {doctor ? (
        <HospitalAssociationsClient associated={associated} />
      ) : (
        <p role="alert" className="rounded-lg border px-4 py-3 text-sm text-muted-foreground">
          Demo profile fixture could not be resolved.
        </p>
      )}
    </div>
  )
}
