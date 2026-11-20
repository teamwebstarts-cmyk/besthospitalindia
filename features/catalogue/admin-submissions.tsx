"use client"

import { useMemo, useState } from "react"

import { AdminFormSheet } from "@/features/admin/components/admin-form-sheet"
import { FacilityListingCard } from "@/features/content/facility-listing/facility-listing-card"
import { DoctorCard } from "@/features/providers/components/doctor-card"
import { HospitalCard } from "@/features/providers/components/hospital-card"
import {
  mapSubmissionToDoctor,
  mapSubmissionToFacility,
  mapSubmissionToHospital,
} from "@/lib/catalogue/map-submission-entity"
import type { CatalogueKind, CatalogueStatus } from "@/lib/catalogue/store"
import type { CatalogueProfileFields } from "@/lib/catalogue/submissions"

import { AdminListingTabs, type AdminListingTab } from "./admin-listing-tabs"
import { adminCatalogueGridClass, AdminCatalogueCardFrame } from "./admin-catalogue-card-frame"
import {
  AdminListingForm,
  initialListingForm,
  listingFormToPayload,
  rowToListingForm,
  type ListingFormState,
} from "./admin-listing-form"

export interface SubmissionRow extends CatalogueProfileFields {
  id: string
  kind: CatalogueKind
  name: string
  email: string
  phone: string
  city: string
  note: string
  status: CatalogueStatus
  source?: "admin" | "partner" | "seed"
}

interface AdminSubmissionsProps {
  kind?: CatalogueKind
  initialRows: SubmissionRow[]
  emailCodes?: Record<string, string>
  fixedKind?: boolean
  linkableDoctorNames?: string[]
}

