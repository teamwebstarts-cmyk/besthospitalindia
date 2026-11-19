import type { Metadata } from "next"

import { facilities } from "@/data"
import { AdminPageHeader } from "@/features/admin"
import { AdminCatalogue } from "@/features/catalogue/admin-catalogue"
import { catalogueSnapshot } from "@/lib/catalogue/store"

export const metadata: Metadata = {
  title: "Facilities",
  description: "Publish or hide facility profiles.",
}

export const dynamic = "force-dynamic"

export default function AdminFacilitiesPage() {
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
      <AdminCatalogue kind="facility" initialRows={rows} />
    </div>
  )
}
