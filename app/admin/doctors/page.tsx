import type { Metadata } from "next"

import { doctors } from "@/data"
import { AdminKindPage } from "@/features/catalogue/admin-kind-page"
import type { AdminCatalogueItem } from "@/features/catalogue/admin-catalogue"
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
  const catalogueItems: AdminCatalogueItem[] = doctors.map((doctor) => ({
    kind: "doctor",
    id: doctor.id,
    doctor,
    status: snapshot.doctor[doctor.id] ?? "approved",
  }))

  return (
    <AdminKindPage
      title="Doctors"
      kind="doctor"
      emailCodes={emailCodes}
      initialRows={listSubmissions("doctor").map((row) => ({ ...row }))}
      catalogueItems={catalogueItems}
    />
  )
}