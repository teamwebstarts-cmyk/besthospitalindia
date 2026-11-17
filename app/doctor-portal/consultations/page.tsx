import type { Metadata } from "next"

import { PortalPageHeader } from "@/features/doctor-portal/components/portal-page-header"
import { ConsultationsClient } from "@/features/doctor-portal/components/consultations-client"
import { consultationQueueForDoctor } from "@/features/doctor-portal/selectors"
import { getSessionDoctor } from "@/features/doctor-portal/session"

export const metadata: Metadata = {
  title: "Consultations",
  description:
    "Review consultation cases assigned to the demo doctor profile and record next-step response statuses. Demo state only — no patient contact.",
}

/**
 * /doctor-portal/consultations — Consultation Requests (pages/62).
 *
 * Server Component resolves the doctor-directed enquiry queue (pure selector);
 * the client island owns case cards + the detail drawer with response status
 * updates. Acceptance: report contents are never rendered — the drawer shows
 * file labels with an explicit "Access not granted" badge because no fixture
 * models doctor-side report permission.
 */
export default function DoctorConsultationsPage() {
  const doctor = getSessionDoctor()
  const enquiries = doctor ? consultationQueueForDoctor(doctor.id) : []

  return (
    <div className="space-y-6 py-8">
      <PortalPageHeader
        items={[
          { label: "Doctor Portal", href: "/doctor-portal" },
          { label: "Consultations" },
        ]}
        title="Consultation requests"
        description="Enquiries the demo coordination desk has assigned to your profile. Open a case to review the request and record a next-step status — responses stay in local demo state."
      />

      <ConsultationsClient enquiries={enquiries} />
    </div>
  )
}
