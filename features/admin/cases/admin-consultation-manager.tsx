"use client"

/**
 * AdminConsultationManager — /admin/consultations (pages/25 §B; FR-007/FR-019).
 *
 * The consultation queue is the admin side of the IUF-supported Free
 * Consultation initiative: patient enquiries (frozen PatientEnquiry contract)
 * move through the documented workflow — new enquiry → admin review →
 * validate patient information and requirements → assign hospital or doctor →
 * provider accepts (proceed toward appointment) or declines (reassign /
 * inform patient) → patient notification (demo record) → case closure.
 *
 * Assignments and notifications are LOCAL demo state. The enquiry contract
 * has no assigned-provider field, so assignment lives in session state only
 * (contract gap logged in the A12 report — A01 owns data/contracts). Free vs
 * standard scope is shown only where fixtures declare it: an enquiry linked
 * to a `free_consultation` medical-tourism case displays the IUF scope; all
 * other rows are described neutrally and never promised as free.
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
import {
  doctorById,
  doctors,
  hospitalById,
  hospitals,
  specialtyById,
  tourismCases,
} from "@/data"
import {
  CONSULTATION_TYPE_PRESENTATION,
  ENQUIRY_NEXT_STEP,
  ENQUIRY_STATUS_PRESENTATION,
} from "@/features/admin/cases/case-presentations"
import { delay } from "@/features/admin/cases/demo-latency"
import {
  CircleAlertIcon,
  CircleCheckBigIcon,
  MessagesSquareIcon,
  SearchIcon,
  SparklesIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { PatientEnquiry, PatientEnquiryStatus } from "@/types"

export interface AdminConsultationManagerProps {
  /** All patient-enquiry fixtures, fixture order (A01 `patientEnquiries`). */
  enquiries: readonly PatientEnquiry[]
  className?: string
}

type StatusFilter = "all" | PatientEnquiryStatus

/** Next statuses reachable in the documented admin workflow. */
const STATUS_TRANSITIONS: ReadonlyArray<{
  value: PatientEnquiryStatus
  label: string
}> = [
  { value: "under_review", label: "Under review (admin validating)" },
  { value: "assigned", label: "Assigned to provider" },
  { value: "responded", label: "Responded (patient informed)" },
  { value: "closed", label: "Closed (case finished)" },
]

/** Demo provider options for the assignment select (fixture-derived, frozen ids). */
const HOSPITAL_OPTIONS = hospitals.map((hospital) => ({ id: hospital.id, name: hospital.name }))
const DOCTOR_OPTIONS = doctors.map((doctor) => ({ id: doctor.id, name: doctor.name }))

/** Enquiry id → declared consultation type, via linked medical-tourism cases. */
const CONSULTATION_TYPE_BY_ENQUIRY: Readonly<Record<string, string>> = Object.fromEntries(
  tourismCases.map((tourismCase) => [tourismCase.enquiryId, tourismCase.type]),
)

interface AssignedProvider {
  type: "hospital" | "doctor"
  id: string
}

function providerLabel(assignment: AssignedProvider | undefined): string {
  if (!assignment) return "Unassigned"
  return assignment.type === "hospital"
    ? (hospitalById[assignment.id]?.name ?? assignment.id)
    : (doctorById[assignment.id]?.name ?? assignment.id)
}

