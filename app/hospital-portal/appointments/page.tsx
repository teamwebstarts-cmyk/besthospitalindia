import type { Metadata } from "next"

import { AppointmentQueueManager } from "@/features/hospital-portal/appointment-queue-manager"
import { PortalPageHeader } from "@/features/hospital-portal/portal-page-header"
import { demoAppointments, getDemoHospital } from "@/features/hospital-portal/demo-context"

/**
 * /hospital-portal/appointments — appointment requests (pages/50).
 *
 * Server Component: passes the scoped fixture queue to the client manager.
 * searchParams are NOT read here for data (mock phase) — the manager handles
 * the optional deep link below the server boundary.
 */

export const metadata: Metadata = {
  title: "Appointments",
  description:
    "Review demo appointment requests and update local response status: accept, reject or reschedule (fictional demo data, no booking).",
}

interface HospitalPortalAppointmentsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function HospitalPortalAppointmentsPage({
  searchParams,
}: HospitalPortalAppointmentsPageProps) {
  const params = await searchParams
  const rawRequest = params.request
  const initialRequestKey = typeof rawRequest === "string" ? rawRequest : undefined

  const hospital = getDemoHospital()
  const requests = demoAppointments()

  return (
    <div className="space-y-8">
      <PortalPageHeader
        label="Appointments"
        description="Answer appointment requests for your facility and associated doctors. Accepting or rescheduling updates the demo record only — no calendar or patient notification exists in the mock phase."
      />

      <AppointmentQueueManager
        requests={requests}
        hospitalName={hospital.name}
        initialRequestKey={initialRequestKey}
      />
    </div>
  )
}