export function AdminSubmissions({
  kind = "hospital",
  initialRows,
  emailCodes = {},
  fixedKind = true,
  linkableDoctorNames: linkableDoctorNamesProp = [],
}: AdminSubmissionsProps) {
  const [rows, setRows] = useState(initialRows)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<ListingFormState>(() => initialListingForm(kind))
  const [createOpen, setCreateOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editForms, setEditForms] = useState<Record<string, ListingFormState>>({})
  const [listingTab, setListingTab] = useState<AdminListingTab>("all")

  const listingCounts = useMemo(
    () => ({
      all: rows.length,
      pending: rows.filter((row) => row.status === "pending").length,
      approved: rows.filter((row) => row.status === "approved").length,
      rejected: rows.filter((row) => row.status === "rejected").length,
    }),
    [rows],
  )

  const visibleRows = useMemo(() => {
    if (listingTab === "all") return rows
    return rows.filter((row) => row.status === listingTab)
  }, [listingTab, rows])

  const linkableDoctorNames = useMemo(() => {
    const fromRows = rows.filter((row) => row.kind === "doctor" && row.status === "approved").map((row) => row.name)
    return [...new Set([...linkableDoctorNamesProp, ...fromRows])]
  }, [linkableDoctorNamesProp, rows])

  function setField<K extends keyof ListingFormState>(key: K, value: ListingFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const editingRow = editId ? rows.find((row) => row.id === editId) : undefined
  const editForm = editingRow ? editForms[editingRow.id] ?? rowToListingForm(editingRow, kind) : null

  function setEditField<K extends keyof ListingFormState>(key: K, value: ListingFormState[K]) {
    if (!editingRow) return
    setEditForms((current) => ({
      ...current,
      [editingRow.id]: { ...(current[editingRow.id] ?? rowToListingForm(editingRow, kind)), [key]: value },
    }))
  }

  async function createListing() {
    if (!form.name.trim() || !form.email.trim() || !form.city.trim()) {
      setError("Add name, city and official email in Basic.")
      return
    }
    setError(null)
    const response = await fetch("/api/catalogue/submissions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(listingFormToPayload(form)),
    })
    const payload = (await response.json().catch(() => null)) as {
      error?: string
      submission?: SubmissionRow
    } | null
    if (!response.ok || !payload?.submission) {
      setError(payload?.error ?? "Could not add the listing.")
      return
    }
    setRows((current) => [payload.submission as SubmissionRow, ...current])
    setForm(initialListingForm(form.kind))
    setCreateOpen(false)
  }

  async function saveRow(row: SubmissionRow) {
    if (!editForm) return
    setError(null)
    const response = await fetch("/api/catalogue/submissions", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: row.id, status: row.status, ...listingFormToPayload(editForm) }),
    })
    const payload = (await response.json().catch(() => null)) as { error?: string; submission?: SubmissionRow } | null
    if (!response.ok) {
      setError(payload?.error ?? "Could not update the listing.")
      return
    }
    if (payload?.submission) {
      setRows((current) => current.map((item) => (item.id === row.id ? payload.submission! : item)))
    }
    setEditId(null)
  }

  async function removeRow(id: string) {
    setError(null)
    const response = await fetch("/api/catalogue/submissions", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    })
    if (!response.ok) {
      setError("Could not remove the listing.")
      return
    }
    setRows((current) => current.filter((row) => row.id !== id))
    if (editId === id) setEditId(null)
  }

  const noun = kind === "doctor" ? "doctor" : kind === "facility" ? "facility" : "hospital"
  const addLabel = kind === "doctor" ? "Add doctor" : kind === "facility" ? "Add facility" : "Add hospital"

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold tracking-tight text-foreground">Your listings</h2>
        <AdminFormSheet
          title={`New ${noun}`}
          triggerLabel={addLabel}
          open={createOpen}
          onOpenChange={setCreateOpen}
          className="flex w-full flex-col gap-0 p-0 sm:max-w-2xl"
        >
          <AdminListingForm
            form={form}
            set={setField}
            linkableDoctorNames={linkableDoctorNames}
            showKindPicker={!fixedKind}
            onKindChange={(nextKind) => setForm(initialListingForm(nextKind))}
            submitLabel={`Publish ${noun}`}
            onSubmit={() => void createListing()}
          />
        </AdminFormSheet>
      </div>

      <AdminListingTabs value={listingTab} onChange={setListingTab} counts={listingCounts} />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">None yet.</p>
      ) : visibleRows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No listings in this tab. Try &quot;All&quot; or another status.</p>
      ) : null}

      <ul className={adminCatalogueGridClass}>
        {visibleRows.map((row) => (
          <AdminCatalogueCardFrame
            key={row.id}
            name={row.name}
            status={row.status}
            onStatusChange={(status) => {
              setRows((current) => current.map((item) => (item.id === row.id ? { ...item, status } : item)))
              void fetch("/api/catalogue/submissions", {
                method: "PATCH",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ id: row.id, status }),
              })
            }}
            openLabel={`Open ${row.name} details`}
            onOpen={() => setEditId(row.id)}
            onEdit={() => setEditId(row.id)}
            onDelete={() => removeRow(row.id)}
          >
            {row.kind === "hospital" ? (
                <HospitalCard
                  hospital={mapSubmissionToHospital(row)}
                  layout="stacked"
                  showCta={false}
                  disableProfileLink
                  compact
                />
              ) : row.kind === "doctor" ? (
                <DoctorCard doctor={mapSubmissionToDoctor(row)} showCta={false} disableProfileLink />
              ) : (
                <FacilityListingCard facility={mapSubmissionToFacility(row)} showCta={false} disableProfileLink compact />
            )}
          </AdminCatalogueCardFrame>
        ))}
      </ul>

      {editingRow && editForm ? (
        <AdminFormSheet
          title={`${editingRow.name}`}
          description="Basic first, then optional advanced fields."
          hideTrigger
          open={editId !== null}
          onOpenChange={(open) => {
            if (!open) setEditId(null)
          }}
          className="flex w-full flex-col gap-0 p-0 sm:max-w-2xl"
        >
          <AdminListingForm
            form={editForm}
            set={setEditField}
            linkableDoctorNames={linkableDoctorNames}
            submitLabel={`Save ${noun}`}
            onSubmit={() => void saveRow(editingRow)}
          />
        </AdminFormSheet>
      ) : null}
    </section>
  )
}