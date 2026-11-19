import type { Metadata } from "next"

import { AdminPageHeader } from "@/features/admin"
import { AdminLeads } from "@/features/leads/admin-leads"
import { listLeads } from "@/lib/leads/store"

export const metadata: Metadata = {
  title: "Leads",
  description: "Patient queries for admin and the city vendor. Hospitals and doctors do not receive these.",
}

export const dynamic = "force-dynamic"

export default async function AdminLeadsPage() {
  const leads = await listLeads()
  return (
    <div className="space-y-6 py-6">
      <AdminPageHeader
        compact
        items={[{ label: "Admin Portal", href: "/admin" }, { label: "Leads" }]}
        title="Queries"
        description="Every query is stored here. Delhi goes to the Delhi vendor and Indore to the Indore vendor. Nothing is sent to a hospital or a doctor."
      />
      <AdminLeads initialLeads={leads} />
    </div>
  )
}
