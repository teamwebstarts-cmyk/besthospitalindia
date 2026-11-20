"use client"

import { useState } from "react"

import { FacilityListingCard } from "@/features/content/facility-listing/facility-listing-card"
import { DoctorCard } from "@/features/providers/components/doctor-card"
import { HospitalCard } from "@/features/providers/components/hospital-card"
import type { CatalogueKind, CatalogueStatus } from "@/lib/catalogue/store"
import type { Doctor, Facility, Hospital } from "@/types"

import { adminCatalogueGridClass, AdminCatalogueCardFrame } from "./admin-catalogue-card-frame"
import { AdminFixturePreview } from "./admin-fixture-preview"

export type AdminCatalogueItem =
  | { kind: "hospital"; id: string; status: CatalogueStatus; hospital: Hospital }
  | { kind: "doctor"; id: string; status: CatalogueStatus; doctor: Doctor }
  | { kind: "facility"; id: string; status: CatalogueStatus; facility: Facility }

export function AdminCatalogue({
  kind,
  initialItems,
}: {
  kind: CatalogueKind
  initialItems: AdminCatalogueItem[]
}) {
  const [items, setItems] = useState(initialItems)
  const [error, setError] = useState<string | null>(null)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const previewItem = previewId ? items.find((item) => item.id === previewId) ?? null : null

  async function setStatus(id: string, status: CatalogueStatus) {
    setError(null)
    const response = await fetch("/api/catalogue", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind, id, status }),
    })
    if (!response.ok) {
      setError("Could not update publication.")
      return
    }
    setItems((current) => current.map((row) => (row.id === id ? { ...row, status } : row)))
  }

  const title =
    kind === "doctor" ? "Directory doctors" : kind === "facility" ? "Directory facilities" : "Directory hospitals"

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <ul className={adminCatalogueGridClass}>
        {items.map((item) => {
          const name =
            item.kind === "hospital"
              ? item.hospital.name
              : item.kind === "doctor"
                ? item.doctor.name
                : item.facility.name
          return (
            <AdminCatalogueCardFrame
              key={item.id}
              name={name}
              status={item.status}
              onStatusChange={(status) => void setStatus(item.id, status)}
              openLabel={`Preview ${name}`}
              onOpen={() => setPreviewId(item.id)}
              onEdit={() => setPreviewId(item.id)}
              onDelete={() => undefined}
            >
              {item.kind === "hospital" ? (
                <HospitalCard hospital={item.hospital} layout="stacked" showCta={false} disableProfileLink compact />
              ) : item.kind === "doctor" ? (
                <DoctorCard doctor={item.doctor} showCta={false} disableProfileLink />
              ) : (
                <FacilityListingCard facility={item.facility} showCta={false} disableProfileLink compact />
              )}
            </AdminCatalogueCardFrame>
          )
        })}
      </ul>
      <AdminFixturePreview
        item={previewItem}
        open={previewId !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewId(null)
        }}
        onStatusChange={(status) => {
          if (!previewItem) return
          void setStatus(previewItem.id, status)
        }}
      />
    </div>
  )
}