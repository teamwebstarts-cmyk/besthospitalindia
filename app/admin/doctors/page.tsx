import type { Metadata } from "next"

import { doctors } from "@/data"
import { AdminPageHeader } from "@/features/admin"
import { AdminCatalogue } from "@/features/catalogue/admin-catalogue"
import { AdminSubmissions } from "@/features/catalogue/admin-submissions"
import { catalogueSnapshot } from "@/lib/catalogue/store"
import { listSubmissions } from "@/lib/catalogue/submissions"

export const metadata: Metadata = {
  title: "Doctors",
  description: "Publish or hide doctor profiles. Patient queries are not sent to doctors.",
}

export const dynamic = "force-dynamic"

export default function AdminDoctorsPage() {
  const snapshot = catalogueSnapshot()
  const rows = doctors.map((doctor) => ({
    id: doctor.id,
    name: doctor.name,
    place: `${doctor.city}, ${doctor.state}`,
    status: snapshot.doctor[doctor.id] ?? "approved" as const,
  }))

  return (
    <div className="space-y-6 py-6">
      <AdminPageHeader
        compact
        items={[{ label: "Admin Portal", href: "/admin" }, { label: "Doctors" }]}
        title="Doctors"
        description="Approved doctors appear in the public catalogue. Pending and rejected doctors do not."
      />
      <AdminSubmissions
        initialRows={listSubmissions("doctor").map((row) => ({
          id: row.id,
          name: row.name,
          email: row.email,
          city: row.city,
          status: row.status,
        }))}
      />
      <AdminCatalogue kind="doctor" initialRows={rows} />
    </div>
  )
}
