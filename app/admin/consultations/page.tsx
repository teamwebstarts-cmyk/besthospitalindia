import type { Metadata } from "next"

import { AdminCasePageHeader } from "@/features/admin/cases/admin-case-page-header"
import { AdminConsultationManager } from "@/features/admin/cases/admin-consultation-manager"
import { patientEnquiries } from "@/data"

/**
 * /admin/consultations — Consultation Management (pages/25 §B; A12-owned).
 *
 * Admin side of the IUF-supported Free Consultation initiative. Server
 * Component: passes the frozen enquiry fixture set to the client manager.
 *
 * INTEGRATION DEPENDENCY (Agent A11): the admin segment layout
 * (`app/admin/layout.tsx` — PortalShell + frozen `adminNavGroups`) is owned
 * by A11 and intentionally not created here. Until it lands, this page
 * renders under the root layout without the admin sidebar.
 */

export const metadata: Metadata = {
  title: "Consultations",
  description:
    "Admin consultation queue for the IUF-supported free consultation initiative: review, assign and close demo enquiry cases (fictional data).",
  robots: { index: false, follow: false },
}

export default function AdminConsultationsPage() {
  return (
    <div className="space-y-8">
      <AdminCasePageHeader
        label="Consultations"
        description="Patient enquiries from the IUF-supported free consultation initiative and general enquiry forms. Review, validate, assign a provider and close cases — every action stays inside this demo."
      />
      <AdminConsultationManager enquiries={patientEnquiries} />
    </div>
  )
}
