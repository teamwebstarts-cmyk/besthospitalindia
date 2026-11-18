import type { Metadata } from "next"

import { doctors } from "@/data"
import { AdminPageHeader } from "@/features/admin"
import { DoctorReviewManager } from "@/features/admin/components/doctor-review-manager"

/**
 * /admin/doctors — Doctor Management (pages/24).
 *
 * Server Component: passes the frozen doctor fixtures to the client island.
 * Credential review states, registration checks and profile verification are
 * presented as separate concepts; nothing is auto-verified.
 */

export const metadata: Metadata = {
  title: "Doctor Management",
  description:
    "Admin doctor management (demo): search, review qualifications, registration checks and verification states with local mock actions. Fictional fixture data only.",
}

export default function AdminDoctorsPage() {
  return (
    <div className="space-y-6 py-6">
      <AdminPageHeader
        compact
        items={[
          { label: "Admin Portal", href: "/admin" },
          { label: "Doctors" },
        ]}
        title="Doctors"
      />

      <DoctorReviewManager doctors={doctors} />
    </div>
  )
}
