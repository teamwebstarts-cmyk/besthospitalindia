"use client"

import type { ReactNode } from "react"

import { specialtyById } from "@/data"
import { AdminFormSheet } from "@/features/admin/components/admin-form-sheet"
import { Badge } from "@/components/ui/badge"
import type { CatalogueStatus } from "@/lib/catalogue/store"
import type { Doctor, Facility, Hospital } from "@/types"

import { AdminCatalogueStatusBar } from "./admin-catalogue-status-bar"
import type { AdminCatalogueItem } from "./admin-catalogue"

export function AdminFixturePreview({
  item,
  open,
  onOpenChange,
  onStatusChange,
}: {
  item: AdminCatalogueItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChange: (status: CatalogueStatus) => void
}) {
  if (!item) return null

  const name =
    item.kind === "hospital" ? item.hospital.name : item.kind === "doctor" ? item.doctor.name : item.facility.name

  return (
    <AdminFormSheet
      title={name}
      description="Directory fixture — publication only. Add custom listings with + above."
      hideTrigger
      open={open}
      onOpenChange={onOpenChange}
      className="flex w-full flex-col gap-0 p-0 sm:max-w-xl"
    >
      <div className="space-y-4">
        {item.kind === "hospital" ? <HospitalPreview hospital={item.hospital} /> : null}
        {item.kind === "doctor" ? <DoctorPreview doctor={item.doctor} /> : null}
        {item.kind === "facility" ? <FacilityPreview facility={item.facility} /> : null}
        <AdminCatalogueStatusBar name={name} status={item.status} onStatusChange={onStatusChange} />
      </div>
    </AdminFormSheet>
  )
}

function PreviewBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-1.5">
      <h3 className="text-xs font-semibold text-foreground">{title}</h3>
      <div className="text-sm text-muted-foreground">{children}</div>
    </section>
  )
}

function HospitalPreview({ hospital }: { hospital: Hospital }) {
  const specialties = hospital.specialties.map((id) => specialtyById[id]?.name).filter(Boolean)
  return (
    <>
      <PreviewBlock title="Location">
        {hospital.city}, {hospital.state} · {hospital.facilityType}
      </PreviewBlock>
      <PreviewBlock title="Overview">{hospital.overview || "—"}</PreviewBlock>
      <PreviewBlock title="Specialties">
        {specialties.length > 0 ? (
          <ul className="flex flex-wrap gap-1">
            {specialties.map((tag) => (
              <li key={tag}>
                <Badge variant="outline">{tag}</Badge>
              </li>
            ))}
          </ul>
        ) : (
          "—"
        )}
      </PreviewBlock>
      <PreviewBlock title="Ratings">
        PER {hospital.ratings.per.score ?? "not rated"} · CER {hospital.ratings.cer.score ?? "not rated"}
      </PreviewBlock>
    </>
  )
}

function DoctorPreview({ doctor }: { doctor: Doctor }) {
  return (
    <>
      <PreviewBlock title="Location">
        {doctor.city}, {doctor.state} · {specialtyById[doctor.specialization]?.name ?? "Specialist"}
      </PreviewBlock>
      <PreviewBlock title="Qualifications">{doctor.qualifications.join(", ") || "—"}</PreviewBlock>
      <PreviewBlock title="Ratings">
        PER {doctor.ratings.per.score ?? "not rated"} · MER {doctor.ratings.mer.score ?? "not rated"}
      </PreviewBlock>
    </>
  )
}

function FacilityPreview({ facility }: { facility: Facility }) {
  const specialties = facility.specialties.map((id) => specialtyById[id]?.name).filter(Boolean)
  return (
    <>
      <PreviewBlock title="Location">
        {facility.city}, {facility.state} · {facility.category.replaceAll("_", " ")}
      </PreviewBlock>
      <PreviewBlock title="Services">{facility.services.join(", ") || "—"}</PreviewBlock>
      <PreviewBlock title="Specialties">
        {specialties.length > 0 ? specialties.join(", ") : "—"}
      </PreviewBlock>
    </>
  )
}