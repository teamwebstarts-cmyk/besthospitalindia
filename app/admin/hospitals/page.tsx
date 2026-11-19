import type { Metadata } from "next"

import { hospitals } from "@/data"
import { AdminPageHeader } from "@/features/admin"
import { AdminCatalogue } from "@/features/catalogue/admin-catalogue"
import { AdminSubmissions } from "@/features/catalogue/admin-submissions"
import { catalogueSnapshot } from "@/lib/catalogue/store"
import { listSubmissions } from "@/lib/catalogue/submissions"

export const metadata: Metadata = {
  title: "Hospitals",
  description: "Publish or hide hospital profiles. Patient queries are not sent to hospitals.",
}

export const dynamic = "force-dynamic"

export default function AdminHospitalsPage() {
  const snapshot = catalogueSnapshot()
  const rows = hospitals.map((hospital) => ({
    id: hospital.id,
    name: hospital.name,
    place: `${hospital.city}, ${hospital.state}`,
    status: snapshot.hospital[hospital.id] ?? "approved" as const,
  }))

  return (
    <div className="space-y-6 py-6">
      <AdminPageHeader
        compact
        items={[{ label: "Admin Portal", href: "/admin" }, { label: "Hospitals" }]}
        title="Hospitals"
        description="Approved hospitals appear in the public catalogue. Pending and rejected hospitals do not."
      />
      <AdminSubmissions
        initialRows={listSubmissions("hospital").map((row) => ({
          id: row.id,
          name: row.name,
          email: row.email,
          city: row.city,
          status: row.status,
        }))}
      />
      <AdminCatalogue kind="hospital" initialRows={rows} />
    </div>
  )
}
