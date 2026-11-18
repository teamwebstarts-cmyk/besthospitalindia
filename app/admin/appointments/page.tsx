import type { Metadata } from "next"

import { AdminCasePageHeader } from "@/features/admin/cases/admin-case-page-header"
import { AdminAppointmentsFeed } from "@/features/appointments/appointment-feeds"
import { appointments } from "@/data"

/**
 * /admin/appointments — Appointment Management (pages/25 §A; A12-owned).
 *
 * Server Component: passes the full frozen appointment fixture set to the
 * client manager. searchParams are NOT read here for data (mock phase).
 *
 * INTEGRATION DEPENDENCY (Agent A11): the admin segment layout
 * (`app/admin/layout.tsx` — PortalShell + frozen `adminNavGroups`) is owned
 * by A11 and intentionally not created here. Until it lands, this page
 * renders under the root layout without the admin sidebar.
 */

export const metadata: Metadata = {
  title: "Appointments",
  description:
    "Admin appointment queue: review appointment requests across all hospitals and doctors. Demo data only.",
  robots: { index: false, follow: false },
}

export default function AdminAppointmentsPage() {
  return (
    <div className="space-y-6 py-6">
      <AdminCasePageHeader compact label="Appointments" />
      <AdminAppointmentsFeed initialRequests={appointments} />
    </div>
  )
}
