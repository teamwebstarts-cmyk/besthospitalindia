"use client"

/**
 * AppointmentQueueManager — appointment requests (pages/50).
 *
 * Status/date filter plus accept / reject / reschedule actions over the demo
 * appointment queue. All mutations are LOCAL mock state (the AppointmentStatus
 * union and note field are shared A01 contracts); no calendar integration, no
 * patient notification, no backend write of any kind (spec: "No calendar or
 * patient notification integration").
 *
 * Deep-link support: `?request=APT-…` opens the action dialog for that row so
 * dashboard queue links land on the action.
 */

import * as React from "react"

import { Badge } from "@/components/ui/badge"
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
import { doctorById, patientById, treatmentById } from "@/data"
import type { AppointmentRequest, AppointmentStatus, ConsultationMode } from "@/types"
import { CalendarDaysIcon, CircleAlertIcon, CircleCheckBigIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AppointmentQueueManagerProps {
  /** Scoped appointment requests for the demo hospital (fixture order). */
  requests: readonly AppointmentRequest[]
  /** Demo hospital name (provider label for hospital-targeted rows). */
  hospitalName: string
  /** Deep-linked request id from the dashboard queue, if any. */
  initialRequestKey?: string
  className?: string
}

type StatusFilter = "all" | AppointmentStatus
type DateFilter = "all" | "this-week" | "later"

const ACTIONABLE_STATUSES: readonly AppointmentStatus[] = ["requested", "under_review"]

export function AppointmentQueueManager({
  requests,
  hospitalName,
  initialRequestKey,
  className,
}: AppointmentQueueManagerProps) {
  // Local status store — starts from fixture statuses, mutated by demo actions.
  const [statusById, setStatusById] = React.useState<Record<string, AppointmentStatus>>(() =>
    Object.fromEntries(requests.map((request) => [request.id, request.status])),
  )
  const [noteById, setNoteById] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(
      requests.filter((request) => request.note).map((request) => [request.id, request.note as string]),
    ),
  )
  const [historyById, setHistoryById] = React.useState<Record<string, string[]>>({})

  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all")
  const [dateFilter, setDateFilter] = React.useState<DateFilter>("all")
  const [flash, setFlash] = React.useState<string | null>(null)

  // Demo "today" aligned with the dashboard constant.
  const demoToday = "2026-11-17"
  const weekEnd = "2026-11-24"

  const filtered = React.useMemo(() => {
    return requests.filter((request) => {
      const status = statusById[request.id] ?? request.status
      if (statusFilter !== "all" && status !== statusFilter) return false
      if (dateFilter === "this-week") {
        if (request.preferredDate < demoToday || request.preferredDate >= weekEnd) return false
      }
      if (dateFilter === "later" && request.preferredDate < weekEnd) return false
      return true
    })
  }, [requests, statusById, statusFilter, dateFilter, demoToday, weekEnd])

  const [activeRequest, setActiveRequest] = React.useState<AppointmentRequest | null>(null)
  const [actionMode, setActionMode] = React.useState<"accept" | "reject" | "reschedule">("accept")
  const [scheduledDate, setScheduledDate] = React.useState("")
  const [reason, setReason] = React.useState("")
  const [reasonError, setReasonError] = React.useState<string | null>(null)
  const [dateError, setDateError] = React.useState<string | null>(null)

  // Deep link from the dashboard queue (?request=APT-…).
  React.useEffect(() => {
    if (!initialRequestKey) return
    const match = requests.find((request) => request.id === initialRequestKey)
    if (match && ACTIONABLE_STATUSES.includes(statusById[match.id] ?? match.status)) {
      openAction(match, "accept")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRequestKey])

  function openAction(request: AppointmentRequest, mode: "accept" | "reject" | "reschedule") {
    setActiveRequest(request)
    setActionMode(mode)
    setScheduledDate(mode === "accept" ? request.preferredDate : request.preferredDate)
    setReason("")
    setReasonError(null)
    setDateError(null)
  }

  function closeDialog() {
    setActiveRequest(null)
  }

  function confirmAction() {
    if (!activeRequest) return
    if (actionMode !== "accept" && reason.trim().length < 4) {
      setReasonError("Add a short reason (demo) — at least 4 characters.")
      return
    }
    if (actionMode !== "reject" && !scheduledDate) {
      setDateError("Choose a date for the demo schedule entry.")
      return
    }

    const nextStatus: AppointmentStatus =
      actionMode === "accept" ? "scheduled" : actionMode === "reject" ? "cancelled" : "scheduled"

    setStatusById((current) => ({ ...current, [activeRequest.id]: nextStatus }))
    const noteParts: string[] = []
    if (actionMode === "reschedule" && scheduledDate) {
      noteParts.push(`Demo reschedule: proposed ${scheduledDate}`)
    }
    if (actionMode === "accept" && scheduledDate) {
      noteParts.push(`Demo schedule entry: ${scheduledDate}`)
    }
    if (actionMode === "reject" && reason.trim()) {
      noteParts.push(`Demo rejection reason: ${reason.trim()}`)
    } else if (reason.trim()) {
      noteParts.push(`Demo note: ${reason.trim()}`)
    }
    if (noteParts.length > 0) {
      setNoteById((current) => ({ ...current, [activeRequest.id]: noteParts.join(" · ") }))
    }
    setHistoryById((current) => ({
      ...current,
      [activeRequest.id]: [
        ...(current[activeRequest.id] ?? []),
        `${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} — ${
          actionMode === "accept"
            ? "Accepted (demo)"
            : actionMode === "reject"
              ? "Rejected (demo)"
              : "Reschedule proposed (demo)"
        }`,
      ],
    }))
    setFlash(
      `Request ${activeRequest.id} marked “${humanStatus(nextStatus)}” in the demo session — no patient was notified and nothing was booked.`,
    )
    closeDialog()
  }

  const columns: Array<DataTableColumn<AppointmentRequest>> = [
    {
      key: "patient",
      header: "Patient",
      render: (request) => {
        const patient = patientById[request.patientId]
        return (
          <span className="min-w-0">
            <span className="block truncate font-medium text-foreground">
              {patient?.name ?? "Demo patient"}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {patient?.country ?? "—"} · {patient?.preferredLanguage ?? "—"}
            </span>
          </span>
        )
      },
    },
    {
      key: "provider",
      header: "Provider",
      render: (request) => {
        if (request.providerType === "hospital") return hospitalName
        const doctor = doctorById[request.providerId]
        return doctor?.name ?? request.providerId
      },
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
      key: "mode",
      header: "Mode",
      render: (request) => humanMode(request.mode),
    },
    {
      key: "status",
      header: "Status",
      render: (request) => (
        <StatusBadge status={statusById[request.id] ?? request.status} />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      hideHeader: true,
      className: "text-right",
      render: (request) => {
        const status = statusById[request.id] ?? request.status
        const actionable = ACTIONABLE_STATUSES.includes(status)
        if (!actionable) {
          return (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => openActionView(request)}
              aria-label={`View details for ${request.id}`}
            >
              View
            </Button>
          )
        }
        return (
          <span className="inline-flex justify-end gap-1">
            <Button
              variant="outline"
              size="xs"
              onClick={() => openAction(request, "accept")}
              aria-label={`Accept request ${request.id}`}
            >
              Accept
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => openAction(request, "reschedule")}
              aria-label={`Reschedule request ${request.id}`}
            >
              Reschedule
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => openAction(request, "reject")}
              aria-label={`Reject request ${request.id}`}
              className="text-destructive hover:text-destructive"
            >
              Reject
            </Button>
          </span>
        )
      },
    },
  ]

  function openActionView(request: AppointmentRequest) {
    setActiveRequest(request)
    setActionMode("accept")
    setReason("")
    setReasonError(null)
    setDateError(null)
    // View-only dialog: reuse reject mode UI hidden behind actionMode === view.
    setViewOnly(true)
  }

  const [viewOnly, setViewOnly] = React.useState(false)

  const statusOptions: Array<{ value: StatusFilter; label: string }> = [
    { value: "all", label: "All statuses" },
    { value: "requested", label: "Requested" },
    { value: "under_review", label: "Under review" },
    { value: "scheduled", label: "Scheduled" },
    { value: "confirmed", label: "Confirmed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "completed", label: "Completed" },
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
          <CardTitle>Appointment requests</CardTitle>
          <CardDescription>
            Requests against the demo hospital or its associated doctors. Accept / reschedule /
            reject are local demo actions only.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          <div className="grid gap-2 sm:grid-cols-2">
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
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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
                  <SelectItem value="this-week">Next 7 days (demo window)</SelectItem>
                  <SelectItem value="later">Later (demo window)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <p aria-live="polite" className="text-xs text-muted-foreground">
            Showing {filtered.length} of {requests.length} demo requests.
          </p>

          <DataTable
            columns={columns}
            rows={[...filtered]}
            getRowKey={(row) => row.id}
            emptyMessage="No appointment requests match the demo filters."
            emptyIcon={CalendarDaysIcon}
          />
        </CardContent>
      </Card>

      <Dialog
        open={activeRequest !== null}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog()
            setViewOnly(false)
          }
        }}
      >
        <DialogContent aria-describedby="apt-dialog-desc">
          <DialogHeader>
            <DialogTitle>
              {viewOnly
                ? `Request ${activeRequest?.id}`
                : actionMode === "accept"
                  ? `Accept ${activeRequest?.id}`
                  : actionMode === "reject"
                    ? `Reject ${activeRequest?.id}`
                    : `Propose reschedule — ${activeRequest?.id}`}
            </DialogTitle>
            <DialogDescription id="apt-dialog-desc">
              Demo action only — no calendar entry is created and no patient is contacted.
            </DialogDescription>
          </DialogHeader>

          {activeRequest ? (
            <div className="space-y-4">
              <dl className="grid gap-1.5 rounded-md border bg-muted/40 p-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Patient</dt>
                  <dd className="text-right font-medium">
                    {patientById[activeRequest.patientId]?.name ?? "Demo patient"}
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
                  <dt className="text-muted-foreground">Concern</dt>
                  <dd className="max-w-[60%] text-right text-muted-foreground">
                    {activeRequest.concern}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Current status</dt>
                  <dd>
                    <StatusBadge status={statusById[activeRequest.id] ?? activeRequest.status} />
                  </dd>
                </div>
              </dl>

              {!viewOnly ? (
                <>
                  {actionMode !== "reject" ? (
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <Label htmlFor="apt-date">
                        {actionMode === "accept" ? "Schedule date" : "Proposed date"}
                        <span aria-hidden className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="apt-date"
                        type="date"
                        value={scheduledDate}
                        min={demoToday}
                        onChange={(event) => {
                          setScheduledDate(event.target.value)
                          setDateError(null)
                        }}
                        aria-invalid={dateError ? true : undefined}
                        aria-describedby={dateError ? "apt-date-error" : undefined}
                      />
                      {dateError ? (
                        <p id="apt-date-error" role="alert" className="text-xs font-medium text-destructive">
                          {dateError}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="flex min-w-0 flex-col gap-1.5">
                    <Label htmlFor="apt-reason">
                      {actionMode === "reject" ? "Reason (required)" : "Note for record (optional)"}
                    </Label>
                    <Textarea
                      id="apt-reason"
                      value={reason}
                      onChange={(event) => {
                        setReason(event.target.value)
                        setReasonError(null)
                      }}
                      aria-invalid={reasonError ? true : undefined}
                      aria-describedby={reasonError ? "apt-reason-error" : undefined}
                      rows={3}
                      placeholder={
                        actionMode === "reject"
                          ? "Demo reason — shown nowhere else"
                          : "Optional demo note stored on this record only"
                      }
                    />
                    {reasonError ? (
                      <p id="apt-reason-error" role="alert" className="text-xs font-medium text-destructive">
                        {reasonError}
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

              {(noteById[activeRequest.id] && !viewOnly) ? (
                <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <CircleAlertIcon aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                  Existing note: {noteById[activeRequest.id]}
                </p>
              ) : null}
            </div>
          ) : null}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                closeDialog()
                setViewOnly(false)
              }}
            >
              Close
            </Button>
            {!viewOnly ? (
              <Button
                variant={actionMode === "reject" ? "destructive" : "default"}
                onClick={confirmAction}
              >
                {actionMode === "accept"
                  ? "Accept (demo)"
                  : actionMode === "reject"
                    ? "Reject (demo)"
                    : "Propose reschedule (demo)"}
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <p className="text-xs text-muted-foreground">
        Demo boundary: statuses and notes update local state only. No scheduling system, calendar
        or patient notification exists behind this portal.{" "}
        <Badge variant="outline">Mock phase</Badge>
      </p>
    </div>
  )
}

function humanStatus(status: AppointmentStatus): string {
  return status.replace(/_/g, " ")
}

function humanMode(mode: ConsultationMode): string {
  if (mode === "in_person") return "In person"
  if (mode === "video") return "Video"
  return "Phone"
}
