import type { Metadata } from "next"

import { PortalPageHeader } from "@/features/doctor-portal/components/portal-page-header"
import { HospitalAssociationsClient } from "@/features/doctor-portal/components/hospital-associations-client"
import { getSessionDoctor } from "@/features/doctor-portal/session"
import { getHospitalById } from "@/lib/search"

export const metadata: Metadata = {
  title: "Hospital Associations",
  description:
    "View demo hospital associations and send mock association requests. Demo state only — nothing is sent to any hospital.",
}

/**
 * /doctor-portal/hospitals — Hospital Associations (pages/59).
 *
 * Server Component shell resolves the demo doctor's current associations via
 * the shared two-way-consistent fixture maps (Doctor.hospitalIds → Hospital),
 * then hands off to the client island that owns search + mock request state.
 * Acceptance: "New association marked pending review" — the pending badge is
 * local state only and never mutates A01 fixtures.
 */
export default function DoctorHospitalsPage() {
  const doctor = getSessionDoctor()
  const associated = (doctor?.hospitalIds ?? [])
    .map((id) => getHospitalById(id))
    .filter((hospital) => hospital !== undefined)

  return (
    <div className="space-y-6 py-8">
      <PortalPageHeader
        items={[
          { label: "Doctor Portal", href: "/doctor-portal" },
          { label: "Hospitals" },
        ]}
        title="Hospital associations"
        description="Review the hospitals your demo profile is associated with, and practice sending a mock association request to another demo hospital."
      />

      {doctor ? (
        <HospitalAssociationsClient associated={associated} />
      ) : (
        <p role="alert" className="rounded-lg border px-4 py-3 text-sm text-muted-foreground">
          Demo profile fixture could not be resolved. The portal session identity is missing
          from the demo data.
        </p>
      )}
    </div>
  )
}
