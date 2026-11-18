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
    <div className="space-y-8 py-8">
      <AdminPageHeader
        items={[
          { label: "Admin Portal", href: "/admin" },
          { label: "Doctors" },
        ]}
        title="Doctor management"
        description="Review doctor profiles, qualifications, registration checks and verification states. Profile verification and registration checks are separate records — nothing is verified automatically. All actions are local demo state."
      />

      <DoctorReviewManager doctors={doctors} />
    </div>
  )
}
