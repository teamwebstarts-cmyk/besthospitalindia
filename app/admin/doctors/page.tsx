import type { Metadata } from "next"

import { doctors } from "@/data"
import { AdminPageHeader } from "@/features/admin"
import { AdminCatalogue } from "@/features/catalogue/admin-catalogue"
import { AdminSubmissions } from "@/features/catalogue/admin-submissions"
import { hasAdminSession } from "@/lib/admin/session"
import { catalogueSnapshot } from "@/lib/catalogue/store"
import { listSubmissions } from "@/lib/catalogue/submissions"
import { listOutbox } from "@/lib/mail/outbox"

export const metadata: Metadata = {
  title: "Doctors",
  description: "Publish or hide doctor profiles. Patient queries are not sent to doctors.",
}

export const dynamic = "force-dynamic"

export default async function AdminDoctorsPage() {
  if (!(await hasAdminSession())) return null
  const snapshot = catalogueSnapshot()
  const emailCodes = Object.fromEntries((await listOutbox()).map((message) => [message.leadId, message.code]))
  const rows = doctors.map((doctor) => ({
    id: doctor.id,
    name: doctor.name,
    place: `${doctor.city}, ${doctor.state}`,
    status: snapshot.doctor[doctor.id] ?? "approved" as const,
  }))

  return (
    <div className="space-y-6 py-6">
      <AdminPageHeader
        compact
        items={[{ label: "Admin Portal", href: "/admin" }, { label: "Doctors" }]}
        title="Doctors"
        description="Approved doctors appear in the public catalogue. Pending and rejected doctors do not."
      />
      <AdminSubmissions
        kind="doctor"
        emailCodes={emailCodes}
        initialRows={listSubmissions("doctor").map((row) => ({ ...row }))}
      />
      <AdminCatalogue kind="doctor" initialRows={rows} />
    </div>
  )
}
