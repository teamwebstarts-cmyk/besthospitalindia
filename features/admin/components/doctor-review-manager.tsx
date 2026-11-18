"use client"

/**
 * DoctorReviewManager — /admin/doctors (pages/24).
 *
 * Doctor administration over the frozen Doctor fixtures: search, verification
 * filters, credential review with a detail drawer, and local mock actions.
 *
 * Rules honored:
 * - The admin NEVER auto-marks a doctor verified. "Approve" acts on the
 *   doctor's *profile verification* only after an explicit user action, and
 *   the registration block (Registration.status) is shown separately — the
 *   UI keeps credential/registration review states distinct from profile
 *   verification (task brief §4 Doctor Management).
 * - Request-changes records a mandatory note locally.
 * - PER/MER render honestly when null — never 0/5.
 * - Registration numbers are already masked in the fixtures and stay masked.
 *
 * Layout: DataTable (desktop) / stacked cards (mobile) per pages/24 §8.
 */

import { useMemo, useReducer, useState } from "react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { VerificationBadge } from "@/features/providers/components/verification-badge"
import {
  ASSESSMENT_PENDING_MESSAGE,
  NOT_RATED_MESSAGE,
  RATING_SCALE_MAX,
} from "@/constants/rating"
import { doctorProfileHref } from "@/constants/routes"
import { formatDateTime } from "@/features/admin/format"
import { specialtyLabel } from "@/features/admin/selectors"
import { required, validate } from "@/lib/validation"
import { cn } from "@/lib/utils"
import type { Doctor, VerificationStatus } from "@/types"

// ---------------------------------------------------------------------------
// Local mock state — never mutates the frozen fixtures
// ---------------------------------------------------------------------------

export interface DoctorChange {
  action: "profile_verified" | "changes_requested" | "registration_verified"
  note?: string
  at: string
}

export interface DoctorRecord {
  doctor: Doctor
  change: DoctorChange | null
}

export interface DoctorManagerState {
  records: DoctorRecord[]
  notice: string | null
}

export type DoctorManagerAction =
  | { type: "verify-profile"; id: string }
  | { type: "request-changes"; id: string; note: string }
  | { type: "verify-registration"; id: string }
  | { type: "dismiss-notice" }

function nowIso(): string {
  return new Date().toISOString()
}

export function doctorManagerReducer(
  state: DoctorManagerState,
  action: DoctorManagerAction,
): DoctorManagerState {
  switch (action.type) {
    case "verify-profile":
      return {
        ...state,
        notice: `Demo: profile verification approved locally for ${state.records.find((r) => r.doctor.id === action.id)?.doctor.name ?? action.id}. Registration status is unchanged and nothing was published or notified.`,
        records: state.records.map((record) =>
          record.doctor.id === action.id
            ? { ...record, change: { action: "profile_verified", at: nowIso() } }
            : record,
        ),
      }
    case "request-changes":
      return {
        ...state,
        notice: `Demo: changes requested locally for ${state.records.find((r) => r.doctor.id === action.id)?.doctor.name ?? action.id}. The note stays on this page — no notification exists in this phase.`,
        records: state.records.map((record) =>
          record.doctor.id === action.id
            ? { ...record, change: { action: "changes_requested", note: action.note, at: nowIso() } }
            : record,
        ),
      }
    case "verify-registration":
      return {
        ...state,
        notice: `Demo: registration check marked verified locally for ${state.records.find((r) => r.doctor.id === action.id)?.doctor.name ?? action.id}. This is a separate record from the profile verification and exists only on this page.`,
        records: state.records.map((record) =>
          record.doctor.id === action.id
            ? { ...record, change: { action: "registration_verified", at: nowIso() } }
            : record,
        ),
      }
    case "dismiss-notice":
      return { ...state, notice: null }
    default:
      return state
  }
}

