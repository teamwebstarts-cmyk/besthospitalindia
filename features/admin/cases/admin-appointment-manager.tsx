"use client"

/**
 * AdminAppointmentManager — /admin/appointments (pages/25 §A, 14-admin-module-contracts).
 *
 * Primary question (14-admin-module-contracts): "What requests need scheduling
 * response?" — Appointment queue by status/date with assign / update status /
 * cancel-request actions over the full fixture set.
 *
 * Every mutation is LOCAL demo state (AppointmentStatus union + `note` are
 * frozen A01 contracts). No scheduling system, calendar, provider write or
 * patient notification exists — each confirmation states that boundary.
 * Search/filter/sort operate on the displayed fixture set, not just control
 * appearance (pages/25 §7).
 */

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { doctorById, hospitalById, patientById, treatmentById } from "@/data"
import {
  APPOINTMENT_STATUS_PRESENTATION,
} from "@/features/admin/cases/case-presentations"
import { delay } from "@/features/admin/cases/demo-latency"
import {
  CalendarDaysIcon,
  CircleCheckBigIcon,
  CircleAlertIcon,
  SearchIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { updateDemoAppointmentRequest } from "@/features/appointments/demo-appointment-store"
import type { AppointmentRequest, AppointmentStatus } from "@/types"

export interface AdminAppointmentManagerProps {
  /** All appointment-request fixtures, fixture order (A01 `appointments`). */
  requests: readonly AppointmentRequest[]
  className?: string
}

type StatusFilter = "all" | AppointmentStatus
type DateFilter = "all" | "overdue" | "this-week" | "later"
type SortKey = "newest" | "date-asc" | "date-desc"

/**
 * Demo "today" — appointments are dated late 2026 in the fixtures; a fixed
 * demo window keeps date filters deterministic between server and client.
 */
const DEMO_TODAY = "2026-11-17"
const DEMO_WEEK_END = "2026-11-24"

/** Statuses an admin can still act on (terminal states are view-only). */
const ACTIONABLE_STATUSES: readonly AppointmentStatus[] = [
  "requested",
  "under_review",
  "scheduled",
  "confirmed",
]

/** Statuses reachable via the update-status action, with their intent. */
const STATUS_TRANSITIONS: ReadonlyArray<{
  value: AppointmentStatus
  label: string
  requiresNote: boolean
}> = [
  { value: "under_review", label: "Under review (admin is looking at it)", requiresNote: false },
  { value: "scheduled", label: "Scheduled (slot proposed)", requiresNote: true },
  { value: "confirmed", label: "Confirmed (provider accepted)", requiresNote: false },
  { value: "completed", label: "Completed (visit happened)", requiresNote: false },
  { value: "cancelled", label: "Cancelled (by admin or patient)", requiresNote: true },
]

export function AdminAppointmentManager({
  requests,
  className,
}: AdminAppointmentManagerProps) {
  // Local status store — starts from fixture statuses, mutated by demo actions.
  const [statusById, setStatusById] = React.useState<Record<string, AppointmentStatus>>(() =>
    Object.fromEntries(requests.map((request) => [request.id, request.status])),
  )
  const [noteById, setNoteById] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(
      requests
        .filter((request) => request.note)
        .map((request) => [request.id, request.note as string]),
    ),
  )
  /** Session-local action log per request (demo audit trail; no AuditEvent fixtures exist). */
  const [historyById, setHistoryById] = React.useState<Record<string, string[]>>({})

  const [query, setQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all")
  const [dateFilter, setDateFilter] = React.useState<DateFilter>("all")
  const [sortKey, setSortKey] = React.useState<SortKey>("newest")
  const [flash, setFlash] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)

  const filtered = React.useMemo(() => {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean)
    const rows = requests.filter((request) => {
      const status = statusById[request.id] ?? request.status
      if (statusFilter !== "all" && status !== statusFilter) return false
      if (dateFilter === "overdue" && request.preferredDate >= DEMO_TODAY) return false
      if (
        dateFilter === "this-week" &&
        !(request.preferredDate >= DEMO_TODAY && request.preferredDate < DEMO_WEEK_END)
      ) {
        return false
      }
      if (dateFilter === "later" && request.preferredDate < DEMO_WEEK_END) return false
      if (tokens.length > 0) {
        const patient = patientById[request.patientId]
        const providerLabel =
          request.providerType === "hospital"
            ? (hospitalById[request.providerId]?.name ?? request.providerId)
            : (doctorById[request.providerId]?.name ?? request.providerId)
        const treatment = request.treatmentId
          ? (treatmentById[request.treatmentId]?.name ?? request.treatmentId)
          : "General consultation"
        const haystack = [
          request.id,
          request.concern,
          request.preferredTimeNote ?? "",
          patient?.name ?? request.patientName ?? "",
          patient?.country ?? "",
          providerLabel,
          treatment,
        ]
          .join(" ")
          .toLowerCase()
        if (!tokens.every((token) => haystack.includes(token))) return false
      }
      return true
    })
    const sorted = [...rows]
    if (sortKey === "date-asc") {
      sorted.sort(
        (a, b) => a.preferredDate.localeCompare(b.preferredDate) || a.id.localeCompare(b.id),
      )
    } else if (sortKey === "date-desc") {
      sorted.sort(
        (a, b) => b.preferredDate.localeCompare(a.preferredDate) || a.id.localeCompare(b.id),
      )
    } else {
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id))
    }
    return sorted
  }, [requests, statusById, query, statusFilter, dateFilter, sortKey])

  const [activeRequest, setActiveRequest] = React.useState<AppointmentRequest | null>(null)
  const [viewOnly, setViewOnly] = React.useState(false)
  const [nextStatus, setNextStatus] = React.useState<AppointmentStatus>("under_review")
  const [actionNote, setActionNote] = React.useState("")
  const [noteError, setNoteError] = React.useState<string | null>(null)

  function openUpdate(request: AppointmentRequest) {
    setActiveRequest(request)
    setViewOnly(false)
    const current = statusById[request.id] ?? request.status
    // Default to the first sensible transition (never a same-status no-op).
    setNextStatus(current === "requested" ? "under_review" : current)
    setActionNote("")
    setNoteError(null)
  }

  function openView(request: AppointmentRequest) {
    setActiveRequest(request)
    setViewOnly(true)
    setNextStatus(statusById[request.id] ?? request.status)
    setActionNote("")
    setNoteError(null)
  }

  function closeDialog() {
    setActiveRequest(null)
    setViewOnly(false)
  }

  async function confirmUpdate() {
    if (!activeRequest) return
    const transition = STATUS_TRANSITIONS.find((entry) => entry.value === nextStatus)
    if (transition?.requiresNote && actionNote.trim().length < 4) {
      setNoteError("Add a short note (demo) — at least 4 characters.")
      return
    }
    setPending(true)
    await delay()
    const previous = statusById[activeRequest.id] ?? activeRequest.status
    setStatusById((current) => ({ ...current, [activeRequest.id]: nextStatus }))
    updateDemoAppointmentRequest(activeRequest.id, {
      status: nextStatus,
      updatedAt: new Date().toISOString(),
      ...(actionNote.trim() ? { note: `Demo admin note: ${actionNote.trim()}` } : {}),
    })
    if (actionNote.trim()) {
      setNoteById((current) => ({
        ...current,
        [activeRequest.id]: `Demo admin note: ${actionNote.trim()}`,
      }))
    }
    setHistoryById((current) => ({
      ...current,
      [activeRequest.id]: [
        ...(current[activeRequest.id] ?? []),
        `${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} — status ${previous.replace(/_/g, " ")} → ${nextStatus.replace(/_/g, " ")} (demo)`,
      ],
    }))
    setFlash(
      `Request ${activeRequest.id} set to “${APPOINTMENT_STATUS_PRESENTATION[nextStatus].label}” in the demo session — nothing was booked and no patient was notified.`,
    )
    setPending(false)
    closeDialog()
  }

  const columns: Array<DataTableColumn<AppointmentRequest>> = [
    {
      key: "request",
      header: "Request",
      render: (request) => (
        <span className="min-w-0">
          <span className="block truncate font-medium text-foreground">{request.id}</span>
          <span className="block max-w-[22rem] truncate text-xs text-muted-foreground">
            {request.concern}
          </span>
        </span>
      ),
    },
    {
      key: "patient",
      header: "Patient",
      render: (request) => {
        const patient = patientById[request.patientId]
        return (
          <span className="min-w-0">
            <span className="block truncate text-foreground">{patient?.name ?? request.patientName ?? "Demo patient"}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {patient?.country ?? "—"} · {patient?.preferredLanguage ?? "—"}
            </span>
          </span>
        )
      },
    },
    {
      key: "provider",
      header: "Assigned provider",
      render: (request) =>
        request.providerType === "hospital"
          ? (hospitalById[request.providerId]?.name ?? request.providerId)
          : (doctorById[request.providerId]?.name ?? request.providerId),
    },
    {
      key: "treatment",
      header: "Treatment",
      render: (request) =>
        request.treatmentId
          ? (treatmentById[request.treatmentId]?.name ?? request.treatmentId)
          : "General consultation",
    },
    {
      key: "date",
      header: "Preferred date",
      render: (request) => (
        <span className="min-w-0">
          <span className="block whitespace-nowrap text-foreground">{request.preferredDate}</span>
          {request.preferredTimeNote ? (
            <span className="block truncate text-xs text-muted-foreground">
              {request.preferredTimeNote}
            </span>
          ) : null}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (request) => {
        const status = statusById[request.id] ?? request.status
        const presentation = APPOINTMENT_STATUS_PRESENTATION[status]
        return <StatusBadge status={status} label={presentation.label} tone={presentation.tone} />
      },
    },
    {
      key: "actions",
      header: "Actions",
      hideHeader: true,
      className: "text-right",
      render: (request) => {
        const status = statusById[request.id] ?? request.status
        return (
          <span className="inline-flex justify-end gap-1">
            {ACTIONABLE_STATUSES.includes(status) ? (
              <Button
                variant="outline"
                size="xs"
                onClick={() => openUpdate(request)}
                aria-label={`Update status of request ${request.id}`}
              >
                Update status
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="xs"
              onClick={() => openView(request)}
              aria-label={`View details of request ${request.id}`}
            >
              View
            </Button>
          </span>
        )
      },
    },
  ]

  return (
    <div className={cn("space-y-4", className)}>
      {flash ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-sm text-success"
        >
          <CircleCheckBigIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span>{flash}</span>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Appointment queue</CardTitle>
          <CardDescription>
            Appointment requests across the demo platform, by status and preferred date. Status
            updates and cancellation are local demo actions only.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <div className="relative">
              <SearchIcon
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search id, patient, provider, concern…"
                aria-label="Search appointment requests"
                className="pl-8"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(next) => setStatusFilter((next ?? "all") as StatusFilter)}
            >
              <SelectTrigger aria-label="Filter by status" className="w-full">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="all">All statuses</SelectItem>
                  {Object.entries(APPOINTMENT_STATUS_PRESENTATION).map(([value, presentation]) => (
                    <SelectItem key={value} value={value}>
                      {presentation.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select
              value={dateFilter}
              onValueChange={(next) => setDateFilter((next ?? "all") as DateFilter)}
            >
              <SelectTrigger aria-label="Filter by preferred date" className="w-full">
                <SelectValue placeholder="Any date" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Preferred date</SelectLabel>
                  <SelectItem value="all">Any date</SelectItem>
                  <SelectItem value="overdue">Before demo today</SelectItem>
                  <SelectItem value="this-week">Next 7 days (demo window)</SelectItem>
                  <SelectItem value="later">Later (demo window)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select value={sortKey} onValueChange={(next) => setSortKey((next ?? "newest") as SortKey)}>
              <SelectTrigger aria-label="Sort queue" className="w-full">
                <SelectValue placeholder="Newest first" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sort</SelectLabel>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="date-asc">Preferred date — earliest first</SelectItem>
                  <SelectItem value="date-desc">Preferred date — latest first</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <p aria-live="polite" className="text-xs text-muted-foreground">
            Showing {filtered.length} of {requests.length} demo appointment requests.
          </p>

          <DataTable
            columns={columns}
            rows={filtered}
            getRowKey={(row) => row.id}
            emptyMessage="No appointment requests match the demo filters."
            emptyIcon={CalendarDaysIcon}
          />
        </CardContent>
      </Card>

      <Dialog
        open={activeRequest !== null}
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
      >
        <DialogContent aria-describedby="admin-apt-dialog-desc">
          <DialogHeader>
            <DialogTitle>
              {viewOnly ? `Request ${activeRequest?.id}` : `Update status — ${activeRequest?.id}`}
            </DialogTitle>
            <DialogDescription id="admin-apt-dialog-desc">
              Demo action only — no calendar entry is created and no patient or provider is
              contacted.
            </DialogDescription>
          </DialogHeader>

          {activeRequest ? (
            <div className="space-y-4">
              <dl className="grid gap-1.5 rounded-md border bg-muted/40 p-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Patient</dt>
                  <dd className="text-right font-medium">
                    {patientById[activeRequest.patientId]?.name ?? activeRequest.patientName ?? "Demo patient"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Assigned provider</dt>
                  <dd className="text-right font-medium">
                    {activeRequest.providerType === "hospital"
                      ? (hospitalById[activeRequest.providerId]?.name ??
                        activeRequest.providerId)
                      : (doctorById[activeRequest.providerId]?.name ?? activeRequest.providerId)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Treatment</dt>
                  <dd className="text-right font-medium">
                    {activeRequest.treatmentId
                      ? (treatmentById[activeRequest.treatmentId]?.name ??
                        activeRequest.treatmentId)
                      : "General consultation"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Mode · date</dt>
                  <dd className="text-right font-medium">
                    {activeRequest.mode === "in_person"
                      ? "In person"
                      : activeRequest.mode === "video"
                        ? "Video"
                        : "Phone"}{" "}
                    · {activeRequest.preferredDate}
                    {activeRequest.preferredTimeNote
                      ? ` (${activeRequest.preferredTimeNote})`
                      : ""}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Current status</dt>
                  <dd>
                    <StatusBadge
                      status={statusById[activeRequest.id] ?? activeRequest.status}
                      label={
                        APPOINTMENT_STATUS_PRESENTATION[
                          statusById[activeRequest.id] ?? activeRequest.status
                        ].label
                      }
                      tone={
                        APPOINTMENT_STATUS_PRESENTATION[
                          statusById[activeRequest.id] ?? activeRequest.status
                        ].tone
                      }
                    />
                  </dd>
                </div>
              </dl>

              {!viewOnly ? (
                <>
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <Label htmlFor="admin-apt-status">
                      Next status
                      <span aria-hidden className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={nextStatus}
                      onValueChange={(next) => {
                        setNextStatus((next ?? "under_review") as AppointmentStatus)
                        setNoteError(null)
                      }}
                    >
                      <SelectTrigger id="admin-apt-status" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Set status to</SelectLabel>
                          {STATUS_TRANSITIONS.map((transition) => (
                            <SelectItem key={transition.value} value={transition.value}>
                              {transition.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex min-w-0 flex-col gap-1.5">
                    <Label htmlFor="admin-apt-note">
                      Note for record
                      {STATUS_TRANSITIONS.find((entry) => entry.value === nextStatus)
                        ?.requiresNote ? (
                        <span aria-hidden className="text-destructive">*</span>
                      ) : null}
                    </Label>
                    <Textarea
                      id="admin-apt-note"
                      value={actionNote}
                      onChange={(event) => {
                        setActionNote(event.target.value)
                        setNoteError(null)
                      }}
                      aria-invalid={noteError ? true : undefined}
                      aria-describedby={noteError ? "admin-apt-note-error" : undefined}
                      rows={3}
                      placeholder="Optional demo note stored on this record only"
                    />
                    {noteError ? (
                      <p
                        id="admin-apt-note-error"
                        role="alert"
                        className="text-xs font-medium text-destructive"
                      >
                        {noteError}
                      </p>
                    ) : null}
                  </div>
                </>
              ) : (
                <div className="rounded-md border bg-muted/40 p-3 text-sm">
                  <p className="font-medium text-foreground">Record (demo)</p>
                  <p className="mt-1 text-muted-foreground">
                    {noteById[activeRequest.id] ?? "No demo note recorded on this request."}
                  </p>
                  {historyById[activeRequest.id]?.length ? (
                    <ul className="mt-2 list-inside list-disc space-y-0.5 text-xs text-muted-foreground">
                      {historyById[activeRequest.id].map((entry, index) => (
                        <li key={`${entry}-${index}`}>{entry}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              )}

              {noteById[activeRequest.id] && !viewOnly ? (
                <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <CircleAlertIcon aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                  Existing note: {noteById[activeRequest.id]}
                </p>
              ) : null}
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Close
            </Button>
            {!viewOnly ? (
              <Button onClick={confirmUpdate} disabled={pending}>
                {pending ? "Saving (demo)…" : "Update status (demo)"}
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
