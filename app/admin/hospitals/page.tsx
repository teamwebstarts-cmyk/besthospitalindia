import type { Metadata } from "next"

import { hospitals } from "@/data"
import { AdminPageHeader } from "@/features/admin"
import { HospitalReviewManager } from "@/features/admin/components/hospital-review-manager"

/**
 * /admin/hospitals — Hospital Management (pages/24).
 *
 * Server Component: passes the frozen hospital fixtures to the client island.
 * The manager derives every count and state from the same fixture array the
 * dashboard KPI renders, keeping totals reconciled.
 */

export const metadata: Metadata = {
  title: "Hospital Management",
  description:
    "Admin hospital management (demo): search, filter and review hospital verification states with local mock approve / reject / suspend actions. Fictional fixture data only.",
}

export default function AdminHospitalsPage() {
  return (
    <div className="space-y-6 py-6">
      <AdminPageHeader
        compact
        items={[
          { label: "Admin Portal", href: "/admin" },
          { label: "Hospitals" },
        ]}
        title="Hospitals"
      />

      <HospitalReviewManager hospitals={hospitals} />
    </div>
  )
}