export function AdminConsultationManager({
  enquiries,
  className,
}: AdminConsultationManagerProps) {
  const [statusById, setStatusById] = React.useState<Record<string, PatientEnquiryStatus>>(() =>
    Object.fromEntries(enquiries.map((enquiry) => [enquiry.id, enquiry.status])),
  )
  /** Session-local assignment: enquiry id → assigned provider. */
  const [assignmentById, setAssignmentById] = React.useState<Record<string, AssignedProvider>>({})
  /** Session-local admin note per enquiry. */
  const [noteById, setNoteById] = React.useState<Record<string, string>>({})
  const [historyById, setHistoryById] = React.useState<Record<string, string[]>>({})

  const [query, setQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all")
  const [flash, setFlash] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)

  const filtered = React.useMemo(() => {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean)
    return enquiries.filter((enquiry) => {
      const status = statusById[enquiry.id] ?? enquiry.status
      if (statusFilter !== "all" && status !== statusFilter) return false
      if (tokens.length > 0) {
        const specialty = specialtyById[enquiry.specialty]
        const haystack = [
          enquiry.id,
          enquiry.patientName,
          enquiry.email,
          enquiry.country,
          enquiry.concern,
          specialty?.name ?? enquiry.specialty,
        ]
          .join(" ")
          .toLowerCase()
        if (!tokens.every((token) => haystack.includes(token))) return false
      }
      return true
    })
  }, [enquiries, statusById, query, statusFilter])

  const [activeEnquiry, setActiveEnquiry] = React.useState<PatientEnquiry | null>(null)
  const [nextStatus, setNextStatus] = React.useState<PatientEnquiryStatus>("under_review")
  const [assignType, setAssignType] = React.useState<"none" | "hospital" | "doctor">("none")
  const [assignId, setAssignId] = React.useState<string>("")
  const [actionNote, setActionNote] = React.useState("")
  const [assignError, setAssignError] = React.useState<string | null>(null)

  function openCase(enquiry: PatientEnquiry) {
    setActiveEnquiry(enquiry)
    const current = statusById[enquiry.id] ?? enquiry.status
    setNextStatus(current === "submitted" ? "under_review" : current)
    const existing = assignmentById[enquiry.id]
    setAssignType(existing ? existing.type : "none")
    setAssignId(existing ? existing.id : "")
    setActionNote(noteById[enquiry.id] ?? "")
    setAssignError(null)
  }

  function closeDialog() {
    setActiveEnquiry(null)
    setAssignError(null)
  }

  async function confirmUpdate() {
    if (!activeEnquiry) return
    const assigning = assignType !== "none"
    if (assigning && !assignId) {
      setAssignError("Choose a specific provider to assign (demo).")
      return
    }
    setPending(true)
    await delay()
    const previous = statusById[activeEnquiry.id] ?? activeEnquiry.status
    // Assigning a still-open case moves it forward in the workflow.
    const effectiveNext: PatientEnquiryStatus =
      assigning && (previous === "submitted" || previous === "under_review")
        ? "assigned"
        : nextStatus

    if (assigning) {
      const assignment: AssignedProvider = {
        type: assignType as "hospital" | "doctor",
        id: assignId,
      }
      setAssignmentById((current) => ({ ...current, [activeEnquiry.id]: assignment }))
    }
    setStatusById((current) => ({ ...current, [activeEnquiry.id]: effectiveNext }))
    if (actionNote.trim()) {
      setNoteById((current) => ({
        ...current,
        [activeEnquiry.id]: `Demo admin note: ${actionNote.trim()}`,
      }))
    }
    setHistoryById((current) => ({
      ...current,
      [activeEnquiry.id]: [
        ...(current[activeEnquiry.id] ?? []),
        `${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} — ${
          assigning
            ? `assigned to ${providerLabel({ type: assignType as "hospital" | "doctor", id: assignId })} (demo)`
            : `status ${previous.replace(/_/g, " ")} → ${effectiveNext.replace(/_/g, " ")} (demo)`
        }`,
      ],
    }))
    setFlash(
      effectiveNext === "closed"
        ? `Case ${activeEnquiry.id} closed in the demo session — the record stays in the queue for reporting review. No real closure letter exists.`
        : `Case ${activeEnquiry.id} updated in the demo session — no real patient notification or provider assignment occurred.`,
    )
    setPending(false)
    closeDialog()
  }

  const columns: Array<DataTableColumn<PatientEnquiry>> = [
    {
      key: "case",
      header: "Case",
      render: (enquiry) => (
        <span className="min-w-0">
          <span className="block truncate font-medium text-foreground">{enquiry.id}</span>
          <span className="block max-w-[20rem] truncate text-xs text-muted-foreground">
            {enquiry.concern}
          </span>
        </span>
      ),
    },
    {
      key: "patient",
      header: "Patient",
      render: (enquiry) => (
        <span className="min-w-0">
          <span className="block truncate text-foreground">{enquiry.patientName}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {enquiry.country} · {enquiry.preferredLanguage}
          </span>
        </span>
      ),
    },
    {
      key: "specialty",
      header: "Specialty",
      render: (enquiry) => specialtyById[enquiry.specialty]?.name ?? enquiry.specialty,
    },
    {
      key: "assigned",
      header: "Assigned provider",
      render: (enquiry) => providerLabel(assignmentById[enquiry.id]),
    },
    {
      key: "status",
      header: "Status",
      render: (enquiry) => {
        const status = statusById[enquiry.id] ?? enquiry.status
        const presentation = ENQUIRY_STATUS_PRESENTATION[status]
        return <StatusBadge status={status} label={presentation.label} tone={presentation.tone} />
      },
    },
    {
      key: "actions",
      header: "Actions",
      hideHeader: true,
      className: "text-right",
      render: (enquiry) => {
        const status = statusById[enquiry.id] ?? enquiry.status
        return (
          <Button
            variant={status === "closed" ? "ghost" : "outline"}
            size="xs"
            onClick={() => openCase(enquiry)}
            aria-label={`Open consultation case ${enquiry.id}`}
          >
            {status === "closed" ? "View" : "Review case"}
          </Button>
        )
      },
    },
  ]

  const activeStatus = activeEnquiry
    ? (statusById[activeEnquiry.id] ?? activeEnquiry.status)
    : "submitted"
  const activeOriginType = activeEnquiry
    ? CONSULTATION_TYPE_BY_ENQUIRY[activeEnquiry.id]
    : undefined

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
          <CardTitle>Consultation queue</CardTitle>
          <CardDescription>
            Patient enquiries from the free-consultation initiative and general enquiry forms.
            Review, assign a provider, and close cases — all local demo actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="relative">
              <SearchIcon
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search id, patient, specialty, concern…"
                aria-label="Search consultation cases"
                className="pl-8"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(next) => setStatusFilter((next ?? "all") as StatusFilter)}
            >
              <SelectTrigger aria-label="Filter cases by status" className="w-full">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="all">All statuses</SelectItem>
                  {Object.entries(ENQUIRY_STATUS_PRESENTATION).map(([value, presentation]) => (
                    <SelectItem key={value} value={value}>
                      {presentation.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <p aria-live="polite" className="text-xs text-muted-foreground">
            Showing {filtered.length} of {enquiries.length} demo consultation cases.
          </p>

          <DataTable
            columns={columns}
            rows={filtered}
            getRowKey={(row) => row.id}
            emptyMessage="No consultation cases match the demo filters."
            emptyIcon={MessagesSquareIcon}
          />
        </CardContent>
      </Card>

      <Dialog
        open={activeEnquiry !== null}
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
      >
        <DialogContent aria-describedby="admin-consult-dialog-desc">
          <DialogHeader>
            <DialogTitle>Consultation case — {activeEnquiry?.id}</DialogTitle>
            <DialogDescription id="admin-consult-dialog-desc">
              Demo workflow only — assignment and closure update this demo session; no provider is
              contacted and no patient is notified.
            </DialogDescription>
          </DialogHeader>

          {activeEnquiry ? (
            <div className="space-y-4">
              {/* Free vs paid scope — only what the fixtures declare, never invented. */}
              <p className="flex items-start gap-1.5 rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
                <SparklesIcon aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                <span>
                  {activeOriginType === "free_consultation" ? (
                    <>
                      Submitted through the IUF-supported free consultation initiative — enquiry
                      review and provider matching carry no consultation-fee label beyond the
                      initiative scope.
                      <Badge variant="outline" className="ml-1 align-middle">
                        {CONSULTATION_TYPE_PRESENTATION.free_consultation.label}
                      </Badge>
                    </>
                  ) : activeOriginType ? (
                    <>
                      Linked demo case type:{" "}
                      {
                        CONSULTATION_TYPE_PRESENTATION[
                          activeOriginType as keyof typeof CONSULTATION_TYPE_PRESENTATION
                        ].label
                      }
                      — not described as free; any costs sit with the chosen provider (demo copy).
                    </>
                  ) : (
                    <>Standard patient enquiry — no free-consultation linkage exists in the demo fixtures, so no free-service promise is attached to this case.</>
                  )}
                </span>
              </p>

              <dl className="grid gap-1.5 rounded-md border bg-muted/40 p-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Patient</dt>
                  <dd className="text-right font-medium">{activeEnquiry.patientName}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Contact (demo)</dt>
                  <dd className="text-right font-medium">
                    {activeEnquiry.email} · {activeEnquiry.phone}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Specialty / requirement</dt>
                  <dd className="max-w-[60%] text-right font-medium">
                    {specialtyById[activeEnquiry.specialty]?.name ?? activeEnquiry.specialty}
                    {activeEnquiry.preferredDate
                      ? ` · preferred from ${activeEnquiry.preferredDate}`
                      : ""}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Reports (demo labels)</dt>
                  <dd className="max-w-[60%] text-right text-muted-foreground">
                    {activeEnquiry.reportNames.length > 0
                      ? activeEnquiry.reportNames.join(", ")
                      : "None attached"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Provider preference</dt>
                  <dd className="max-w-[60%] text-right font-medium">
                    {activeEnquiry.preferredProviderId
                      ? (hospitalById[activeEnquiry.preferredProviderId]?.name ??
                        doctorById[activeEnquiry.preferredProviderId]?.name ??
                        activeEnquiry.preferredProviderId)
                      : "No preference stated"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Currently assigned</dt>
                  <dd className="text-right font-medium">
                    {providerLabel(assignmentById[activeEnquiry.id])}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Concern</dt>
                  <dd className="max-w-[60%] text-right text-muted-foreground">
                    {activeEnquiry.concern}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Current status</dt>
                  <dd>
                    <StatusBadge
                      status={activeStatus}
                      label={ENQUIRY_STATUS_PRESENTATION[activeStatus].label}
                      tone={ENQUIRY_STATUS_PRESENTATION[activeStatus].tone}
                    />
                  </dd>
                </div>
              </dl>

              <p className="text-xs text-muted-foreground">
                Next step: {ENQUIRY_NEXT_STEP[activeStatus]}
              </p>

              <div className="flex min-w-0 flex-col gap-1.5">
                <Label htmlFor="admin-consult-assign">Assign provider (demo)</Label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Select
                    value={assignType}
                    onValueChange={(next) => {
                      setAssignType((next ?? "none") as typeof assignType)
                      setAssignId("")
                      setAssignError(null)
                    }}
                  >
                    <SelectTrigger
                      id="admin-consult-assign"
                      aria-label="Provider type to assign"
                      className="w-full"
                    >
                      <SelectValue placeholder="Not assigning" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Provider type</SelectLabel>
                        <SelectItem value="none">Not assigning now</SelectItem>
                        <SelectItem value="hospital">Hospital</SelectItem>
                        <SelectItem value="doctor">Doctor</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {assignType === "hospital" ? (
                    <Select
                      value={assignId}
                      onValueChange={(next) => {
                        setAssignId(next ?? "")
                        setAssignError(null)
                      }}
                    >
                      <SelectTrigger aria-label="Choose hospital" className="w-full">
                        <SelectValue placeholder="Choose hospital" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Hospitals</SelectLabel>
                          {HOSPITAL_OPTIONS.map((hospital) => (
                            <SelectItem key={hospital.id} value={hospital.id}>
                              {hospital.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  ) : null}
                  {assignType === "doctor" ? (
                    <Select
                      value={assignId}
                      onValueChange={(next) => {
                        setAssignId(next ?? "")
                        setAssignError(null)
                      }}
                    >
                      <SelectTrigger aria-label="Choose doctor" className="w-full">
                        <SelectValue placeholder="Choose doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Doctors</SelectLabel>
                          {DOCTOR_OPTIONS.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                              {doctor.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  ) : null}
                </div>
                {assignError ? (
                  <p role="alert" className="text-xs font-medium text-destructive">
                    {assignError}
                  </p>
                ) : null}
              </div>

              <div className="flex min-w-0 flex-col gap-1.5">
                <Label htmlFor="admin-consult-status">Update case status</Label>
                <Select
                  value={nextStatus}
                  onValueChange={(next) =>
                    setNextStatus((next ?? "under_review") as PatientEnquiryStatus)
                  }
                >
                  <SelectTrigger id="admin-consult-status" className="w-full">
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
                <Label htmlFor="admin-consult-note">Case note (demo)</Label>
                <Textarea
                  id="admin-consult-note"
                  value={actionNote}
                  onChange={(event) => setActionNote(event.target.value)}
                  rows={3}
                  placeholder="Demo note stored on this record only"
                />
              </div>

              {historyById[activeEnquiry.id]?.length ? (
                <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">Demo case history</p>
                  <ul className="mt-1 list-inside list-disc space-y-0.5">
                    {historyById[activeEnquiry.id].map((entry, index) => (
                      <li key={`${entry}-${index}`}>{entry}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <CircleAlertIcon aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                  No demo history recorded for this case yet.
                </p>
              )}
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Close
            </Button>
            <Button onClick={confirmUpdate} disabled={pending}>
              {pending
                ? "Saving (demo)…"
                : nextStatus === "closed"
                  ? "Close case (demo)"
                  : "Save update (demo)"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        Demo boundary: assignments, statuses and notes update local state only. No provider
        accepts or declines in reality, and no patient notification is sent.
        <Badge variant="outline">Mock phase</Badge>
      </p>
    </div>
  )
}
