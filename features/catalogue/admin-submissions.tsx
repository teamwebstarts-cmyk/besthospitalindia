"use client"

import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { specialties } from "@/data/specialties"
import { treatments } from "@/data/treatments"
import { FACILITY_CATEGORY_LABELS } from "@/features/discovery/facility-meta"
import type { CatalogueKind, CatalogueStatus } from "@/lib/catalogue/store"
import type { CatalogueProfileFields } from "@/lib/catalogue/submissions"
import type { FacilityCategory } from "@/types"

const STATUSES: CatalogueStatus[] = ["pending", "approved", "rejected"]
const KINDS: CatalogueKind[] = ["hospital", "doctor", "facility"]

/** Fields mirrored from the public card / detail views. */
export interface SubmissionRow extends CatalogueProfileFields {
  id: string
  kind: CatalogueKind
  name: string
  email: string
  phone: string
  city: string
  note: string
  status: CatalogueStatus
}

interface AdminSubmissionsProps {
  kind?: CatalogueKind
  initialRows: SubmissionRow[]
  emailCodes?: Record<string, string>
  /** When false, the admin can add any of hospital / doctor / facility. */
  fixedKind?: boolean
}

function csv(value: string): string[] {
  return value.split(/[,\n]/).map((v) => v.trim()).filter(Boolean)
}

function initialForm(kind: CatalogueKind) {
  return {
    kind,
    name: "",
    email: "admin@besthospitalindian.com",
    phone: "",
    city: "",
    state: "",
    country: "India",
    overview: "",
    imageUrl: "",
    facilityType: "Hospital",
    specialties: [] as string[],
    treatments: [] as string[],
    accreditations: "",
    specialization: "",
    qualifications: "",
    yearsExperience: "",
    languages: "",
    category: "hospital" as FacilityCategory,
    services: "",
  }
}

type FormState = ReturnType<typeof initialForm>

