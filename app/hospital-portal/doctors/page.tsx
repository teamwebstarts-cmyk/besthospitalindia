import type { Metadata } from "next"
import { DoctorAssociationManager } from "@/features/hospital-portal/doctor-association-manager"
import { PortalPageHeader } from "@/features/hospital-portal/portal-page-header"
import {
  DEMO_HOSPITAL_ID,
  demoAssociatedDoctors,
} from "@/features/hospital-portal/demo-context"
import { doctors } from "@/data"

/**
 * /hospital-portal/doctors — doctor management (pages/49).
 *
 * Server Component: resolves associated doctors via the shared relation
 * selector (two-way consistent with Doctor.hospitalIds) and passes the full
 * fixture pool for directory search.
 */

export const metadata: Metadata = {
  title: "Doctors",
  description:
    "Manage doctors associated with the demo hospital: search the demo directory and request or remove local associations (fictional demo data).",
}

export default function HospitalPortalDoctorsPage() {
  const associated = demoAssociatedDoctors()

  return (
    <div className="space-y-8">
      <PortalPageHeader
        label="Doctors"
        description="Manage the doctors associated with your facility. Associations changes made here stay in the demo session and are pending admin review."
      />

      <DoctorAssociationManager
        hospitalId={DEMO_HOSPITAL_ID}
        associatedDoctors={associated}
        allDoctors={doctors}
      />
    </div>
  )
}
