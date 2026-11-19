import type { Metadata } from "next"

import { facilities } from "@/data"
import { AdminPageHeader } from "@/features/admin"
import { AdminCatalogue } from "@/features/catalogue/admin-catalogue"
import { AdminSubmissions } from "@/features/catalogue/admin-submissions"
import { hasAdminSession } from "@/lib/admin/session"
import { catalogueSnapshot } from "@/lib/catalogue/store"
import { listSubmissions } from "@/lib/catalogue/submissions"

export const metadata: Metadata = {
  title: "Facilities",
  description: "Add and publish facility listings on the public site.",
}

export const dynamic = "force-dynamic"

export default async function AdminFacilitiesPage() {
  if (!(await hasAdminSession())) return null
  const snapshot = catalogueSnapshot()
  const rows = facilities.map((facility) => ({
    id: facility.id,
    name: facility.name,
    place: `${facility.city}, ${facility.state}`,
    status: snapshot.facility[facility.id] ?? "approved" as const,
  }))

  return (
    <div className="space-y-6 py-6">
      <AdminPageHeader
        compact
        items={[{ label: "Admin Portal", href: "/admin" }, { label: "Facilities" }]}
        title="Facilities"
        description="Approved facilities stay on the public site. Pending and rejected facilities stay off it."
      />
      <AdminSubmissions
        kind="facility"
        initialRows={listSubmissions("facility").map((row) => ({ ...row }))}
      />
      <AdminCatalogue kind="facility" initialRows={rows} />
    </div>
  )
}
