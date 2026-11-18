"use client"

/**
 * AppointmentsClient — /doctor-portal/appointments (pages/61).
 *
 * Doctor-side operational queue over the demo doctor's AppointmentRequest
 * fixtures. Interactions per spec: filter; accept/reject (with reason)
 * /reschedule — all local mock state via the AppointmentsClientState reducer;
 * nothing notifies any patient ("No actual patient notification" acceptance).
 *
 * Layout: DataTable on desktop; stacked request cards replace the table below
 * `sm` (pages/61 responsive: "Cards on mobile"). The table lives in a
 * deliberate horizontal scroll container for mid widths (pages/22 §8).
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
import { Textarea } from "@/components/ui/textarea"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { ROUTES } from "@/constants/routes"
import { formatDate, formatDateTime } from "@/features/doctor-portal/format"
import {
  patientDisplayName,
  treatmentLabel,
} from "@/features/doctor-portal/selectors"
import { dateNotInPast, required, validate } from "@/lib/validation"
import { cn } from "@/lib/utils"
import { updateDemoAppointmentRequest } from "@/features/appointments/demo-appointment-store"
import type { AppointmentRequest, AppointmentStatus } from "@/types"

// ---------------------------------------------------------------------------
// Local mock state machine — mirrors AppointmentStatus, never touches fixtures
// ---------------------------------------------------------------------------

interface AppointmentChange {
  status: AppointmentStatus
  /** ISO date for reschedules; reason for rejections. */
  detail?: string
  at: string
}

export interface AppointmentRecord {
  request: AppointmentRequest
  /** Latest local change, or null while untouched. */
  change: AppointmentChange | null
}

export interface AppointmentsClientState {
  records: AppointmentRecord[]
  notice: string | null
}

export type AppointmentsAction =
  | { type: "accept"; id: string }
  | { type: "reject"; id: string; reason: string }
  | { type: "reschedule"; id: string; date: string; note: string }
  | { type: "dismiss-notice" }

const TERMINAL_STATUSES = new Set<AppointmentStatus>(["cancelled", "completed"])

function nowIso(): string {
  return new Date().toISOString()
}

export function appointmentsReducer(
  state: AppointmentsClientState,
  action: AppointmentsAction,
): AppointmentsClientState {
  switch (action.type) {
    case "accept": {
      const record = state.records.find((entry) => entry.request.id === action.id)
      if (!record || TERMINAL_STATUSES.has(record.request.status)) return state
      return {
        ...state,
        notice: `Demo appointment APT ${action.id} accepted locally — the demo patient was NOT notified (no notification exists in this phase).`,
        records: state.records.map((entry) =>
          entry.request.id === action.id
            ? { ...entry, change: { status: "confirmed", at: nowIso() } }
            : entry,
        ),
      }
    }
    case "reject": {
      const record = state.records.find((entry) => entry.request.id === action.id)
      if (!record || TERMINAL_STATUSES.has(record.request.status)) return state
      return {
        ...state,
        notice: `Demo appointment ${action.id} rejected locally with a recorded reason — the demo patient was NOT notified.`,
        records: state.records.map((entry) =>
          entry.request.id === action.id
            ? { ...entry, change: { status: "cancelled", detail: action.reason, at: nowIso() } }
            : entry,
        ),
      }
    }
    case "reschedule": {
      const record = state.records.find((entry) => entry.request.id === action.id)
      if (!record || TERMINAL_STATUSES.has(record.request.status)) return state
      return {
        ...state,
        notice: `Demo appointment ${action.id} moved locally to ${formatDate(action.date)} — the demo patient was NOT notified.`,
        records: state.records.map((entry) =>
          entry.request.id === action.id
            ? {
                ...entry,
                change: {
                  status: "scheduled",
                  detail: action.note.trim() === "" ? undefined : action.note.trim(),
                  at: nowIso(),
                },
              }
            : entry,
        ),
      }
    }
    case "dismiss-notice":
      return { ...state, notice: null }
    default:
      return state
  }
}

