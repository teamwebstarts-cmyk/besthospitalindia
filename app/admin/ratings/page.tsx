import type { Metadata } from "next"

import { AdminCasePageHeader } from "@/features/admin/cases/admin-case-page-header"
import { AdminRatingAssessmentManager } from "@/features/admin/cases/admin-rating-assessment-manager"
import { ratingAssessments } from "@/data"

/**
 * /admin/ratings — Rating Management (pages/25 §E; A12-owned).
 *
 * Rating governance queue. Server Component: passes the frozen assessment
 * fixtures to the client manager. PER/CER/MER remain independent throughout;
 * a `null` score is never rendered as 0/5.
 *
 * INTEGRATION DEPENDENCY (Agent A11): the admin segment layout
 * (`app/admin/layout.tsx` — PortalShell + frozen `adminNavGroups`) is owned
 * by A11 and intentionally not created here. Until it lands, this page
 * renders under the root layout without the admin sidebar.
 */

export const metadata: Metadata = {
  title: "Ratings",
  description:
    "Admin rating governance queue: review evidence, approve and publish independent PER / CER / MER assessments (fictional demo data).",
  robots: { index: false, follow: false },
}

export default function AdminRatingsPage() {
  return (
    <div className="space-y-8">
      <AdminCasePageHeader
        label="Ratings"
        description="Rating governance for hospitals (PER + CER) and doctors (PER + MER). Patient-experience ratings stay separate from independently assessed clinical expertise; nothing is combined into one score."
      />
      <AdminRatingAssessmentManager assessments={ratingAssessments} />
    </div>
  )
}
