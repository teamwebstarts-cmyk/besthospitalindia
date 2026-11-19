import type { Metadata } from "next"

import { AdminPageHeader } from "@/features/admin"
import { AdminVendors } from "@/features/vendors/admin-vendors"
import { hasAdminSession } from "@/lib/admin/session"
import { listVendors } from "@/lib/vendors/store"

export const metadata: Metadata = {
  title: "Vendors",
  description: "City desks that receive patient queries. Hospitals and doctors do not.",
}

export const dynamic = "force-dynamic"

export default async function AdminVendorsPage() {
  if (!(await hasAdminSession())) return null
  const vendors = await listVendors()
  return (
    <div className="space-y-6 py-6">
      <AdminPageHeader
        compact
        items={[{ label: "Admin Portal", href: "/admin" }, { label: "Vendors" }]}
        title="City vendors"
        description="A vendor sees only the queries for their city. They cannot add hospitals or doctors, and they never see the other city’s list."
      />
      <AdminVendors initialVendors={vendors} />
    </div>
  )
}
