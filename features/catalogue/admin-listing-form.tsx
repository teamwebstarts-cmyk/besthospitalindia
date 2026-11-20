"use client"

import type { CatalogueKind } from "@/lib/catalogue/store"
import type { FacilityCategory } from "@/types"
import { specialties } from "@/data/specialties"
import { FACILITY_CATEGORY_LABELS } from "@/features/discovery/facility-meta"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const MAX_PICKED_SPECIALTIES = 5
export const CURATED_SPECIALTIES = specialties.slice(0, 6)

const ACCESS = ["Wheelchair access", "Lift", "Parking", "Ground-floor reception"] as const
const fieldClass = "h-9 w-full rounded-md border border-input bg-background px-2 text-sm"

export type ListingFormState = {
  kind: CatalogueKind
  name: string
  email: string
  phone: string
  city: string
  state: string
  country: string
  overview: string
  imageUrl: string
  facilityType: string
  specialties: string[]
  treatments: string[]
  treatmentNamesText: string
  accreditations: string
  specialization: string
  qualifications: string
  yearsExperience: string
  languages: string
  category: FacilityCategory
  services: string
  perScore: string
  cerScore: string
  merScore: string
  doctorNamesText: string
  accessibility: string[]
}

export function initialListingForm(kind: CatalogueKind): ListingFormState {
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
    specialties: [],
    treatments: [],
    treatmentNamesText: "",
    accreditations: "",
    specialization: "",
    qualifications: "",
    yearsExperience: "",
    languages: "",
    category: "hospital",
    services: "",
    perScore: "",
    cerScore: "",
    merScore: "",
    doctorNamesText: "",
    accessibility: [],
  }
}

function linesFromText(value: string): string[] {
  return value
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function csv(value: string): string[] {
  return value.split(/[,\n]/).map((v) => v.trim()).filter(Boolean)
}

export function listingFormToPayload(form: ListingFormState) {
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
    treatmentNames: csv(form.treatmentNamesText),
    accreditations: csv(form.accreditations),
    specialization: form.specialization,
    qualifications: csv(form.qualifications),
    yearsExperience: form.yearsExperience === "" ? null : Number(form.yearsExperience),
    languages: csv(form.languages),
    category: form.category,
    services: csv(form.services),
    perScore: form.perScore === "" ? null : Number(form.perScore),
    cerScore: form.cerScore === "" ? null : Number(form.cerScore),
    merScore: form.merScore === "" ? null : Number(form.merScore),
    doctorNames: linesFromText(form.doctorNamesText),
    doctorIds: [] as string[],
    accessibility: form.accessibility,
    note: form.overview.trim() || "Added by admin.",
  }
}

export interface AdminListingFormProps {
  form: ListingFormState
  set: <K extends keyof ListingFormState>(key: K, value: ListingFormState[K]) => void
  linkableDoctorNames?: string[]
  showKindPicker?: boolean
  onKindChange?: (kind: CatalogueKind) => void
  submitLabel: string
  onSubmit: () => void
}

function toggleSpecialty(form: ListingFormState, id: string, set: AdminListingFormProps["set"]) {
  const current = form.specialties
  if (current.includes(id)) {
    set("specialties", current.filter((item) => item !== id))
    return
  }
  if (current.length >= MAX_PICKED_SPECIALTIES) return
  set("specialties", [...current, id])
}

