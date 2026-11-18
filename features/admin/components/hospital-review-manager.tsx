"use client"

/**
 * HospitalReviewManager — /admin/hospitals (pages/24).
 *
 * Hospital administration over the frozen Hospital fixtures: search, filters,
 * sorting, verification review with a detail drawer, and local mock actions
 * (approve / reject / suspend) with required reasons for rejections.
 *
 * Contract distinctions preserved (task brief §7):
 * - "verification status" (Hospital.verificationStatus) and any rating
 *   publication state are separate concepts and never inferred from each
 *   other.
 * - Approve = approve the hospital's *verification* locally. Reject requires
 *   a reason. Suspend is recorded locally as demo state — no fixture or
 *   contract is mutated.
 * - PER/CER values render as "Not yet rated"/"Assessment pending" when null —
 *   never 0/5.
 *
 * Layout: DataTable on desktop (deliberate horizontal scroll container);
 * stacked cards below `sm` (pages/24 §8: "Desktop table; mobile card list").
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
import { hospitalProfileHref } from "@/constants/routes"
import { formatDate, formatDateTime } from "@/features/admin/format"
import { VERIFICATION_LABELS } from "@/features/admin/selectors"
import { required, validate } from "@/lib/validation"
import { cn } from "@/lib/utils"
import type { Hospital, VerificationStatus } from "@/types"

// ---------------------------------------------------------------------------
// Local mock state — never mutates the frozen fixtures
// ---------------------------------------------------------------------------

export interface HospitalChange {
  action: "approved" | "rejected" | "suspended"
  reason?: string
  at: string
}

export interface HospitalRecord {
  hospital: Hospital
  change: HospitalChange | null
}

export interface HospitalManagerState {
  records: HospitalRecord[]
  notice: string | null
}

export type HospitalManagerAction =
  | { type: "approve"; id: string }
  | { type: "reject"; id: string; reason: string }
  | { type: "suspend"; id: string }
  | { type: "dismiss-notice" }

function nowIso(): string {
  return new Date().toISOString()
}

export function hospitalManagerReducer(
  state: HospitalManagerState,
  action: HospitalManagerAction,
): HospitalManagerState {
  switch (action.type) {
    case "approve":
      return {
        ...state,
        notice: `Demo: verification of "${state.records.find((r) => r.hospital.id === action.id)?.hospital.name ?? action.id}" approved locally. No fixture, listing or notification changed.`,
        records: state.records.map((record) =>
          record.hospital.id === action.id
            ? { ...record, change: { action: "approved", at: nowIso() } }
            : record,
        ),
      }
    case "reject":
      return {
        ...state,
        notice: `Demo: verification of "${state.records.find((r) => r.hospital.id === action.id)?.hospital.name ?? action.id}" rejected locally with a recorded reason. Nothing was published or notified.`,
        records: state.records.map((record) =>
          record.hospital.id === action.id
            ? { ...record, change: { action: "rejected", reason: action.reason, at: nowIso() } }
            : record,
        ),
      }
    case "suspend":
      return {
        ...state,
        notice: `Demo: listing suspended locally for "${state.records.find((r) => r.hospital.id === action.id)?.hospital.name ?? action.id}". This is a UI-only flag — no fixture or public page changed.`,
        records: state.records.map((record) =>
          record.hospital.id === action.id
            ? { ...record, change: { action: "suspended", at: nowIso() } }
            : record,
        ),
      }
    case "dismiss-notice":
      return { ...state, notice: null }
    default:
      return state
  }
}

export function makeInitialHospitalState(
  hospitals: readonly Hospital[],
): HospitalManagerState {
  return {
    records: hospitals.map((hospital) => ({ hospital, change: null })),
    notice: null,
  }
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

type StatusFilter = "all" | "needs_review" | VerificationStatus
type SortKey = "relevance" | "name-asc" | "name-desc" | "city-asc"

const STATUS_FILTER_OPTIONS: ReadonlyArray<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All hospitals" },
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
  { value: "city-asc", label: "City (A–Z)" },
]

function matchesFilter(record: HospitalRecord, filter: StatusFilter): boolean {
  const status = record.hospital.verificationStatus
  switch (filter) {
    case "all":
      return true
    case "needs_review":
      return status === "pending" || status === "unverified"
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

function sortRecords(records: HospitalRecord[], sort: SortKey): HospitalRecord[] {
  const copy = records.slice()
  switch (sort) {
    case "name-asc":
      return copy.sort(
        (a, b) => a.hospital.name.localeCompare(b.hospital.name) || a.hospital.id.localeCompare(b.hospital.id),
      )
    case "name-desc":
      return copy.sort(
        (a, b) => b.hospital.name.localeCompare(a.hospital.name) || a.hospital.id.localeCompare(b.hospital.id),
      )
    case "city-asc":
      return copy.sort(
        (a, b) =>
          a.hospital.city.localeCompare(b.hospital.city) || a.hospital.id.localeCompare(b.hospital.id),
      )
    case "relevance":
    default:
      return copy
  }
}

/** Honest, single-kind rating cell copy — never a fabricated 0. */
function ratingCell(score: number | null, status: string): string {
  if (score !== null) return `${score} / ${RATING_SCALE_MAX}`
  return status === "pending" ? ASSESSMENT_PENDING_MESSAGE : NOT_RATED_MESSAGE
}

