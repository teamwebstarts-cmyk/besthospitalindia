import type { Metadata } from "next"

import { facilities } from "@/data"
import { AdminPageHeader } from "@/features/admin"
import { FacilityReviewManager } from "@/features/admin/components/facility-review-manager"

/**
 * /admin/facilities — Facility Management (pages/24).
 *
 * Server Component: passes the frozen facility fixtures (all six contract
 * categories) to the client island. No rating columns — Facility carries no
 * RatingSummary in the frozen contract.
 */

export const metadata: Metadata = {
  title: "Facility Management",
  description:
    "Admin facility management (demo): search and review diagnostic, specialty, rehabilitation and wellness facility records with local mock actions. Fictional fixture data only.",
}

export default function AdminFacilitiesPage() {
  return (
    <div className="space-y-6 py-6">
      <AdminPageHeader
        compact
        items={[
          { label: "Admin Portal", href: "/admin" },
          { label: "Facilities" },
        ]}
        title="Facilities"
      />

      <FacilityReviewManager facilities={facilities} />
    </div>
  )
}
