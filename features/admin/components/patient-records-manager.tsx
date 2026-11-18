"use client"

/**
 * PatientRecordsManager — /admin/patients (pages/24).
 *
 * Privacy-conscious patient record management over the frozen Patient
 * fixtures (pages/24 §6 + 06-technical-architecture.md security rules):
 *
 * - The list shows only directory-level fields (name, country/city,
 *   preferred language, joined date, enquiry count). Email and phone are
 *   masked in the table and only revealed as explicitly-consented demo
 *   values inside the detail drawer — always labelled demo data.
 * - NO medical information is shown: the Patient contract carries none, and
 *   the drawer only references enquiry/appointment *records* (specialty,
 *   status, dates, report file NAMES from the patient's own consented
 *   enquiries) — never any invented clinical detail or document content.
 * - "Restrict account" is a local demo flag recorded on the page only; the
 *   UI explicitly states the demo account is not really restricted.
 *
 * Layout: DataTable (desktop) / stacked cards (mobile) per pages/24 §8.
 */

import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatDate, formatDateTime } from "@/features/admin/format"
import {
  appointmentsForPatientAdmin,
  enquiriesForPatient,
  patientAgeYears,
  specialtyLabel,
  treatmentLabel,
} from "@/features/admin/selectors"
import { cn } from "@/lib/utils"
import type { Patient } from "@/types"

/** Demo-only masking for admin list views (contact handover is not simulated). */
function maskEmail(email: string): string {
  const [localPart, domainPart] = email.split("@")
  if (!domainPart) return "•••"
  const visible = localPart.slice(0, 2)
  return `${visible}${"•".repeat(Math.max(localPart.length - 2, 2))}@${domainPart}`
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  return `•••• ${digits.slice(-2)}`
}

/** Gender label for the frozen union; null renders as "Not stated". */
function genderLabel(gender: Patient["gender"]): string {
  switch (gender) {
    case "male":
      return "Male"
    case "female":
      return "Female"
    case "other":
      return "Other"
    case "prefer_not_to_say":
      return "Prefer not to say"
    default:
      return "Not stated"
  }
}

// ---------------------------------------------------------------------------
// Detail drawer
// ---------------------------------------------------------------------------

