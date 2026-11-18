import type { Metadata } from "next"

import { AdminCasePageHeader } from "@/features/admin/cases/admin-case-page-header"
import { AdminRatingMethodologyManager } from "@/features/admin/cases/admin-rating-methodology-manager"
import { ratingAssessments } from "@/data"

/**
 * /admin/rating-methodology — Rating Methodology (pages/25 §F; A12-owned).
 *
 * Server Component: passes the frozen assessment fixtures; the version
 * register is derived from their recorded methodologyVersion metadata (no
 * dedicated methodology fixture exists in A01 — gap logged in the report).
 *
 * INTEGRATION DEPENDENCY (Agent A11): the admin segment layout
 * (`app/admin/layout.tsx` — PortalShell + frozen `adminNavGroups`) is owned
 * by A11 and intentionally not created here. Until it lands, this page
 * renders under the root layout without the admin sidebar.
 */

export const metadata: Metadata = {
  title: "Rating Methodology",
  description:
    "Admin rating methodology: separate PER, hospital CER and doctor MER criteria, weightages, evidence requirements and version governance (demo data).",
  robots: { index: false, follow: false },
}

export default function AdminRatingMethodologyPage() {
  return (
    <div className="space-y-6 py-6">
      <AdminCasePageHeader compact label="Rating methodology" />
      <AdminRatingMethodologyManager assessments={ratingAssessments} />
    </div>
  )
}
