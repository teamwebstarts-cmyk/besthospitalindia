import type { Metadata } from "next"

import { PortalPageHeader } from "@/features/doctor-portal/components/portal-page-header"
import { AppointmentsClient } from "@/features/doctor-portal/components/appointments-client"
import { appointmentsForDoctor } from "@/features/doctor-portal/selectors"
import { getSessionDoctor } from "@/features/doctor-portal/session"

export const metadata: Metadata = {
  title: "Appointments",
  description:
    "Review and act on demo appointment requests: accept, reject with a reason, or reschedule. Local demo state only — no patient is notified.",
}

/**
 * /doctor-portal/appointments — Doctor Appointments (pages/61).
 *
 * Server Component resolves the demo doctor's AppointmentRequest fixtures via
 * the pure selector; the client island owns the local action state machine
 * (accept / reject-with-reason / reschedule) and the status filter. Acceptance
 * "No actual patient notification" is enforced by the reducer — it never
 * leaves the page and the notice copy says so explicitly.
 */
export default function DoctorAppointmentsPage() {
  const doctor = getSessionDoctor()
  const requests = doctor ? appointmentsForDoctor(doctor.id) : []

  return (
    <div className="space-y-6 py-8">
      <PortalPageHeader
        items={[
          { label: "Doctor Portal", href: "/doctor-portal" },
          { label: "Appointments" },
        ]}
        title="Appointment requests"
        description="Patient requests routed to your demo profile. Accept, reschedule or reject with a recorded reason — all demo state, with no patient notification in this phase."
      />

      <AppointmentsClient requests={requests} />
    </div>
  )
}
