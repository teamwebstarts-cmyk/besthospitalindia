import type { Metadata } from "next"

import { patients } from "@/data"
import { AdminPageHeader } from "@/features/admin"
import { PatientRecordsManager } from "@/features/admin/components/patient-records-manager"

/**
 * /admin/patients — Patient Management (pages/24).
 *
 * Server Component: passes the frozen patient fixtures to the client island.
 * Privacy-conscious by construction: masked contact fields in the list,
 * record-level reveal only inside the drawer, and no medical content (the
 * demo Patient contract carries none).
 */

export const metadata: Metadata = {
  title: "Patient Management",
  description:
    "Admin patient records (demo): privacy-conscious lookup of demo patient accounts with enquiry and appointment references. Masked contact fields; no medical content. Fictional fixture data only.",
}

export default function AdminPatientsPage() {
  return (
    <div className="space-y-6 py-6">
      <AdminPageHeader
        compact
        items={[
          { label: "Admin Portal", href: "/admin" },
          { label: "Patients" },
        ]}
        title="Patients"
      />

      <PatientRecordsManager patients={patients} />
    </div>
  )
}
