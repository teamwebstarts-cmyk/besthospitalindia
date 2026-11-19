import type { Metadata } from "next"

import { hospitals } from "@/data"
import { AdminPageHeader } from "@/features/admin"
import { AdminCatalogue } from "@/features/catalogue/admin-catalogue"
import { AdminSubmissions } from "@/features/catalogue/admin-submissions"
import { hasAdminSession } from "@/lib/admin/session"
import { catalogueSnapshot } from "@/lib/catalogue/store"
import { listSubmissions } from "@/lib/catalogue/submissions"
import { listOutbox } from "@/lib/mail/outbox"

export const metadata: Metadata = {
  title: "Hospitals",
  description: "Publish or hide hospital profiles. Patient queries are not sent to hospitals.",
}

export const dynamic = "force-dynamic"

export default async function AdminHospitalsPage() {
  if (!(await hasAdminSession())) return null
  const snapshot = catalogueSnapshot()
  const emailCodes = Object.fromEntries((await listOutbox()).map((message) => [message.leadId, message.code]))
  const rows = hospitals.map((hospital) => ({
    id: hospital.id,
    name: hospital.name,
    place: `${hospital.city}, ${hospital.state}`,
    status: snapshot.hospital[hospital.id] ?? "approved" as const,
  }))

  return (
    <div className="space-y-6 py-6">
      <AdminPageHeader
        compact
        items={[{ label: "Admin Portal", href: "/admin" }, { label: "Hospitals" }]}
        title="Hospitals"
        description="Approved hospitals appear in the public catalogue. Pending and rejected hospitals do not."
      />
      <AdminSubmissions
        kind="hospital"
        emailCodes={emailCodes}
        initialRows={listSubmissions("hospital").map((row) => ({ ...row }))}
      />
      <AdminCatalogue kind="hospital" initialRows={rows} />
    </div>
  )
}
