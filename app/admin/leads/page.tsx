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
      <AdminPageHeader
        compact
        items={[{ label: "Admin Portal", href: "/admin" }, { label: "Leads" }]}
        title="Queries"
        description="Every query is stored here. Delhi goes to the Delhi vendor and Indore to the Indore vendor. Nothing is sent to a hospital or a doctor."
      />
      <AdminLeads initialLeads={leads} emailCodes={emailCodes} />
    </div>
  )
}
