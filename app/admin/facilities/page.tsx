import type { Metadata } from "next"

import { AdminKindPage } from "@/features/catalogue/admin-kind-page"
import { hasAdminSession } from "@/lib/admin/session"
import { listSubmissions } from "@/lib/catalogue/submissions"

export const metadata: Metadata = {
  title: "Facilities",
  description: "Add and publish facility listings on the public site.",
}

export const dynamic = "force-dynamic"

export default async function AdminFacilitiesPage() {
  if (!(await hasAdminSession())) return null
  return (
    <AdminKindPage
      title="Facilities"
      kind="facility"
      initialRows={(await listSubmissions("facility")).map((row) => ({ ...row }))}
    />
  )
}