export function AdminListingForm({
  form,
  set,
  linkableDoctorNames = [],
  showKindPicker,
  onKindChange,
  submitLabel,
  onSubmit,
}: AdminListingFormProps) {
  return (
    <div className="space-y-5">
      {showKindPicker && onKindChange ? (
        <label className="space-y-1 text-xs">
          <span className="font-medium">Listing type</span>
          <select className={fieldClass} value={form.kind} onChange={(e) => onKindChange(e.target.value as CatalogueKind)}>
            <option value="hospital">hospital</option>
            <option value="doctor">doctor</option>
            <option value="facility">facility</option>
          </select>
        </label>
      ) : null}

      <fieldset className="space-y-3 rounded-xl border border-border/80 bg-muted/20 p-4">
        <legend className="px-1 text-sm font-semibold text-foreground">Basic details</legend>
        <label className="space-y-1.5 text-xs sm:col-span-2">
          <span className="font-medium">Cover image URL</span>
          <Input
            value={form.imageUrl}
            onChange={(e) => set("imageUrl", e.target.value)}
            placeholder="https://… (Google Drive / CDN / hospital site)"
            type="url"
          />
          <span className="block text-[11px] text-muted-foreground">Paste a direct image link — shown on the public listing card.</span>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-xs sm:col-span-2">
            <span className="font-medium">Name</span>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} required minLength={2} />
          </label>
          <label className="space-y-1 text-xs">
            <span className="font-medium">City</span>
            <Input value={form.city} onChange={(e) => set("city", e.target.value)} required minLength={2} />
          </label>
          <label className="space-y-1 text-xs">
            <span className="font-medium">State</span>
            <Input value={form.state} onChange={(e) => set("state", e.target.value)} />
          </label>
          <label className="space-y-1 text-xs">
            <span className="font-medium">Official email</span>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
          </label>
          <label className="space-y-1 text-xs">
            <span className="font-medium">Phone</span>
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Optional" />
          </label>
          <label className="space-y-1 text-xs">
            <span className="font-medium">Country</span>
            <Input value={form.country} onChange={(e) => set("country", e.target.value)} />
          </label>
          {form.kind === "hospital" ? (
            <label className="space-y-1 text-xs sm:col-span-2">
              <span className="font-medium">Facility type</span>
              <Input value={form.facilityType} onChange={(e) => set("facilityType", e.target.value)} placeholder="Hospital" />
            </label>
          ) : null}
          {form.kind === "doctor" ? (
            <label className="space-y-1 text-xs sm:col-span-2">
              <span className="font-medium">Specialization</span>
              <select
                className={fieldClass}
                value={form.specialization}
                onChange={(e) => set("specialization", e.target.value)}
              >
                <option value="">Choose one</option>
                {CURATED_SPECIALTIES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {form.kind === "facility" ? (
            <label className="space-y-1 text-xs sm:col-span-2">
              <span className="font-medium">Category</span>
              <select
                className={fieldClass}
                value={form.category}
                onChange={(e) => set("category", e.target.value as FacilityCategory)}
              >
                {(Object.keys(FACILITY_CATEGORY_LABELS) as FacilityCategory[]).map((c) => (
                  <option key={c} value={c}>
                    {FACILITY_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      </fieldset>

      <details className="rounded-lg border border-border/70">
        <summary className="cursor-pointer list-none px-3 py-2.5 text-xs font-semibold text-foreground [&::-webkit-details-marker]:hidden">
          Advanced details
          <span className="ml-1 font-normal text-muted-foreground">— optional</span>
        </summary>
        <AdvancedFields form={form} set={set} linkableDoctorNames={linkableDoctorNames} />
      </details>

      <Button type="button" onClick={onSubmit}>
        {submitLabel}
      </Button>
    </div>
  )
}

function AdvancedFields({
  form,
  set,
  linkableDoctorNames,
}: {
  form: ListingFormState
  set: AdminListingFormProps["set"]
  linkableDoctorNames: string[]
}) {
  return (
    <div className="space-y-3 border-t border-border/60 p-3">
      <label className="space-y-1 text-xs">
        <span className="font-medium">Overview</span>
        <textarea
          className="min-h-20 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs"
          value={form.overview}
          onChange={(e) => set("overview", e.target.value)}
        />
      </label>

      {form.kind !== "doctor" ? (
        <fieldset className="space-y-2">
          <legend className="text-xs font-medium text-muted-foreground">
            Specialties (pick up to {MAX_PICKED_SPECIALTIES})
          </legend>
          <div className="flex flex-wrap gap-2">
            {CURATED_SPECIALTIES.map((specialty) => {
              const active = form.specialties.includes(specialty.id)
              const disabled = !active && form.specialties.length >= MAX_PICKED_SPECIALTIES
              return (
                <label
                  key={specialty.id}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-xs ${
                    active ? "border-primary bg-primary/5" : "border-border"
                  } ${disabled ? "opacity-50" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    disabled={disabled}
                    onChange={() => toggleSpecialty(form, specialty.id, set)}
                  />
                  {specialty.name}
                </label>
              )
            })}
          </div>
        </fieldset>
      ) : null}

      {form.kind === "hospital" ? (
        <>
          <label className="space-y-1 text-xs">
            <span className="font-medium">Treatments</span>
            <Input
              value={form.treatmentNamesText}
              onChange={(e) => set("treatmentNamesText", e.target.value)}
              placeholder="Comma separated, e.g. Knee replacement, Dialysis"
            />
          </label>
          <label className="space-y-1 text-xs">
            <span className="font-medium">Doctors at this hospital</span>
            <textarea
              className="min-h-24 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs"
              value={form.doctorNamesText}
              onChange={(e) => set("doctorNamesText", e.target.value)}
              placeholder="One name per line"
            />
          </label>
          {linkableDoctorNames.length > 0 ? (
            <label className="space-y-1 text-xs">
              <span className="font-medium">Add existing doctor (optional)</span>
              <select
                className={fieldClass}
                defaultValue=""
                onChange={(e) => {
                  const name = e.target.value
                  if (!name) return
                  const names = linesFromText(form.doctorNamesText)
                  if (!names.some((item) => item.toLowerCase() === name.toLowerCase())) {
                    set("doctorNamesText", [...names, name].join("\n"))
                  }
                  e.target.value = ""
                }}
              >
                <option value="">Choose from platform</option>
                {linkableDoctorNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="space-y-1 text-xs">
            <span className="font-medium">Accreditations</span>
            <Input value={form.accreditations} onChange={(e) => set("accreditations", e.target.value)} placeholder="Comma separated" />
          </label>
          <fieldset className="space-y-2">
            <legend className="text-xs font-medium text-muted-foreground">Access</legend>
            <div className="flex flex-wrap gap-2">
              {ACCESS.map((item) => {
                const on = form.accessibility.includes(item)
                return (
                  <label key={item} className="flex cursor-pointer items-center gap-1.5 text-xs">
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() =>
                        set(
                          "accessibility",
                          on ? form.accessibility.filter((v) => v !== item) : [...form.accessibility, item],
                        )
                      }
                    />
                    {item}
                  </label>
                )
              })}
            </div>
          </fieldset>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs">
              <span className="font-medium">Patient experience (PER)</span>
              <Input
                type="number"
                min={1}
                max={5}
                step={0.1}
                value={form.perScore}
                onChange={(e) => set("perScore", e.target.value)}
                placeholder="Blank = not rated"
              />
            </label>
            <label className="space-y-1 text-xs">
              <span className="font-medium">Clinical expertise (CER)</span>
              <Input
                type="number"
                min={1}
                max={5}
                step={0.1}
                value={form.cerScore}
                onChange={(e) => set("cerScore", e.target.value)}
                placeholder="Blank = not rated"
              />
            </label>
          </div>
        </>
      ) : null}

      {form.kind === "doctor" ? (
        <>
          <label className="space-y-1 text-xs">
            <span className="font-medium">Qualifications</span>
            <Input value={form.qualifications} onChange={(e) => set("qualifications", e.target.value)} placeholder="Comma separated" />
          </label>
          <label className="space-y-1 text-xs">
            <span className="font-medium">Years of experience</span>
            <Input type="number" min={0} max={80} value={form.yearsExperience} onChange={(e) => set("yearsExperience", e.target.value)} />
          </label>
          <label className="space-y-1 text-xs">
            <span className="font-medium">Languages</span>
            <Input value={form.languages} onChange={(e) => set("languages", e.target.value)} placeholder="Comma separated" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs">
              <span className="font-medium">Patient experience (PER)</span>
              <Input
                type="number"
                min={1}
                max={5}
                step={0.1}
                value={form.perScore}
                onChange={(e) => set("perScore", e.target.value)}
                placeholder="Blank = not rated"
              />
            </label>
            <label className="space-y-1 text-xs">
              <span className="font-medium">Medical expertise (MER)</span>
              <Input
                type="number"
                min={1}
                max={5}
                step={0.1}
                value={form.merScore}
                onChange={(e) => set("merScore", e.target.value)}
                placeholder="Blank = not rated"
              />
            </label>
          </div>
        </>
      ) : null}

      {form.kind === "facility" ? (
        <label className="space-y-1 text-xs">
          <span className="font-medium">Services</span>
          <Input value={form.services} onChange={(e) => set("services", e.target.value)} placeholder="Comma separated" />
        </label>
      ) : null}
    </div>
  )
}

type SubmissionRowLike = {
  kind: CatalogueKind
  name: string
  email: string
  phone: string
  city: string
  note?: string
  state?: string
  country?: string
  overview?: string
  imageUrl?: string
  facilityType?: string
  specialties?: string[]
  treatments?: string[]
  treatmentNames?: string[]
  accreditations?: string[]
  specialization?: string
  qualifications?: string[]
  yearsExperience?: number | null
  languages?: string[]
  category?: string
  services?: string[]
  perScore?: number | null
  cerScore?: number | null
  merScore?: number | null
  doctorNames?: string[]
  accessibility?: string[]
}

export function rowToListingForm(row: SubmissionRowLike, kind: CatalogueKind): ListingFormState {
  const scoreText = (value: number | null | undefined) =>
    value === null || value === undefined ? "" : String(value)
  return {
    ...initialListingForm(row.kind ?? kind),
    kind: row.kind ?? kind,
    name: row.name,
    email: row.email,
    phone: row.phone,
    city: row.city,
    state: row.state ?? "",
    country: row.country ?? "India",
    overview: row.overview ?? row.note ?? "",
    imageUrl: row.imageUrl ?? "",
    facilityType: row.facilityType ?? "Hospital",
    specialties: row.specialties ?? [],
    treatments: row.treatments ?? [],
    treatmentNamesText: (row.treatmentNames ?? []).join(", "),
    accreditations: (row.accreditations ?? []).join(", "),
    specialization: row.specialization ?? "",
    qualifications: (row.qualifications ?? []).join(", "),
    yearsExperience:
      row.yearsExperience === null || row.yearsExperience === undefined ? "" : String(row.yearsExperience),
    languages: (row.languages ?? []).join(", "),
    category: (row.category as FacilityCategory) ?? "hospital",
    services: (row.services ?? []).join(", "),
    perScore: scoreText(row.perScore),
    cerScore: scoreText(row.cerScore),
    merScore: scoreText(row.merScore),
    doctorNamesText: (row.doctorNames?.length ? row.doctorNames : []).join("\n"),
    accessibility: row.accessibility ?? [],
  }
}