import type { Metadata } from "next"

import { AdminKindPage } from "@/features/catalogue/admin-kind-page"
import { hasAdminSession } from "@/lib/admin/session"
import { listSubmissions } from "@/lib/catalogue/submissions"
import { listOutbox } from "@/lib/mail/outbox"

export const metadata: Metadata = {
  title: "Doctors",
  description: "Publish or hide doctor profiles. Patient queries are not sent to doctors.",
}

export const dynamic = "force-dynamic"

export default async function AdminDoctorsPage() {
  if (!(await hasAdminSession())) return null
  const emailCodes = Object.fromEntries((await listOutbox()).map((message) => [message.leadId, message.code]))

  return (
    <AdminKindPage
      title="Doctors"
      kind="doctor"
      emailCodes={emailCodes}
      initialRows={(await listSubmissions("doctor")).map((row) => ({ ...row }))}
    />
  )
}