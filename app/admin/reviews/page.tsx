import type { Metadata } from "next"

import { AdminCasePageHeader } from "@/features/admin/cases/admin-case-page-header"
import { AdminReviewModerationManager } from "@/features/admin/cases/admin-review-moderation-manager"
import { reviews } from "@/data"

/**
 * /admin/reviews — Review Management (pages/25 §D; A12-owned).
 *
 * Server Component: passes the frozen review fixture set to the client
 * moderation manager.
 *
 * INTEGRATION DEPENDENCY (Agent A11): the admin segment layout
 * (`app/admin/layout.tsx` — PortalShell + frozen `adminNavGroups`) is owned
 * by A11 and intentionally not created here. Until it lands, this page
 * renders under the root layout without the admin sidebar.
 */

export const metadata: Metadata = {
  title: "Reviews",
  description:
    "Admin review moderation queue: approve, reject or flag demo patient reviews; authenticity shown exactly as fixtures declare (fictional data).",
  robots: { index: false, follow: false },
}

export default function AdminReviewsPage() {
  return (
    <div className="space-y-6 py-6">
      <AdminCasePageHeader compact label="Reviews" />
      <AdminReviewModerationManager reviews={reviews} />
    </div>
  )
}
