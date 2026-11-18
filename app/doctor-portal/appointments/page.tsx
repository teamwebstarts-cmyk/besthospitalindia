import type { Metadata } from "next"

import { PortalPageHeader } from "@/features/doctor-portal/components/portal-page-header"
import { DoctorAppointmentsFeed } from "@/features/appointments/appointment-feeds"
import { appointmentsForDoctor } from "@/features/doctor-portal"
import { getSessionDoctor } from "@/features/doctor-portal/session"

export const metadata: Metadata = {
  title: "Appointments",
  description: "Review appointment requests made directly to your doctor profile. Actions are demo-only and do not notify patients.",
}

export default function DoctorAppointmentsPage() {
  const doctor = getSessionDoctor()
  const requests = doctor ? appointmentsForDoctor(doctor.id) : []

  return (
    <div className="space-y-6 py-8">
      <PortalPageHeader
        items={[{ label: "Doctor Portal", href: "/doctor-portal" }, { label: "Appointments" }]}
        title="Appointment requests"
        description="Requests submitted for your doctor profile appear here. Accept, reject or reschedule them in this browser-only demo."
      />
      <DoctorAppointmentsFeed doctorId={doctor?.id ?? ""} initialRequests={requests} />
    </div>
  )
}
