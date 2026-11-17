import type { Metadata } from "next"

import { DocumentChecklistManager } from "@/features/hospital-portal/document-checklist-manager"
import { PortalPageHeader } from "@/features/hospital-portal/portal-page-header"
import { getDemoHospital } from "@/features/hospital-portal/demo-context"

/**
 * /hospital-portal/documents — verification documents (pages/53).
 *
 * Server Component: passes the demo hospital + the shared demo "today" so
 * expiry windows are deterministic between server and client renders.
 */

export const metadata: Metadata = {
  title: "Documents",
  description:
    "View the demo hospital's accreditation and legal document checklist with verification statuses and expiry dates. Uploads are simulated metadata only (fictional demo data).",
}

/** Deterministic demo date — must match the dashboard constant. */
const DEMO_TODAY = "2026-11-17"

export default function HospitalPortalDocumentsPage() {
  const hospital = getDemoHospital()

  return (
    <div className="space-y-8">
      <PortalPageHeader
        label="Documents"
        description="Track accreditation and legal documents with their verification status and expiry. Adding a document records metadata only — nothing is uploaded, and only admin review can verify."
      />

      <DocumentChecklistManager hospital={hospital} todayISO={DEMO_TODAY} />
    </div>
  )
}