function ToggleChips({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string
  options: readonly { id: string; name: string }[]
  selected: string[]
  onToggle: (id: string) => void
}) {
  return (
    <fieldset className="space-y-1.5">
      <legend className="text-xs font-medium text-muted-foreground">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = selected.includes(option.id)
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onToggle(option.id)}
              aria-pressed={active}
              className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40"
              }`}
            >
              {option.name}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

/** Shared editable field grid for both new listings and existing rows. */
function ProfileFields({
  form,
  set,
}: {
  form: FormState
  set: <K extends keyof FormState>(key: K, value: FormState[K]) => void
}) {
  const toggle = (key: "specialties" | "treatments", id: string) => {
    const current = form[key]
    set(key, current.includes(id) ? current.filter((v) => v !== id) : [...current, id] as FormState[typeof key])
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="space-y-1 text-xs">
        <span className="font-medium">Official email</span>
        <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
      </label>
      <label className="space-y-1 text-xs">
        <span className="font-medium">Phone (public contact)</span>
        <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Optional" />
      </label>
      <label className="space-y-1 text-xs">
        <span className="font-medium">State</span>
        <Input value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="Optional" />
      </label>
      <label className="space-y-1 text-xs">
        <span className="font-medium">Country</span>
        <Input value={form.country} onChange={(e) => set("country", e.target.value)} />
      </label>
      <label className="space-y-1 text-xs sm:col-span-2">
        <span className="font-medium">Overview / about</span>
        <textarea
          className="min-h-16 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs"
          value={form.overview}
          onChange={(e) => set("overview", e.target.value)}
          placeholder="Shown on the public detail page"
        />
      </label>
      <label className="space-y-1 text-xs sm:col-span-2">
        <span className="font-medium">Cover image URL</span>
        <Input value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://… (optional)" />
      </label>

      {form.kind === "hospital" ? (
        <>
          <label className="space-y-1 text-xs">
            <span className="font-medium">Facility type</span>
            <Input value={form.facilityType} onChange={(e) => set("facilityType", e.target.value)} />
          </label>
          <label className="space-y-1 text-xs">
            <span className="font-medium">Accreditations (comma separated)</span>
            <Input value={form.accreditations} onChange={(e) => set("accreditations", e.target.value)} placeholder="Optional" />
          </label>
        </>
      ) : null}

      {form.kind === "doctor" ? (
        <>
          <label className="space-y-1 text-xs">
            <span className="font-medium">Specialization</span>
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-xs"
              value={form.specialization}
              onChange={(e) => set("specialization", e.target.value)}
            >
              <option value="">Not listed</option>
              {specialties.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-xs">
            <span className="font-medium">Years of experience</span>
            <Input type="number" min={0} max={80} value={form.yearsExperience} onChange={(e) => set("yearsExperience", e.target.value)} />
          </label>
          <label className="space-y-1 text-xs">
            <span className="font-medium">Qualifications (comma separated)</span>
            <Input value={form.qualifications} onChange={(e) => set("qualifications", e.target.value)} placeholder="MBBS, MD …" />
          </label>
          <label className="space-y-1 text-xs">
            <span className="font-medium">Languages (comma separated)</span>
            <Input value={form.languages} onChange={(e) => set("languages", e.target.value)} placeholder="English, Hindi …" />
          </label>
        </>
      ) : null}

      {form.kind === "facility" ? (
        <label className="space-y-1 text-xs">
          <span className="font-medium">Category</span>
          <select
            className="h-9 w-full rounded-md border border-input bg-background px-2 text-xs"
            value={form.category}
            onChange={(e) => set("category", e.target.value as FacilityCategory)}
          >
            {(Object.keys(FACILITY_CATEGORY_LABELS) as FacilityCategory[]).map((c) => (
              <option key={c} value={c}>{FACILITY_CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </label>
      ) : null}

      {form.kind !== "doctor" ? (
        <ToggleChips
          label="Specialties (shown as tags)"
          options={specialties}
          selected={form.specialties}
          onToggle={(id) => toggle("specialties", id)}
        />
      ) : null}

      {form.kind === "hospital" ? (
        <ToggleChips
          label="Treatments (shown on detail page)"
          options={treatments}
          selected={form.treatments}
          onToggle={(id) => toggle("treatments", id)}
        />
      ) : null}

      {form.kind === "facility" ? (
        <label className="space-y-1 text-xs">
          <span className="font-medium">Services (comma separated)</span>
          <Input value={form.services} onChange={(e) => set("services", e.target.value)} placeholder="Emergency, Pharmacy …" />
        </label>
      ) : null}
    </div>
  )
}

function toPayload(form: FormState) {
  return {
    kind: form.kind,
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    city: form.city.trim(),
    state: form.state.trim(),
    country: form.country.trim(),
    overview: form.overview.trim(),
    imageUrl: form.imageUrl.trim(),
    facilityType: form.facilityType.trim(),
    specialties: form.specialties,
    treatments: form.treatments,
    accreditations: csv(form.accreditations),
    specialization: form.specialization,
    qualifications: csv(form.qualifications),
    yearsExperience: form.yearsExperience === "" ? null : Number(form.yearsExperience),
    languages: csv(form.languages),
    category: form.category,
    services: csv(form.services),
    note: form.overview.trim() || "Added by admin.",
  }
}

export function AdminSubmissions({
  kind,
  initialRows,
  emailCodes = {},
  fixedKind = true,
}: AdminSubmissionsProps) {
  const [rows, setRows] = useState(initialRows)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(() => initialForm(kind ?? "hospital"))
  const [expanded, setExpanded] = useState<string | null>(null)
  const [editForms, setEditForms] = useState<Record<string, FormState>>({})

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function rowToForm(row: SubmissionRow): FormState {
    return {
      ...initialForm(row.kind ?? kind ?? "hospital"),
      ...row,
      accreditations: (row.accreditations ?? []).join(", "),
      qualifications: (row.qualifications ?? []).join(", "),
      languages: (row.languages ?? []).join(", "),
      services: (row.services ?? []).join(", "),
      yearsExperience: row.yearsExperience === null || row.yearsExperience === undefined ? "" : String(row.yearsExperience),
      specialization: row.specialization ?? "",
      facilityType: row.facilityType ?? "Hospital",
      category: (row.category as FacilityCategory) ?? "hospital",
      overview: row.overview ?? row.note ?? "",
    }
  }

  async function createListing(event: FormEvent) {
    event.preventDefault()
    setError(null)
    const response = await fetch("/api/catalogue/submissions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(toPayload(form)),
    })
    const payload = (await response.json().catch(() => null)) as {
      error?: string
      submission?: SubmissionRow
    } | null
    if (!response.ok || !payload?.submission) {
      setError(payload?.error ?? "Could not add the listing.")
      return
    }
    const approved = await fetch("/api/catalogue/submissions", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: payload.submission.id, status: "approved", ...toPayload(form) }),
    })
    if (!approved.ok) {
      setError("The listing was saved, but it is not public yet.")
      setRows((current) => [payload.submission as SubmissionRow, ...current])
      return
    }
    const payloadRow = (await approved.json().catch(() => null)) as { submission?: SubmissionRow } | null
    setRows((current) => [(payloadRow?.submission ?? { ...payload.submission, status: "approved" }) as SubmissionRow, ...current])
    setForm(initialForm(form.kind))
  }

  async function saveRow(row: SubmissionRow) {
    setError(null)
    const edit = editForms[row.id] ?? rowToForm(row)
    const response = await fetch("/api/catalogue/submissions", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: row.id, status: row.status, ...toPayload(edit) }),
    })
    const payload = (await response.json().catch(() => null)) as { error?: string; submission?: SubmissionRow } | null
    if (!response.ok) {
      setError(payload?.error ?? "Could not update the listing.")
      return
    }
    if (payload?.submission) {
      setRows((current) => current.map((item) => item.id === row.id ? payload.submission! : item))
    }
    setExpanded(null)
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
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-foreground">Listings</h2>
      <p className="text-sm text-muted-foreground">
        Add a hospital, doctor or facility with the details shown on its public card and detail page.
        Approved listings appear on the public site. Ratings are never entered here - they stay
        independent and show as &ldquo;Not yet rated&rdquo; until assessed.
      </p>
      <form onSubmit={createListing} className="space-y-3 rounded-lg border border-border/70 bg-card p-3">
        {!fixedKind ? (
          <label className="space-y-1 text-xs">
            <span className="font-medium">Listing type</span>
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-xs sm:w-56"
              value={form.kind}
              onChange={(e) => set("kind", e.target.value as CatalogueKind)}
            >
              {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </label>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr] sm:items-end">
          <label className="space-y-1 text-xs">
            <span className="font-medium">Name</span>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} required minLength={2} />
          </label>
          <label className="space-y-1 text-xs">
            <span className="font-medium">City</span>
            <Input value={form.city} onChange={(e) => set("city", e.target.value)} required minLength={2} />
          </label>
          <Button type="submit" className="w-full sm:w-auto">Add listing</Button>
        </div>
        <details className="group">
          <summary className="cursor-pointer list-none text-xs font-medium text-primary">
            More details (optional) <span className="text-muted-foreground">- overview, location, image, specialties…</span>
          </summary>
          <div className="pt-3">
            <ProfileFields form={form} set={set} />
          </div>
        </details>
      </form>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <ul className="space-y-2">
        {rows.map((row) => {
          const edit = editForms[row.id] ?? rowToForm(row)
          const setEdit = <K extends keyof FormState>(key: K, value: FormState[K]) =>
            setEditForms((current) => ({ ...current, [row.id]: { ...(current[row.id] ?? rowToForm(row)), [key]: value } }))
          return (
            <li key={row.id}>
              <Card>
                <CardContent className="space-y-3 p-3">
                  <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto_auto] sm:items-center">
                    <Input
                      aria-label={`Name for ${row.id}`}
                      value={edit.name}
                      onChange={(e) => setEdit("name", e.target.value)}
                    />
                    <Input
                      aria-label={`City for ${row.id}`}
                      value={edit.city}
                      onChange={(e) => setEdit("city", e.target.value)}
                    />
                    <select
                      className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                      value={row.status}
                      aria-label={`Status for ${row.name}`}
                      onChange={(e) => {
                        const status = e.target.value as CatalogueStatus
                        setRows((current) => current.map((item) => item.id === row.id ? { ...item, status } : item))
                        void fetch("/api/catalogue/submissions", {
                          method: "PATCH",
                          headers: { "content-type": "application/json" },
                          body: JSON.stringify({ id: row.id, status }),
                        })
                      }}
                    >
                      {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                    <Button type="button" variant="outline" onClick={() => saveRow(row)}>Save</Button>
                    <div className="flex gap-2">
                      <Button type="button" variant="ghost" onClick={() => setExpanded(expanded === row.id ? null : row.id)}>
                        {expanded === row.id ? "Less" : "Details"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => removeRow(row.id)}>Remove</Button>
                    </div>
                  </div>
                  {expanded === row.id ? <ProfileFields form={edit} set={setEdit} /> : null}
                  <p className="text-xs text-muted-foreground">
                    {row.kind} · {row.email} · {row.id}
                    {emailCodes[row.id] ? ` · code ${emailCodes[row.id]} · from info@wispr.hospital` : ""}
                  </p>
                </CardContent>
              </Card>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
