import type { Metadata } from "next"

import { facilities } from "@/data"
import { AdminKindPage } from "@/features/catalogue/admin-kind-page"
import type { AdminCatalogueItem } from "@/features/catalogue/admin-catalogue"
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
  const catalogueItems: AdminCatalogueItem[] = facilities.map((facility) => ({
    kind: "facility",
    id: facility.id,
    facility,
    status: snapshot.facility[facility.id] ?? "approved",
  }))

  return (
    <AdminKindPage
      title="Facilities"
      kind="facility"
      initialRows={listSubmissions("facility").map((row) => ({ ...row }))}
      catalogueItems={catalogueItems}
    />
  )
}