function PatientDetailDrawer({
  patient,
  restricted,
  onToggleRestriction,
  onClose,
}: {
  patient: Patient | null
  restricted: boolean
  onToggleRestriction: (id: string) => void
  onClose: () => void
}) {
  if (!patient) {
    return (
      <Sheet open={false} onOpenChange={(open) => { if (!open) onClose() }}>
        <SheetContent side="right" className="w-full sm:max-w-lg" />
      </Sheet>
    )
  }

  const enquiries = enquiriesForPatient(patient.name)
  const appointments = appointmentsForPatientAdmin(patient.id)
  const age = patientAgeYears(patient.dateOfBirth)

  return (
    <Sheet open onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-lg">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="text-left">{patient.name}</SheetTitle>
          <SheetDescription className="text-left">
            {patient.country}
            {patient.city ? ` · ${patient.city}` : ""} · {patient.id}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-5 p-4">
          {/* Demo identity block — consented demo contact fields */}
          <section aria-label="Account details" className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Account details</h3>
            <p className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-1.5 text-xs text-warning">
              Contact shown only in this record (demo).
            </p>
            <dl className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="truncate font-mono text-xs text-foreground">{patient.email}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="font-mono text-xs text-foreground">{patient.phone}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Preferred language</dt>
                <dd className="text-foreground">{patient.preferredLanguage}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Age</dt>
                <dd className="text-foreground">{age !== null ? `${age} years` : "Not on record"}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Gender</dt>
                <dd className="text-foreground">{genderLabel(patient.gender)}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Joined</dt>
                <dd className="text-foreground">{formatDate(patient.createdAt)}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Saved providers</dt>
                <dd className="tabular-nums text-foreground">
                  {patient.savedProviderIds.length}
                </dd>
              </div>
            </dl>
            {restricted ? (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs text-destructive">
                Restricted locally (demo) · {formatDateTime(restrictedAt())}
              </div>
            ) : null}
          </section>

          <Separator />

          {/* Enquiry references — record metadata only, no clinical content */}
          <section aria-label="Enquiry references" className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">
              Enquiries ({enquiries.length})
            </h3>
            {enquiries.length === 0 ? (
              <p className="rounded-lg border border-dashed px-3 py-3 text-xs text-muted-foreground">
                No enquiries reference this demo patient.
              </p>
            ) : (
              <ul className="space-y-2">
                {enquiries.map((enquiry) => (
                  <li key={enquiry.id} className="rounded-lg border px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{enquiry.id}</p>
                      <StatusBadge status={enquiry.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {specialtyLabel(enquiry.specialty)} ·{" "}
                      {enquiry.preferredDate ? formatDate(enquiry.preferredDate) : "—"} ·{" "}
                      {formatDateTime(enquiry.consentAt)}
                    </p>
                    {enquiry.reportNames.length > 0 ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Reports: {enquiry.reportNames.join(", ")}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <Separator />

          {/* Appointment references */}
          <section aria-label="Appointment references" className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">
              Appointment requests ({appointments.length})
            </h3>
            {appointments.length === 0 ? (
              <p className="rounded-lg border border-dashed px-3 py-3 text-xs text-muted-foreground">
                No appointment requests reference this demo patient.
              </p>
            ) : (
              <ul className="space-y-2">
                {appointments.map((appointment) => (
                  <li key={appointment.id} className="rounded-lg border px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{appointment.id}</p>
                      <StatusBadge status={appointment.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {treatmentLabel(appointment.treatmentId) ?? "General consultation"} ·{" "}
                      {formatDate(appointment.preferredDate)} · requested{" "}
                      {formatDateTime(appointment.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <Separator />

          <section aria-label="Actions" className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Actions</h3>
            <Button size="sm" variant={restricted ? "outline" : "destructive"} onClick={() => onToggleRestriction(patient.id)}>
              {restricted ? "Lift restriction" : "Restrict account"}
            </Button>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  )
}

/** Timestamp for the demo restriction banner (set when the flag is raised). */
let restrictionTimestamp: string | null = null
function restrictedAt(): string {
  if (restrictionTimestamp === null) {
    restrictionTimestamp = new Date().toISOString()
  }
  return formatDateTime(restrictionTimestamp)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface PatientRecordsManagerProps {
  patients: readonly Patient[]
  className?: string
}

export function PatientRecordsManager({ patients, className }: PatientRecordsManagerProps) {
  const [query, setQuery] = useState("")
  const [detailId, setDetailId] = useState<string | null>(null)
  const [restrictedIds, setRestrictedIds] = useState<ReadonlySet<string>>(new Set())

  const visible = useMemo(() => {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean)
    if (tokens.length === 0) return [...patients]
    return patients.filter((patient) => {
      const haystack = [patient.name, patient.country, patient.city ?? "", patient.preferredLanguage]
        .join(" ")
        .toLowerCase()
      return tokens.every((token) => haystack.includes(token))
    })
  }, [patients, query])

  const detailPatient = detailId
    ? (patients.find((patient) => patient.id === detailId) ?? null)
    : null

  function toggleRestriction(id: string) {
    setRestrictedIds((previous) => {
      const next = new Set(previous)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const columns: Array<DataTableColumn<Patient>> = [
    {
      key: "name",
      header: "Patient",
      render: (patient) => (
        <div className="min-w-0 space-y-0.5">
          <button
            type="button"
            onClick={() => setDetailId(patient.id)}
            className="truncate text-left font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {patient.name}
          </button>
          <p className="truncate text-xs text-muted-foreground">
            {patient.city ? `${patient.city}, ` : ""}
            {patient.country}
          </p>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact (masked)",
      render: (patient) => (
        <div className="space-y-0.5 font-mono text-xs text-muted-foreground">
          <p>{maskEmail(patient.email)}</p>
          <p>{maskPhone(patient.phone)}</p>
        </div>
      ),
    },
    {
      key: "language",
      header: "Language",
      render: (patient) => patient.preferredLanguage,
    },
    {
      key: "enquiries",
      header: "Enquiries",
      render: (patient) => (
        <span className="tabular-nums">{enquiriesForPatient(patient.name).length}</span>
      ),
    },
    {
      key: "joined",
      header: "Joined",
      render: (patient) => formatDate(patient.createdAt),
    },
    {
      key: "status",
      header: "Account",
      render: (patient) =>
        restrictedIds.has(patient.id) ? (
          <StatusBadge status="suspended" label="Restricted (demo)" />
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            Active (demo)
          </Badge>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (patient) => (
        <div className="flex justify-end">
          <Button size="xs" variant="outline" onClick={() => setDetailId(patient.id)}>
            View record
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex-1 space-y-1.5 sm:max-w-sm">
          <Label htmlFor="patient-search">Search</Label>
          <Input
            id="patient-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, country, city or language…"
            type="search"
          />
        </div>
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {visible.length} of {patients.length} patients
        </p>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="No patients match this search"
          description="Try a different name, country or language."
          action={{
            label: "Clear search",
            onClick: () => setQuery(""),
          }}
        />
      ) : (
        <>
          <div className="hidden sm:block">
            <DataTable
              columns={columns}
              rows={visible}
              getRowKey={(patient) => patient.id}
              emptyMessage="No patients to show."
            />
          </div>

          <ul className="space-y-3 sm:hidden" aria-label="Patients">
            {visible.map((patient) => (
              <li key={patient.id} className="rounded-lg border p-4">
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-foreground">{patient.name}</p>
                    {restrictedIds.has(patient.id) ? (
                      <StatusBadge status="suspended" label="Restricted (demo)" />
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {patient.city ? `${patient.city}, ` : ""}
                    {patient.country} · {patient.preferredLanguage}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {enquiriesForPatient(patient.name).length} enquiries · joined{" "}
                    {formatDate(patient.createdAt)}
                  </p>
                </div>
                <div className="mt-3">
                  <Button size="sm" variant="outline" onClick={() => setDetailId(patient.id)}>
                    View record
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <PatientDetailDrawer
        patient={detailPatient}
        restricted={detailPatient ? restrictedIds.has(detailPatient.id) : false}
        onToggleRestriction={toggleRestriction}
        onClose={() => setDetailId(null)}
      />
    </div>
  )
}