export function makeInitialDoctorState(doctors: readonly Doctor[]): DoctorManagerState {
  return {
    records: doctors.map((doctor) => ({ doctor, change: null })),
    notice: null,
  }
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

type StatusFilter = "all" | "needs_review" | VerificationStatus
type SortKey = "relevance" | "name-asc" | "name-desc" | "experience-desc"

const STATUS_FILTER_OPTIONS: ReadonlyArray<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All doctors" },
  { value: "needs_review", label: "Needs review" },
  { value: "verified", label: "Verified" },
  { value: "pending", label: "Pending review" },
  { value: "unverified", label: "Unverified" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
]

const SORT_OPTIONS: ReadonlyArray<{ value: SortKey; label: string }> = [
  { value: "relevance", label: "Fixture order" },
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "name-desc", label: "Name (Z–A)" },
  { value: "experience-desc", label: "Experience (high first)" },
]

function matchesFilter(record: DoctorRecord, filter: StatusFilter): boolean {
  const status = record.doctor.verificationStatus
  switch (filter) {
    case "all":
      return true
    case "needs_review":
      return status !== "verified" || record.doctor.registration.status !== "verified"
    case "verified":
      return status === "verified"
    case "pending":
      return status === "pending"
    case "unverified":
      return status === "unverified"
    case "rejected":
      return status === "rejected"
    case "expired":
      return status === "expired"
    default:
      return true
  }
}

function sortRecords(records: DoctorRecord[], sort: SortKey): DoctorRecord[] {
  const copy = records.slice()
  switch (sort) {
    case "name-asc":
      return copy.sort(
        (a, b) => a.doctor.name.localeCompare(b.doctor.name) || a.doctor.id.localeCompare(b.doctor.id),
      )
    case "name-desc":
      return copy.sort(
        (a, b) => b.doctor.name.localeCompare(a.doctor.name) || a.doctor.id.localeCompare(b.doctor.id),
      )
    case "experience-desc":
      // Missing experience (null) sorts last — never treated as 0 years.
      return copy.sort(
        (a, b) =>
          (b.doctor.yearsExperience ?? -1) - (a.doctor.yearsExperience ?? -1) ||
          a.doctor.id.localeCompare(b.doctor.id),
      )
    case "relevance":
    default:
      return copy
  }
}

function ratingCell(score: number | null, status: string): string {
  if (score !== null) return `${score} / ${RATING_SCALE_MAX}`
  return status === "pending" ? ASSESSMENT_PENDING_MESSAGE : NOT_RATED_MESSAGE
}

function experienceLabel(years: number | null): string {
  return years === null ? "Not on record" : `${years} years`
}

// ---------------------------------------------------------------------------
// Detail drawer
// ---------------------------------------------------------------------------

