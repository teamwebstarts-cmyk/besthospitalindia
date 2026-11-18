import type { Metadata } from "next"

import { PortalPageHeader } from "@/features/doctor-portal/components/portal-page-header"
import { DoctorAppointmentsFeed } from "@/features/appointments/appointment-feeds"
import { appointments, doctors } from "@/data"
import { getSessionDoctor } from "@/features/doctor-portal/session"

export const metadata: Metadata = {
  title: "Appointments",
  description: "Review appointment requests made directly to your doctor profile. Actions are demo-only and do not notify patients.",
}

export default function DoctorAppointmentsPage() {
  const doctor = getSessionDoctor()
  const fallbackDoctorId = doctor?.id ?? doctors[0]?.id ?? ""
  const providerOptions = doctors.map((item) => ({ id: item.id, name: item.name }))

  return (
    <div className="space-y-6 py-8">
      <PortalPageHeader
        items={[{ label: "Doctor Portal", href: "/doctor-portal" }, { label: "Appointments" }]}
        title="Appointment requests"
        description="Requests submitted for the selected doctor profile appear here. Accept, reject or reschedule them in this browser-only demo."
      />
      <DoctorAppointmentsFeed
        fallbackDoctorId={fallbackDoctorId}
        providerOptions={providerOptions}
        initialRequests={appointments}
      />
    </div>
  )
}
