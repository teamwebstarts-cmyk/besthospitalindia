import type { Metadata } from "next"

import { AdminPageHeader } from "@/features/admin"
import { AdminLeads } from "@/features/leads/admin-leads"
import { hasAdminSession } from "@/lib/admin/session"
import { listLeads } from "@/lib/leads/store"
import { listOutbox } from "@/lib/mail/outbox"

export const metadata: Metadata = {
  title: "Leads",
  description: "Patient queries for admin and the city vendor. Hospitals and doctors do not receive these.",
}

export const dynamic = "force-dynamic"

export default async function AdminLeadsPage() {
  if (!(await hasAdminSession())) return null
  const [leads, outbox] = await Promise.all([listLeads(), listOutbox()])
  const emailCodes = Object.fromEntries(outbox.map((message) => [message.leadId, message.code]))
  return (
    <div className="space-y-6 py-6">
      <AdminPageHeader compact title="Queries" showDemoNote={false} />
      <AdminLeads initialLeads={leads} emailCodes={emailCodes} />
    </div>
  )
}
