"use client"

import { AdminPageHeader } from "@/features/admin"

import { AdminCatalogue, type AdminCatalogueItem } from "./admin-catalogue"
import { AdminSubmissions, type SubmissionRow } from "./admin-submissions"
import type { CatalogueKind } from "@/lib/catalogue/store"

export interface AdminKindPageProps {
  title: string
  kind: CatalogueKind
  initialRows: SubmissionRow[]
  catalogueItems?: AdminCatalogueItem[]
  emailCodes?: Record<string, string>
  /** Legacy fixture directory — hidden by default; admin listings are the source of truth. */
  showFixtureDirectory?: boolean
  /** Approved doctor names for hospital "link existing" picker. */
  linkableDoctorNames?: string[]
}

/**
 * One layout for Hospitals / Doctors / Facilities admin routes:
 * header → admin-added listings → directory fixtures.
 */
export function AdminKindPage({
  title,
  kind,
  initialRows,
  catalogueItems = [],
  emailCodes,
  linkableDoctorNames,
  showFixtureDirectory = false,
}: AdminKindPageProps) {
  return (
    <div className="space-y-8 py-6">
      <AdminPageHeader compact title={title} showDemoNote={false} />
      <AdminSubmissions
        kind={kind}
        initialRows={initialRows}
        emailCodes={emailCodes}
        linkableDoctorNames={linkableDoctorNames}
      />
      {showFixtureDirectory && catalogueItems.length > 0 ? (
        <AdminCatalogue kind={kind} initialItems={catalogueItems} />
      ) : null}
    </div>
  )
}