// ---------------------------------------------------------------------------
// Detail drawer
// ---------------------------------------------------------------------------

function HospitalDetailDrawer({
  record,
  onClose,
  onApprove,
  onReject,
  onSuspend,
}: {
  record: HospitalRecord | null
  onClose: () => void
  onApprove: (id: string) => void
  onReject: (id: string, reason: string) => void
  onSuspend: (id: string) => void
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
              <SheetTitle className="text-left">{record.hospital.name}</SheetTitle>
              <SheetDescription className="text-left">
                {record.hospital.facilityType} · {record.hospital.city}, {record.hospital.state} ·{" "}
                {record.hospital.id}
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-5 p-4">
              {/* Verification vs publication distinction */}
              <section aria-label="Verification state" className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Verification state</h3>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Profile verification</span>
                  <VerificationBadge status={record.hospital.verificationStatus} />
                </div>
                {record.change ? (
                  <div className="rounded-lg border border-info/40 bg-info/10 px-3 py-2 text-xs text-info">
                    Local demo change: {record.change.action}
                    {record.change.reason ? ` — ${record.change.reason}` : ""} ·{" "}
                    {formatDateTime(record.change.at)}
                  </div>
                ) : null}
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Verification approval is separate from rating publication and separate
                  from any listing suspension. Demo actions above change only this
                  page&apos;s local state.
                </p>
              </section>

              <Separator />

              {/* Accreditations / document status */}
              <section aria-label="Accreditations and documents" className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Accreditations &amp; document status
                </h3>
                {record.hospital.accreditations.length === 0 ? (
                  <p className="rounded-lg border border-dashed px-3 py-3 text-xs text-muted-foreground">
                    No accreditation records on file for this demo hospital.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {record.hospital.accreditations.map((accreditation) => (
                      <li
                        key={accreditation.name}
                        className="flex flex-col gap-1 rounded-lg border px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm text-foreground">{accreditation.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {accreditation.validUntil
                              ? `Valid until ${formatDate(accreditation.validUntil)}`
                              : "No expiry on record"}
                          </p>
                        </div>
                        <StatusBadge status={accreditation.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <Separator />

              {/* Ratings — independent modules, honest empty states */}
              <section aria-label="Ratings" className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Ratings (independent)</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border px-3 py-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      PER — Patient Experience
                    </p>
                    <p className="mt-1 text-lg font-semibold tabular-nums">
                      {ratingCell(record.hospital.ratings.per.score, record.hospital.ratings.per.status)}
                    </p>
                    <StatusBadge status={record.hospital.ratings.per.status} className="mt-1" />
                  </div>
                  <div className="rounded-lg border px-3 py-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      CER — Clinical Expertise
                    </p>
                    <p className="mt-1 text-lg font-semibold tabular-nums">
                      {ratingCell(record.hospital.ratings.cer.score, record.hospital.ratings.cer.status)}
                    </p>
                    <StatusBadge status={record.hospital.ratings.cer.status} className="mt-1" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  PER and CER are separate assessments. A missing score is shown as
                  &quot;Not yet rated&quot; / &quot;Assessment pending&quot; — never
                  0/{RATING_SCALE_MAX}.
                </p>
              </section>

              <Separator />

              {/* Profile info */}
              <section aria-label="Profile information" className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Profile information</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {record.hospital.overview}
                </p>
                <p className="text-xs text-muted-foreground">
                  {record.hospital.specialties.length} specialties ·{" "}
                  {record.hospital.treatments.length} treatments · {record.hospital.doctorIds.length}{" "}
                  associated doctors
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href={hospitalProfileHref(record.hospital.slug)} />}
                  className="self-start"
                >
                  View public profile
                  <span className="sr-only"> of {record.hospital.name} (demo)</span>
                </Button>
              </section>

              <Separator />

              {/* Actions */}
              <section aria-label="Actions" className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Actions (local demo)</h3>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => onApprove(record.hospital.id)}>
                    Approve verification
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onReject(record.hospital.id, "")}
                  >
                    Reject…
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onSuspend(record.hospital.id)}>
                    Suspend listing
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Approve / reject change the demo verification state in page-local state
                  only. Suspend is a listing-availability flag — it never alters the
                  verification record.
                </p>
              </section>
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

export interface HospitalReviewManagerProps {
  hospitals: readonly Hospital[]
  className?: string
}

export function HospitalReviewManager({ hospitals, className }: HospitalReviewManagerProps) {
  const [state, dispatch] = useReducer(hospitalManagerReducer, hospitals, makeInitialHospitalState)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [sort, setSort] = useState<SortKey>("relevance")
  const [detailId, setDetailId] = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [rejectError, setRejectError] = useState<string | null>(null)

  const visible = useMemo(() => {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean)
    const filtered = state.records.filter((record) => {
      if (!matchesFilter(record, statusFilter)) return false
      if (tokens.length === 0) return true
      const haystack = [
        record.hospital.name,
        record.hospital.city,
        record.hospital.state,
        record.hospital.facilityType,
      ]
        .join(" ")
        .toLowerCase()
      return tokens.every((token) => haystack.includes(token))
    })
    return sortRecords(filtered, sort)
  }, [state.records, query, statusFilter, sort])

  const detailRecord = detailId
    ? (state.records.find((record) => record.hospital.id === detailId) ?? null)
    : null
  const rejectRecord = rejectId
    ? (state.records.find((record) => record.hospital.id === rejectId) ?? null)
    : null

  function openReject(id: string) {
    setRejectReason("")
    setRejectError(null)
    setRejectId(id)
  }

  function confirmReject() {
    if (!rejectId) return
    const errors = validate({ reason: [required("Rejection reason")] }, { reason: rejectReason })
    if (errors.reason) {
      setRejectError(errors.reason)
      return
    }
    dispatch({ type: "reject", id: rejectId, reason: rejectReason.trim() })
    setRejectId(null)
  }

  const columns: Array<DataTableColumn<HospitalRecord>> = [
    {
      key: "name",
      header: "Hospital",
      render: (record) => (
        <div className="min-w-0 space-y-0.5">
          <button
            type="button"
            onClick={() => setDetailId(record.hospital.id)}
            className="truncate text-left font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {record.hospital.name}
          </button>
          <p className="truncate text-xs text-muted-foreground">
            {record.hospital.city}, {record.hospital.state} · {record.hospital.facilityType}
          </p>
        </div>
      ),
    },
    {
      key: "verification",
      header: "Verification",
      render: (record) => (
        <div className="space-y-1">
          <VerificationBadge status={record.hospital.verificationStatus} />
          {record.change ? (
            <p className="text-xs text-muted-foreground">
              {record.change.action} locally {formatDateTime(record.change.at)}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "per",
      header: "PER",
      render: (record) => (
        <span className="tabular-nums">
          {ratingCell(record.hospital.ratings.per.score, record.hospital.ratings.per.status)}
        </span>
      ),
    },
    {
      key: "cer",
      header: "CER",
      render: (record) => (
        <span className="tabular-nums">
          {ratingCell(record.hospital.ratings.cer.score, record.hospital.ratings.cer.status)}
        </span>
      ),
    },
    {
      key: "doctors",
      header: "Doctors",
      render: (record) => (
        <span className="tabular-nums">{record.hospital.doctorIds.length}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (record) => (
        <div className="flex justify-end gap-1.5">
          <Button size="xs" variant="outline" onClick={() => setDetailId(record.hospital.id)}>
            Review
          </Button>
          {record.hospital.verificationStatus !== "verified" || record.change === null ? (
            <Button size="xs" onClick={() => dispatch({ type: "approve", id: record.hospital.id })}>
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
      {/* Toolbar: search + filters + sort */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="hospital-search">Search</Label>
            <Input
              id="hospital-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, city, state or facility type…"
              type="search"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hospital-status-filter">Verification</Label>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                if (typeof value === "string") setStatusFilter(value as StatusFilter)
              }}
            >
              <SelectTrigger id="hospital-status-filter" className="w-full sm:w-44">
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
            <Label htmlFor="hospital-sort">Sort</Label>
            <Select
              value={sort}
              onValueChange={(value) => {
                if (typeof value === "string") setSort(value as SortKey)
              }}
            >
              <SelectTrigger id="hospital-sort" className="w-full sm:w-40">
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
          {visible.length} of {state.records.length} hospitals
        </p>
      </div>

      {state.notice ? (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-info/40 bg-info/10 px-4 py-3 text-sm text-info"
        >
          <span>{state.notice}</span>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => dispatch({ type: "dismiss-notice" })}
          >
            Dismiss
          </Button>
        </div>
      ) : null}

      {visible.length === 0 ? (
        <EmptyState
          title="No hospitals match these filters"
          description="Try clearing the search or switching the verification filter back to “All hospitals”."
          action={{
            label: "Show all hospitals",
            onClick: () => {
              setQuery("")
              setStatusFilter("all")
            },
          }}
        />
      ) : (
        <>
          {/* Desktop / tablet: data table in a deliberate scroll container */}
          <div className="hidden sm:block">
            <DataTable
              columns={columns}
              rows={visible}
              getRowKey={(record) => record.hospital.id}
              emptyMessage="No hospitals to show."
            />
          </div>

          {/* Mobile: stacked cards */}
          <ul className="space-y-3 sm:hidden" aria-label="Hospitals">
            {visible.map((record) => (
              <li key={record.hospital.id} className="rounded-lg border p-4">
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-foreground">{record.hospital.name}</p>
                    <VerificationBadge status={record.hospital.verificationStatus} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {record.hospital.city}, {record.hospital.state} ·{" "}
                    {record.hospital.facilityType}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PER {ratingCell(record.hospital.ratings.per.score, record.hospital.ratings.per.status)} · CER{" "}
                    {ratingCell(record.hospital.ratings.cer.score, record.hospital.ratings.cer.status)}
                  </p>
                  {record.change ? (
                    <p className="text-xs text-info">
                      {record.change.action} locally {formatDateTime(record.change.at)}
                    </p>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setDetailId(record.hospital.id)}>
                    Review
                  </Button>
                  {!(record.hospital.verificationStatus === "verified" && record.change !== null) ? (
                    <Button size="sm" onClick={() => dispatch({ type: "approve", id: record.hospital.id })}>
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
        All actions are local demo state on fictional fixtures — no verification, listing or
        notification is real. Labels follow the frozen verification vocabulary
        ({Object.values(VERIFICATION_LABELS).join(", ")}).
      </p>

      {/* Detail drawer */}
      <HospitalDetailDrawer
        record={detailRecord}
        onClose={() => setDetailId(null)}
        onApprove={(id) => dispatch({ type: "approve", id })}
        onReject={(id) => openReject(id)}
        onSuspend={(id) => dispatch({ type: "suspend", id })}
      />

      {/* Reject dialog — mandatory reason */}
      <Dialog
        open={rejectId !== null}
        onOpenChange={(open) => {
          if (!open) setRejectId(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject verification (demo)</DialogTitle>
            <DialogDescription>
              {rejectRecord
                ? `Record why the verification of ${rejectRecord.hospital.name} is being rejected. The reason stays in this page's local state — nothing is sent.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="hospital-reject-reason">
              Reason <span aria-hidden className="text-destructive"> *</span>
            </Label>
            <Textarea
              id="hospital-reject-reason"
              value={rejectReason}
              onChange={(event) => {
                setRejectReason(event.target.value)
                setRejectError(null)
              }}
              rows={3}
              placeholder="e.g. Accreditation record expired — request renewal (demo reason)"
              aria-invalid={rejectError ? true : undefined}
              aria-describedby={rejectError ? "hospital-reject-reason-error" : undefined}
            />
            {rejectError ? (
              <p id="hospital-reject-reason-error" className="text-xs font-medium text-destructive">
                {rejectError}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmReject}>
              Reject (demo)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