export function makeInitialAppointmentsState(
  requests: readonly AppointmentRequest[],
): AppointmentsClientState {
  return {
    records: requests.map((request) => ({ request, change: null })),
    notice: null,
  }
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

type StatusFilter = "all" | "open" | "action_needed" | AppointmentStatus

const FILTER_OPTIONS: ReadonlyArray<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All requests" },
  { value: "action_needed", label: "Needs my response" },
  { value: "confirmed", label: "Confirmed" },
  { value: "scheduled", label: "Rescheduled (pending)" },
  { value: "requested", label: "Requested" },
  { value: "under_review", label: "Under review" },
  { value: "cancelled", label: "Cancelled / rejected" },
  { value: "completed", label: "Completed" },
]

function matchesFilter(record: AppointmentRecord, filter: StatusFilter): boolean {
  const request = record.request
  const changed = record.change !== null
  switch (filter) {
    case "all":
      return true
    case "open":
      return !TERMINAL_STATUSES.has(request.status)
    case "action_needed":
      return !changed && (request.status === "requested" || request.status === "under_review")
    case "confirmed":
      return changed ? record.change?.status === "confirmed" : request.status === "confirmed"
    case "scheduled":
      return changed ? record.change?.status === "scheduled" : request.status === "scheduled"
    case "requested":
      return !changed && request.status === "requested"
    case "under_review":
      return !changed && request.status === "under_review"
    case "cancelled":
      return changed
        ? record.change?.status === "cancelled"
        : request.status === "cancelled"
    case "completed":
      return request.status === "completed"
    default:
      return true
  }
}

// ---------------------------------------------------------------------------
// Action dialogs
// ---------------------------------------------------------------------------

type DialogState =
  | { kind: "none" }
  | { kind: "reject"; id: string; patientName: string }
  | { kind: "reschedule"; id: string; patientName: string; currentDate: string }

const MODE_LABELS: Record<AppointmentRequest["mode"], string> = {
  in_person: "In person",
  video: "Video",
  phone: "Phone",
}

