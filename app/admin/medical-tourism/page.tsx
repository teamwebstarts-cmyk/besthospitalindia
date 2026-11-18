import type { Metadata } from "next"

import { AdminCasePageHeader } from "@/features/admin/cases/admin-case-page-header"
import { AdminTourismCaseManager } from "@/features/admin/cases/admin-tourism-case-manager"
import { tourismCases } from "@/data"

/**
 * /admin/medical-tourism — Medical Tourism Case Management (pages/25 §C; A12).
 *
 * Server Component: passes the frozen medical-tourism case fixtures to the
 * client manager.
 *
 * INTEGRATION DEPENDENCY (Agent A11): the admin segment layout
 * (`app/admin/layout.tsx` — PortalShell + frozen `adminNavGroups`) is owned
 * by A11 and intentionally not created here. Until it lands, this page
 * renders under the root layout without the admin sidebar.
 */

export const metadata: Metadata = {
  title: "Medical Tourism",
  description:
    "Admin medical tourism pipeline: assign demo coordinators, update case stages and follow-ups for international patient cases (fictional data).",
  robots: { index: false, follow: false },
}

export default function AdminMedicalTourismPage() {
  return (
    <div className="space-y-8">
      <AdminCasePageHeader
        label="Medical Tourism"
        description="International patient cases from enquiry through treatment and follow-up. Assign demo coordinators, move cases along the documented pipeline and record follow-ups — no travel, visa or treatment arrangement exists behind this demo."
      />
      <AdminTourismCaseManager cases={tourismCases} />
    </div>
  )
}
