import type { Metadata } from "next"

import { HospitalAppointmentsFeed } from "@/features/appointments/appointment-feeds"
import { PortalPageHeader } from "@/features/hospital-portal/portal-page-header"
import { demoAppointments, getDemoHospital } from "@/features/hospital-portal/demo-context"

export const metadata: Metadata = {
  title: "Appointments",
  description: "Review appointment requests made directly to your hospital profile. Demo-only local actions.",
}

interface HospitalPortalAppointmentsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function HospitalPortalAppointmentsPage({ searchParams }: HospitalPortalAppointmentsPageProps) {
  const params = await searchParams
  const rawRequest = params.request
  const initialRequestKey = typeof rawRequest === "string" ? rawRequest : undefined
  const hospital = getDemoHospital()

  return (
    <div className="space-y-8">
      <PortalPageHeader
        label="Appointments"
        description="Requests addressed directly to this hospital appear here. Doctor-specific bookings go to the selected doctor's portal instead."
      />
      <HospitalAppointmentsFeed
        hospitalId={hospital.id}
        initialRequests={demoAppointments()}
        hospitalName={hospital.name}
        initialRequestKey={initialRequestKey}
      />
    </div>
  )
}