function modeLabel(mode: AppointmentRequest["mode"]): string {
  return MODE_LABELS[mode]
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface AppointmentsClientProps {
  requests: readonly AppointmentRequest[]
  className?: string
}

export function AppointmentsClient({ requests, className }: AppointmentsClientProps) {
  const [state, dispatch] = useReducer(
    appointmentsReducer,
    requests,
    makeInitialAppointmentsState,
  )
  const [filter, setFilter] = useState<StatusFilter>("all")
  const [dialog, setDialog] = useState<DialogState>({ kind: "none" })
  const [rejectReason, setRejectReason] = useState("")
  const [rejectError, setRejectError] = useState<string | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState("")
  const [rescheduleNote, setRescheduleNote] = useState("")
  const [rescheduleError, setRescheduleError] = useState<string | null>(null)

  const visible = useMemo(
    () => state.records.filter((record) => matchesFilter(record, filter)),
    [state.records, filter],
  )

  const actionable = useMemo(
    () =>
      state.records.filter(
        (record) =>
          record.change === null &&
          (record.request.status === "requested" ||
            record.request.status === "under_review"),
      ),
    [state.records],
  )

  function handleAccept(id: string) {
    dispatch({ type: "accept", id })
    updateDemoAppointmentRequest(id, { status: "confirmed", updatedAt: new Date().toISOString() })
  }

  function openReject(id: string, patientName: string) {
    setRejectReason("")
    setRejectError(null)
    setDialog({ kind: "reject", id, patientName })
  }

  function confirmReject() {
    if (dialog.kind !== "reject") return
    const errors = validate({ reason: [required("Rejection reason")] }, { reason: rejectReason })
    if (errors.reason) {
      setRejectError(errors.reason)
      return
    }
    dispatch({ type: "reject", id: dialog.id, reason: rejectReason.trim() })
    updateDemoAppointmentRequest(dialog.id, {
      status: "cancelled",
      note: rejectReason.trim(),
      updatedAt: new Date().toISOString(),
    })
    setDialog({ kind: "none" })
  }

  function openReschedule(record: AppointmentRecord) {
    setRescheduleDate(record.request.preferredDate)
    setRescheduleNote(record.request.preferredTimeNote ?? "")
    setRescheduleError(null)
    setDialog({
      kind: "reschedule",
      id: record.request.id,
      patientName: (record.request.patientName ?? patientDisplayName(record.request.patientId)),
      currentDate: record.request.preferredDate,
    })
  }

  function confirmReschedule() {
    if (dialog.kind !== "reschedule") return
    const errors = validate(
      { date: [required("New date"), dateNotInPast()] },
      { date: rescheduleDate },
    )
    if (errors.date) {
      setRescheduleError(errors.date)
      return
    }
    dispatch({
      type: "reschedule",
      id: dialog.id,
      date: rescheduleDate,
      note: rescheduleNote,
    })
    updateDemoAppointmentRequest(dialog.id, {
      status: "scheduled",
      preferredDate: rescheduleDate,
      note: rescheduleNote.trim() || undefined,
      updatedAt: new Date().toISOString(),
    })
    setDialog({ kind: "none" })
  }

  // -- Table columns (desktop) -----------------------------------------------
  const columns: Array<DataTableColumn<AppointmentRecord>> = [
    {
      key: "patient",
      header: "Patient",
      render: (record) => (
        <div className="min-w-0 space-y-0.5">
          <p className="truncate font-medium text-foreground">
            {(record.request.patientName ?? patientDisplayName(record.request.patientId))}
          </p>
          <p className="text-xs text-muted-foreground">
            {record.request.id} · {modeLabel(record.request.mode)}
          </p>
        </div>
      ),
    },
    {
      key: "treatment",
      header: "Concern",
      render: (record) => (
        <div className="min-w-0 max-w-64 space-y-0.5">
          <p className="truncate text-foreground">
            {treatmentLabel(record.request.treatmentId) ?? "General consultation"}
          </p>
          <p className="truncate text-xs text-muted-foreground" title={record.request.concern}>
            {record.request.concern}
          </p>
        </div>
      ),
    },
    {
      key: "date",
      header: "Preferred date",
      render: (record) => (
        <div className="space-y-0.5">
          <p className="text-foreground">{formatDate(record.request.preferredDate)}</p>
          {record.request.preferredTimeNote ? (
            <p className="text-xs text-muted-foreground">{record.request.preferredTimeNote}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (record) => (
        <div className="space-y-1">
          <StatusBadge status={record.change?.status ?? record.request.status} />
          {record.change ? (
            <p className="text-xs text-muted-foreground">
              Updated locally {formatDateTime(record.change.at)}
              {record.change.detail ? ` — ${record.change.detail}` : ""}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      hideHeader: false,
      render: (record) => {
        const terminal =
          record.change !== null || TERMINAL_STATUSES.has(record.request.status)
        const id = record.request.id
        const patientName = (record.request.patientName ?? patientDisplayName(record.request.patientId))
        return terminal ? (
          <Badge variant="outline" className="text-muted-foreground">
            No actions
          </Badge>
        ) : (
          <div className="flex justify-end gap-1.5">
            <Button size="xs" onClick={() => handleAccept(id)}>
              Accept
            </Button>
            <Button
              size="xs"
              variant="outline"
              onClick={() => openReschedule(record)}
            >
              Reschedule
            </Button>
            <Button
              size="xs"
              variant="destructive"
              onClick={() => openReject(id, patientName)}
            >
              Reject
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filter + count toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Label htmlFor="appointments-filter" className="text-sm text-muted-foreground">
            Show
          </Label>
          <Select
            value={filter}
            onValueChange={(value) => {
              if (typeof value === "string") setFilter(value as StatusFilter)
            }}
          >
            <SelectTrigger id="appointments-filter" className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {visible.length} of {state.records.length} requests
          {actionable.length > 0 ? ` · ${actionable.length} awaiting response` : ""}
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
          title="No requests match this filter"
          description="Switch the filter to “All requests”, or check the consultation queue for enquiry traffic."
          action={{
            label: "Show all requests",
            onClick: () => setFilter("all"),
          }}
        />
      ) : (
        <>
          {/* Desktop / tablet: data table in a deliberate scroll container */}
          <div className="hidden sm:block">
            <DataTable
              columns={columns}
              rows={visible}
              getRowKey={(record) => record.request.id}
              emptyMessage="No appointment requests to show."
            />
          </div>

          {/* Mobile: stacked request cards */}
          <ul className="space-y-3 sm:hidden" aria-label="Appointment requests">
            {visible.map((record) => {
              const terminal =
                record.change !== null || TERMINAL_STATUSES.has(record.request.status)
              const id = record.request.id
              return (
                <li key={id} className="rounded-lg border p-4">
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-foreground">
                        {(record.request.patientName ?? patientDisplayName(record.request.patientId))}
                      </p>
                      <StatusBadge status={record.change?.status ?? record.request.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {record.request.id} · {modeLabel(record.request.mode)} ·{" "}
                      {formatDate(record.request.preferredDate)}
                    </p>
                    <p className="text-sm text-foreground">
                      {treatmentLabel(record.request.treatmentId) ?? "General consultation"}
                    </p>
                    <p className="text-xs text-muted-foreground">{record.request.concern}</p>
                    {record.change ? (
                      <p className="text-xs text-muted-foreground">
                        Updated locally {formatDateTime(record.change.at)}
                        {record.change.detail ? ` — ${record.change.detail}` : ""}
                      </p>
                    ) : null}
                  </div>
                  {!terminal ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => handleAccept(id)}>
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openReschedule(record)}
                      >
                        Reschedule
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openReject(id, (record.request.patientName ?? patientDisplayName(record.request.patientId)))}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <Badge variant="outline" className="mt-3 text-muted-foreground">
                      No actions
                    </Badge>
                  )}
                </li>
              )
            })}
          </ul>
        </>
      )}

      <p className="text-xs text-muted-foreground">
        All actions are local demo state. Nothing is sent, booked or notified — see{" "}
        <Link
          href={ROUTES.doctorPortal.settings}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          settings
        </Link>{" "}
        for the demo boundary summary.
      </p>

      {/* Reject dialog */}
      <Dialog
        open={dialog.kind === "reject"}
        onOpenChange={(open) => {
          if (!open) setDialog({ kind: "none" })
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject appointment request (demo)</DialogTitle>
            <DialogDescription>
              {dialog.kind === "reject"
                ? `Record why you are declining ${dialog.patientName}'s demo request. The reason stays in this page's local state — the demo patient is never notified.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="reject-reason">
              Reason <span aria-hidden className="text-destructive"> *</span>
            </Label>
            <Textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(event) => {
                setRejectReason(event.target.value)
                setRejectError(null)
              }}
              rows={3}
              placeholder="e.g. Away at a conference that week (demo reason)"
              aria-invalid={rejectError ? true : undefined}
              aria-describedby={rejectError ? "reject-reason-error" : undefined}
            />
            {rejectError ? (
              <p id="reject-reason-error" className="text-xs font-medium text-destructive">
                {rejectError}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ kind: "none" })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmReject}>
              Reject request (demo)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule dialog */}
      <Dialog
        open={dialog.kind === "reschedule"}
        onOpenChange={(open) => {
          if (!open) setDialog({ kind: "none" })
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule appointment request (demo)</DialogTitle>
            <DialogDescription>
              {dialog.kind === "reschedule"
                ? `Propose a new date for ${dialog.patientName}'s demo request (currently ${formatDate(dialog.currentDate)}). The change stays local — the demo patient is never notified.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="reschedule-date">
                New preferred date <span aria-hidden className="text-destructive"> *</span>
              </Label>
              <Input
                id="reschedule-date"
                type="date"
                value={rescheduleDate}
                onChange={(event) => {
                  setRescheduleDate(event.target.value)
                  setRescheduleError(null)
                }}
                aria-invalid={rescheduleError ? true : undefined}
                aria-describedby={rescheduleError ? "reschedule-date-error" : undefined}
              />
              {rescheduleError ? (
                <p id="reschedule-date-error" className="text-xs font-medium text-destructive">
                  {rescheduleError}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reschedule-note">Note (optional)</Label>
              <Input
                id="reschedule-note"
                value={rescheduleNote}
                onChange={(event) => setRescheduleNote(event.target.value)}
                placeholder='e.g. "morning preferred (demo)"'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ kind: "none" })}>
              Cancel
            </Button>
            <Button onClick={confirmReschedule}>Reschedule (demo)</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
