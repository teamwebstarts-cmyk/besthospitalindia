import type { Metadata } from "next"

import { AdminCasePageHeader } from "@/features/admin/cases/admin-case-page-header"
import { AdminAppointmentManager } from "@/features/admin/cases/admin-appointment-manager"
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
    "Admin appointment queue: review requests, update scheduling status and cancel (fictional demo data, no booking).",
  robots: { index: false, follow: false },
}

export default function AdminAppointmentsPage() {
  return (
    <div className="space-y-8">
      <AdminCasePageHeader
        label="Appointments"
        description="Appointment requests across the platform. Update scheduling status or cancel a request — every action is a local demo edit and no patient or provider is contacted."
      />
      <AdminAppointmentManager requests={appointments} />
    </div>
  )
}