function DoctorDetailDrawer({
  record,
  onClose,
  onVerifyProfile,
  onRequestChanges,
  onVerifyRegistration,
}: {
  record: DoctorRecord | null
  onClose: () => void
  onVerifyProfile: (id: string) => void
  onRequestChanges: (id: string) => void
  onVerifyRegistration: (id: string) => void
}) {
  return (
    <Sheet
      open={record !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-lg">
        {record ? (
          <>
            <SheetHeader className="border-b p-4">
              <SheetTitle className="text-left">{record.doctor.name}</SheetTitle>
              <SheetDescription className="text-left">
                {specialtyLabel(record.doctor.specialization)} · {record.doctor.city},{" "}
                {record.doctor.state} · {record.doctor.id}
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-5 p-4">
              {/* Verification + registration — separate concepts */}
              <section aria-label="Verification and registration" className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Verification &amp; registration
                </h3>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Profile verification</span>
                  <VerificationBadge status={record.doctor.verificationStatus} />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Medical registration</span>
                  <VerificationBadge status={record.doctor.registration.status} />
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Registration authority: {record.doctor.registration.authority} · number{" "}
                  <span className="font-mono">{record.doctor.registration.numberMasked}</span>{" "}
                  (fictional, masked in all admin views).
                </p>
                {record.change ? (
                  <div className="rounded-lg border border-info/40 bg-info/10 px-3 py-2 text-xs text-info">
                    Local demo change: {record.change.action.replace(/_/g, " ")}
                    {record.change.note ? ` — ${record.change.note}` : ""} ·{" "}
                    {formatDateTime(record.change.at)}
                  </div>
                ) : null}
              </section>

              <Separator />

              {/* Qualifications */}
              <section aria-label="Qualifications" className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Qualifications</h3>
                <ul className="space-y-1.5">
                  {record.doctor.qualifications.map((qualification) => (
                    <li key={qualification} className="flex items-center gap-2 text-sm">
                      <span
                        aria-hidden
                        className="size-1.5 shrink-0 rounded-full bg-muted-foreground/60"
                      />
                      {qualification}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground">
                  Experience: {experienceLabel(record.doctor.yearsExperience)} · Languages:{" "}
                  {record.doctor.languages.join(", ")}
                </p>
              </section>

              <Separator />

              {/* Hospital associations */}
              <section aria-label="Hospital associations" className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Hospital associations</h3>
                {record.doctor.hospitalIds.length === 0 ? (
                  <p className="rounded-lg border border-dashed px-3 py-3 text-xs text-muted-foreground">
                    No hospital associations on this demo doctor.
                  </p>
                ) : (
                  <ul className="space-y-1.5 text-sm">
                    {record.doctor.hospitalIds.map((hospitalId) => (
                      <li key={hospitalId} className="flex items-center gap-2">
                        <span
                          aria-hidden
                          className="size-1.5 shrink-0 rounded-full bg-muted-foreground/60"
                        />
                        {hospitalId}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-xs text-muted-foreground">
                  Associations resolve against the hospital fixtures (two-way consistent).
                </p>
              </section>

              <Separator />

              {/* Ratings — PER and MER separate */}
              <section aria-label="Ratings" className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Ratings (independent)</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border px-3 py-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      PER — Patient Experience
                    </p>
                    <p className="mt-1 text-lg font-semibold tabular-nums">
                      {ratingCell(record.doctor.ratings.per.score, record.doctor.ratings.per.status)}
                    </p>
                    <StatusBadge status={record.doctor.ratings.per.status} className="mt-1" />
                  </div>
                  <div className="rounded-lg border px-3 py-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      MER — Medical Expertise
                    </p>
                    <p className="mt-1 text-lg font-semibold tabular-nums">
                      {ratingCell(record.doctor.ratings.mer.score, record.doctor.ratings.mer.status)}
                    </p>
                    <StatusBadge status={record.doctor.ratings.mer.status} className="mt-1" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  PER and MER are separate evidence tracks. A missing score is never shown
                  as 0/{RATING_SCALE_MAX}.
                </p>
              </section>

              <Separator />

              {/* Actions */}
              <section aria-label="Actions" className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Actions (local demo)</h3>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => onVerifyProfile(record.doctor.id)}>
                    Approve profile verification
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRequestChanges(record.doctor.id)}
                  >
                    Request changes…
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onVerifyRegistration(record.doctor.id)}
                  >
                    Mark registration verified
                  </Button>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Nothing is auto-verified: each button records one explicit demo decision in
                  page-local state. Profile verification and registration checks stay
                  separate, and no doctor is ever verified as a side effect of viewing this
                  drawer.
                </p>
              </section>

              <Separator />

              <div>
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href={doctorProfileHref(record.doctor.slug)} />}
                  className="self-start"
                >
                  View public profile
                  <span className="sr-only"> of {record.doctor.name} (demo)</span>
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface DoctorReviewManagerProps {
  doctors: readonly Doctor[]
  className?: string
}

export function DoctorReviewManager({ doctors, className }: DoctorReviewManagerProps) {
  const [state, dispatch] = useReducer(doctorManagerReducer, doctors, makeInitialDoctorState)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [sort, setSort] = useState<SortKey>("relevance")
  const [detailId, setDetailId] = useState<string | null>(null)
  const [changesId, setChangesId] = useState<string | null>(null)
  const [changesNote, setChangesNote] = useState("")
  const [changesError, setChangesError] = useState<string | null>(null)

  const visible = useMemo(() => {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean)
    const filtered = state.records.filter((record) => {
      if (!matchesFilter(record, statusFilter)) return false
      if (tokens.length === 0) return true
      const haystack = [
        record.doctor.name,
        record.doctor.city,
        record.doctor.state,
        specialtyLabel(record.doctor.specialization),
        ...record.doctor.qualifications,
      ]
        .join(" ")
        .toLowerCase()
      return tokens.every((token) => haystack.includes(token))
    })
    return sortRecords(filtered, sort)
  }, [state.records, query, statusFilter, sort])

  const detailRecord = detailId
    ? (state.records.find((record) => record.doctor.id === detailId) ?? null)
    : null
  const changesRecord = changesId
    ? (state.records.find((record) => record.doctor.id === changesId) ?? null)
    : null

  function openChanges(id: string) {
    setChangesNote("")
    setChangesError(null)
    setChangesId(id)
  }

  function confirmChanges() {
    if (!changesId) return
    const errors = validate({ note: [required("Change request note")] }, { note: changesNote })
    if (errors.note) {
      setChangesError(errors.note)
      return
    }
    dispatch({ type: "request-changes", id: changesId, note: changesNote.trim() })
    setChangesId(null)
  }

  const columns: Array<DataTableColumn<DoctorRecord>> = [
    {
      key: "name",
      header: "Doctor",
      render: (record) => (
        <div className="min-w-0 space-y-0.5">
          <button
            type="button"
            onClick={() => setDetailId(record.doctor.id)}
            className="truncate text-left font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {record.doctor.name}
          </button>
          <p className="truncate text-xs text-muted-foreground">
            {specialtyLabel(record.doctor.specialization)} · {record.doctor.city}
          </p>
        </div>
      ),
    },
    {
      key: "verification",
      header: "Verification",
      render: (record) => (
        <div className="space-y-1">
          <VerificationBadge status={record.doctor.verificationStatus} />
          <p className="text-xs text-muted-foreground">
            Registration: {record.doctor.registration.status.replace(/_/g, " ")}
          </p>
          {record.change ? (
            <p className="text-xs text-info">
              {record.change.action.replace(/_/g, " ")} locally {formatDateTime(record.change.at)}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "experience",
      header: "Experience",
      render: (record) => <span className="tabular-nums">{experienceLabel(record.doctor.yearsExperience)}</span>,
    },
    {
      key: "per",
      header: "PER",
      render: (record) => (
        <span className="tabular-nums">
          {ratingCell(record.doctor.ratings.per.score, record.doctor.ratings.per.status)}
        </span>
      ),
    },
    {
      key: "mer",
      header: "MER",
      render: (record) => (
        <span className="tabular-nums">
          {ratingCell(record.doctor.ratings.mer.score, record.doctor.ratings.mer.status)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (record) => (
        <div className="flex justify-end gap-1.5">
          <Button size="xs" variant="outline" onClick={() => setDetailId(record.doctor.id)}>
            Review
          </Button>
          {record.doctor.verificationStatus !== "verified" || record.change === null ? (
            <Button size="xs" onClick={() => dispatch({ type: "verify-profile", id: record.doctor.id })}>
              Approve
            </Button>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              Approved
            </Badge>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="doctor-search">Search</Label>
            <Input
              id="doctor-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, city, specialty or qualification…"
              type="search"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="doctor-status-filter">Verification</Label>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                if (typeof value === "string") setStatusFilter(value as StatusFilter)
              }}
            >
              <SelectTrigger id="doctor-status-filter" className="w-full sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="doctor-sort">Sort</Label>
            <Select
              value={sort}
              onValueChange={(value) => {
                if (typeof value === "string") setSort(value as SortKey)
              }}
            >
              <SelectTrigger id="doctor-sort" className="w-full sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <p aria-live="polite" className="text-sm text-muted-foreground lg:pb-2">
          {visible.length} of {state.records.length} doctors
        </p>
      </div>

      {state.notice ? (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-info/40 bg-info/10 px-4 py-3 text-sm text-info"
        >
          <span>{state.notice}</span>
          <Button variant="ghost" size="xs" onClick={() => dispatch({ type: "dismiss-notice" })}>
            Dismiss
          </Button>
        </div>
      ) : null}

      {visible.length === 0 ? (
        <EmptyState
          title="No doctors match these filters"
          description="Try clearing the search or switching the verification filter back to “All doctors”."
          action={{
            label: "Show all doctors",
            onClick: () => {
              setQuery("")
              setStatusFilter("all")
            },
          }}
        />
      ) : (
        <>
          <div className="hidden sm:block">
            <DataTable
              columns={columns}
              rows={visible}
              getRowKey={(record) => record.doctor.id}
              emptyMessage="No doctors to show."
            />
          </div>

          <ul className="space-y-3 sm:hidden" aria-label="Doctors">
            {visible.map((record) => (
              <li key={record.doctor.id} className="rounded-lg border p-4">
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-foreground">{record.doctor.name}</p>
                    <VerificationBadge status={record.doctor.verificationStatus} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {specialtyLabel(record.doctor.specialization)} · {record.doctor.city} ·{" "}
                    {experienceLabel(record.doctor.yearsExperience)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Registration {record.doctor.registration.status.replace(/_/g, " ")} · PER{" "}
                    {ratingCell(record.doctor.ratings.per.score, record.doctor.ratings.per.status)} · MER{" "}
                    {ratingCell(record.doctor.ratings.mer.score, record.doctor.ratings.mer.status)}
                  </p>
                  {record.change ? (
                    <p className="text-xs text-info">
                      {record.change.action.replace(/_/g, " ")} locally{" "}
                      {formatDateTime(record.change.at)}
                    </p>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setDetailId(record.doctor.id)}>
                    Review
                  </Button>
                  {!(record.doctor.verificationStatus === "verified" && record.change !== null) ? (
                    <Button
                      size="sm"
                      onClick={() => dispatch({ type: "verify-profile", id: record.doctor.id })}
                    >
                      Approve
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="text-xs text-muted-foreground">
        All actions are local demo state on fictional fixtures. Doctors are never
        automatically marked verified — every verification is an explicit recorded action,
        and registration checks stay separate from profile verification.
      </p>

      <DoctorDetailDrawer
        record={detailRecord}
        onClose={() => setDetailId(null)}
        onVerifyProfile={(id) => dispatch({ type: "verify-profile", id })}
        onRequestChanges={(id) => openChanges(id)}
        onVerifyRegistration={(id) => dispatch({ type: "verify-registration", id })}
      />

      {/* Request-changes dialog — mandatory note */}
      <Dialog
        open={changesId !== null}
        onOpenChange={(open) => {
          if (!open) setChangesId(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request credential changes (demo)</DialogTitle>
            <DialogDescription>
              {changesRecord
                ? `Record what ${changesRecord.doctor.name} needs to provide. The note stays in this page's local state — no notification is sent in this phase.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="doctor-changes-note">
              Note <span aria-hidden className="text-destructive"> *</span>
            </Label>
            <Textarea
              id="doctor-changes-note"
              value={changesNote}
              onChange={(event) => {
                setChangesNote(event.target.value)
                setChangesError(null)
              }}
              rows={3}
              placeholder="e.g. Postgraduate degree certificate missing (demo note)"
              aria-invalid={changesError ? true : undefined}
              aria-describedby={changesError ? "doctor-changes-note-error" : undefined}
            />
            {changesError ? (
              <p id="doctor-changes-note-error" className="text-xs font-medium text-destructive">
                {changesError}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangesId(null)}>
              Cancel
            </Button>
            <Button onClick={confirmChanges}>Request changes (demo)</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
