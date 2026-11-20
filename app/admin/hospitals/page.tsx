import type { Metadata } from "next"

import { AdminKindPage } from "@/features/catalogue/admin-kind-page"
import { hasAdminSession } from "@/lib/admin/session"
import { listSubmissions } from "@/lib/catalogue/submissions"
import { listOutbox } from "@/lib/mail/outbox"

export const metadata: Metadata = {
  title: "Hospitals",
  description: "Publish or hide hospital profiles. Patient queries are not sent to hospitals.",
}

export const dynamic = "force-dynamic"

export default async function AdminHospitalsPage() {
  if (!(await hasAdminSession())) return null
  const emailCodes = Object.fromEntries((await listOutbox()).map((message) => [message.leadId, message.code]))
  const linkableDoctorNames = (await listSubmissions("doctor"))
    .filter((row) => row.status === "approved")
    .map((row) => row.name)

  return (
    <AdminKindPage
      title="Hospitals"
      kind="hospital"
      emailCodes={emailCodes}
      linkableDoctorNames={linkableDoctorNames}
      initialRows={(await listSubmissions("hospital")).map((row) => ({ ...row }))}
    />
  )
}