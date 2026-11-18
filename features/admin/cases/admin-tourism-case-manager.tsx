"use client"

/**
 * AdminTourismCaseManager — /admin/medical-tourism (pages/25 §C; FR-009).
 *
 * International medical-tourism case pipeline over the frozen
 * `MedicalTourismCase` contract. Primary actions per
 * 14-admin-module-contracts: assign coordinator, update stage (+ demo
 * follow-up date, which the contract carries as `followUpAt`).
 *
 * The documented patient journey (enquiry → treatment selection → enquiry
 * submission → case manager assignment → hospital/doctor matching → treatment
 * proposal → travel & accommodation support → treatment & follow-up) is
 * presented as pipeline guidance mapped onto the frozen stage union. The
 * contract carries NO fields for visa, accommodation, airport pickup or
 * estimates, so none are invented or promised — the journey steps render as
 * demo guidance only, never as per-case commitments, visa guarantees, medical
 * recommendations or pricing.
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
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  hospitalById,
  specialtyById,
  treatmentById,
} from "@/data"
import {
  CONSULTATION_TYPE_PRESENTATION,
  COORDINATOR_ASSIGNMENT_PRESENTATION,
  TOURISM_STAGE_PRESENTATION,
} from "@/features/admin/cases/case-presentations"
import { delay } from "@/features/admin/cases/demo-latency"
import {
  CircleAlertIcon,
  CircleCheckBigIcon,
  GlobeIcon,
  SearchIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { MedicalTourismCase, TourismCaseStage } from "@/types"

export interface AdminTourismCaseManagerProps {
  /** All medical-tourism case fixtures, fixture order (A01 `tourismCases`). */
  cases: readonly MedicalTourismCase[]
  className?: string
}

type StageFilter = "all" | TourismCaseStage
type AssignmentFilter = "all" | "unassigned" | "assigned"

/** Demo coordinator pool — display labels only; no real accounts exist. */
const DEMO_COORDINATORS: ReadonlyArray<{ id: string; name: string }> = [
  { id: "demo-coordinator-a", name: "Demo coordinator A (fictional)" },
  { id: "demo-coordinator-b", name: "Demo coordinator B (fictional)" },
  { id: "demo-coordinator-c", name: "Demo coordinator C (fictional)" },
]

/**
 * Documented journey steps (pages/25 §C) mapped to the frozen stage union.
 * Presentation only — a stage does not assert that any step physically
 * happened; it is the demo pipeline position of the case.
 */
const JOURNEY_BY_STAGE: Record<TourismCaseStage, ReadonlyArray<string>> = {
  enquiry_received: [
    "International patient enquiry",
    "Treatment selection",
    "Medical enquiry submission",
  ],
  documents_pending: [
    "Case manager assignment (in progress)",
    "Medical records / documents awaited (demo)",
  ],
  proposal_shared: [
    "Hospital and doctor matching",
    "Treatment proposal shared (demo record)",
  ],
  travel_planned: [
    "Travel and accommodation support (demo journey step)",
    "Visa documentation assistance (demo journey step)",
  ],
  treatment_ongoing: ["Treatment under way (demo)", "Local coordination (demo)"],
  follow_up: ["Post-treatment follow-up (demo)"],
  closed: ["Case closed — demo record retained for reporting"],
}

/** Stages still open for coordinator/stage action (terminal stage is view-only). */
const ACTIONABLE_STAGES: readonly TourismCaseStage[] = [
  "enquiry_received",
  "documents_pending",
  "proposal_shared",
  "travel_planned",
  "treatment_ongoing",
  "follow_up",
]

export function AdminTourismCaseManager({
  cases,
  className,
}: AdminTourismCaseManagerProps) {
  const [stageById, setStageById] = React.useState<Record<string, TourismCaseStage>>(() =>
    Object.fromEntries(cases.map((tourismCase) => [tourismCase.id, tourismCase.stage])),
  )
  const [coordinatorById, setCoordinatorById] = React.useState<Record<string, string | null>>(() =>
    Object.fromEntries(cases.map((tourismCase) => [tourismCase.id, tourismCase.coordinatorName])),
  )
  const [assignmentById, setAssignmentById] = React.useState<
    Record<string, MedicalTourismCase["coordinatorAssignment"]>
  >(() =>
    Object.fromEntries(
      cases.map((tourismCase) => [tourismCase.id, tourismCase.coordinatorAssignment]),
    ),
  )
  const [followUpById, setFollowUpById] = React.useState<Record<string, string | null>>(() =>
    Object.fromEntries(cases.map((tourismCase) => [tourismCase.id, tourismCase.followUpAt])),
  )
  const [historyById, setHistoryById] = React.useState<Record<string, string[]>>({})

  const [query, setQuery] = React.useState("")
  const [stageFilter, setStageFilter] = React.useState<StageFilter>("all")
  const [assignmentFilter, setAssignmentFilter] = React.useState<AssignmentFilter>("all")
  const [flash, setFlash] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)

  const countries = React.useMemo(
    () => Array.from(new Set(cases.map((tourismCase) => tourismCase.country))).sort(),
    [cases],
  )
  const [countryFilter, setCountryFilter] = React.useState<string>("all")

  const filtered = React.useMemo(() => {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean)
    return cases.filter((tourismCase) => {
      const stage = stageById[tourismCase.id] ?? tourismCase.stage
      if (stageFilter !== "all" && stage !== stageFilter) return false
      if (countryFilter !== "all" && tourismCase.country !== countryFilter) return false
      if (assignmentFilter === "unassigned") {
        const coordinator = coordinatorById[tourismCase.id] ?? tourismCase.coordinatorName
        if (coordinator) return false
      }
      if (assignmentFilter === "assigned") {
        const coordinator = coordinatorById[tourismCase.id] ?? tourismCase.coordinatorName
        if (!coordinator) return false
      }
      if (tokens.length > 0) {
        const specialty = specialtyById[tourismCase.specialty]
        const treatment = tourismCase.treatmentId
          ? (treatmentById[tourismCase.treatmentId]?.name ?? tourismCase.treatmentId)
          : ""
        const hospital = tourismCase.preferredHospitalId
          ? (hospitalById[tourismCase.preferredHospitalId]?.name ??
            tourismCase.preferredHospitalId)
          : ""
        const haystack = [
          tourismCase.id,
          tourismCase.patientName,
          tourismCase.country,
          coordinatorById[tourismCase.id] ?? tourismCase.coordinatorName ?? "",
          specialty?.name ?? tourismCase.specialty,
          treatment,
          hospital,
        ]
          .join(" ")
          .toLowerCase()
        if (!tokens.every((token) => haystack.includes(token))) return false
      }
      return true
    })
  }, [
    cases,
    stageById,
    coordinatorById,
    query,
    stageFilter,
    countryFilter,
    assignmentFilter,
  ])

  const [activeCase, setActiveCase] = React.useState<MedicalTourismCase | null>(null)
  const [viewOnly, setViewOnly] = React.useState(false)
  const [nextStage, setNextStage] = React.useState<TourismCaseStage>("documents_pending")
  const [coordinatorId, setCoordinatorId] = React.useState<string>("")
  const [handover, setHandover] = React.useState(false)
  const [followUpDate, setFollowUpDate] = React.useState<string>("")
  const [coordinatorError, setCoordinatorError] = React.useState<string | null>(null)

  function openCase(tourismCase: MedicalTourismCase, viewOnlyMode: boolean) {
    setActiveCase(tourismCase)
    setViewOnly(viewOnlyMode)
    setNextStage(stageById[tourismCase.id] ?? tourismCase.stage)
    const currentCoordinator = coordinatorById[tourismCase.id] ?? tourismCase.coordinatorName
    const match = DEMO_COORDINATORS.find((entry) => entry.name === currentCoordinator)
    setCoordinatorId(match ? match.id : "")
    setHandover(false)
    const followUp = followUpById[tourismCase.id] ?? tourismCase.followUpAt
    setFollowUpDate(followUp ? followUp.slice(0, 10) : "")
    setCoordinatorError(null)
  }

  function closeDialog() {
    setActiveCase(null)
    setViewOnly(false)
    setCoordinatorError(null)
  }

  async function confirmUpdate() {
    if (!activeCase) return
    const previousCoordinator = coordinatorById[activeCase.id] ?? activeCase.coordinatorName
    const assigning = Boolean(coordinatorId)
    if (handover && !previousCoordinator && !assigning) {
      setCoordinatorError(
        "Handover needs a coordinator — assign one or keep the current coordinator (demo).",
      )
      return
    }
    setPending(true)
    await delay()

    const nextCoordinatorName = assigning
      ? (DEMO_COORDINATORS.find((entry) => entry.id === coordinatorId)?.name ?? null)
      : previousCoordinator
    let nextAssignment = assignmentById[activeCase.id] ?? activeCase.coordinatorAssignment
    if (handover) {
      nextAssignment = "handed_over"
    } else if (assigning) {
      nextAssignment = previousCoordinator ? "reassigned" : "assigned"
    } else if (!previousCoordinator && !assigning) {
      nextAssignment = "unassigned"
    }

    setCoordinatorById((current) => ({ ...current, [activeCase.id]: nextCoordinatorName }))
    setAssignmentById((current) => ({ ...current, [activeCase.id]: nextAssignment }))
    setStageById((current) => ({ ...current, [activeCase.id]: nextStage }))
    setFollowUpById((current) => ({
      ...current,
      [activeCase.id]: followUpDate ? new Date(`${followUpDate}T00:00:00.000Z`).toISOString() : null,
    }))
    setHistoryById((current) => ({
      ...current,
      [activeCase.id]: [
        ...(current[activeCase.id] ?? []),
        `${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} — stage ${
          TOURISM_STAGE_PRESENTATION[nextStage].label.toLowerCase()
        }${assigning ? ` · coordinator ${nextCoordinatorName ?? "—"} (${nextAssignment.replace(/_/g, " ")})` : ""}${followUpDate ? ` · follow-up ${followUpDate}` : ""} (demo)`,
      ],
    }))
    setFlash(
      `Case ${activeCase.id} updated in the demo session — no real coordination, travel booking or patient contact occurred.`,
    )
    setPending(false)
    closeDialog()
  }

  const columns: Array<DataTableColumn<MedicalTourismCase>> = [
    {
      key: "case",
      header: "Case",
      render: (tourismCase) => (
        <span className="min-w-0">
          <span className="block truncate font-medium text-foreground">{tourismCase.id}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {tourismCase.patientName} · {tourismCase.country}
          </span>
        </span>
      ),
    },
    {
      key: "specialty",
      header: "Specialty / treatment",
      render: (tourismCase) => (
        <span className="min-w-0">
          <span className="block truncate text-foreground">
            {specialtyById[tourismCase.specialty]?.name ?? tourismCase.specialty}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {tourismCase.treatmentId
              ? (treatmentById[tourismCase.treatmentId]?.name ?? tourismCase.treatmentId)
              : "Treatment not selected yet"}
          </span>
        </span>
      ),
    },
    {
      key: "coordinator",
      header: "Coordinator",
      render: (tourismCase) => {
        const coordinator = coordinatorById[tourismCase.id] ?? tourismCase.coordinatorName
        const assignment = assignmentById[tourismCase.id] ?? tourismCase.coordinatorAssignment
        return (
          <span className="min-w-0">
            <span className="block truncate text-foreground">{coordinator ?? "Unassigned"}</span>
            <span className="block text-xs text-muted-foreground">
              {COORDINATOR_ASSIGNMENT_PRESENTATION[assignment].label}
            </span>
          </span>
        )
      },
    },
    {
      key: "hospital",
      header: "Preferred hospital",
      render: (tourismCase) =>
        tourismCase.preferredHospitalId
          ? (hospitalById[tourismCase.preferredHospitalId]?.name ??
            tourismCase.preferredHospitalId)
          : "Not matched yet",
    },
    {
      key: "stage",
      header: "Stage",
      render: (tourismCase) => {
        const stage = stageById[tourismCase.id] ?? tourismCase.stage
        const presentation = TOURISM_STAGE_PRESENTATION[stage]
        return <StatusBadge status={stage} label={presentation.label} tone={presentation.tone} />
      },
    },
    {
      key: "followup",
      header: "Follow-up",
      render: (tourismCase) => {
        const followUp = followUpById[tourismCase.id] ?? tourismCase.followUpAt
        return followUp ? (
          <span className="whitespace-nowrap text-foreground">{followUp.slice(0, 10)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
    },
    {
      key: "actions",
      header: "Actions",
      hideHeader: true,
      className: "text-right",
      render: (tourismCase) => {
        const stage = stageById[tourismCase.id] ?? tourismCase.stage
        const actionable = ACTIONABLE_STAGES.includes(stage)
        return (
          <span className="inline-flex justify-end gap-1">
            {actionable ? (
              <Button
                variant="outline"
                size="xs"
                onClick={() => openCase(tourismCase, false)}
                aria-label={`Manage medical tourism case ${tourismCase.id}`}
              >
                Manage
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="xs"
              onClick={() => openCase(tourismCase, true)}
              aria-label={`View medical tourism case ${tourismCase.id}`}
            >
              View
            </Button>
          </span>
        )
      },
    },
  ]

  const activeStage = activeCase
    ? (stageById[activeCase.id] ?? activeCase.stage)
    : "enquiry_received"

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
          <CardTitle>Medical tourism pipeline</CardTitle>
          <CardDescription>
            International cases from enquiry through treatment and follow-up. Coordinator
            assignment and stage updates are local demo actions.
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
                placeholder="Search id, patient, country, coordinator…"
                aria-label="Search medical tourism cases"
                className="pl-8"
              />
            </div>
            <Select
              value={stageFilter}
              onValueChange={(next) => setStageFilter((next ?? "all") as StageFilter)}
            >
              <SelectTrigger aria-label="Filter cases by stage" className="w-full">
                <SelectValue placeholder="All stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Stage</SelectLabel>
                  <SelectItem value="all">All stages</SelectItem>
                  {Object.entries(TOURISM_STAGE_PRESENTATION).map(([value, presentation]) => (
                    <SelectItem key={value} value={value}>
                      {presentation.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select value={countryFilter} onValueChange={(next) => setCountryFilter(next ?? "all")}>
              <SelectTrigger aria-label="Filter cases by country" className="w-full">
                <SelectValue placeholder="All countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Patient country</SelectLabel>
                  <SelectItem value="all">All countries</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select
              value={assignmentFilter}
              onValueChange={(next) => setAssignmentFilter((next ?? "all") as AssignmentFilter)}
            >
              <SelectTrigger aria-label="Filter cases by coordinator assignment" className="w-full">
                <SelectValue placeholder="Any assignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Coordinator</SelectLabel>
                  <SelectItem value="all">Any assignment</SelectItem>
                  <SelectItem value="unassigned">Unassigned only</SelectItem>
                  <SelectItem value="assigned">Assigned only</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <p aria-live="polite" className="text-xs text-muted-foreground">
            Showing {filtered.length} of {cases.length} demo medical tourism cases.
          </p>

          <DataTable
            columns={columns}
            rows={filtered}
            getRowKey={(row) => row.id}
            emptyMessage="No medical tourism cases match the demo filters."
            emptyIcon={GlobeIcon}
          />
        </CardContent>
      </Card>

      <Dialog
        open={activeCase !== null}
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
      >
        <DialogContent aria-describedby="admin-tourism-dialog-desc">
          <DialogHeader>
            <DialogTitle>
              {viewOnly ? `Case ${activeCase?.id}` : `Manage case — ${activeCase?.id}`}
            </DialogTitle>
            <DialogDescription id="admin-tourism-dialog-desc">
              Demo action only — no real coordination, travel booking, visa handling or patient
              contact exists behind this case.
            </DialogDescription>
          </DialogHeader>

          {activeCase ? (
            <div className="space-y-4">
              <dl className="grid gap-1.5 rounded-md border bg-muted/40 p-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Patient · country</dt>
                  <dd className="text-right font-medium">
                    {activeCase.patientName} · {activeCase.country}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Case type</dt>
                  <dd className="text-right">
                    <Badge variant="outline">
                      {CONSULTATION_TYPE_PRESENTATION[activeCase.type].label}
                    </Badge>
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Specialty / treatment</dt>
                  <dd className="max-w-[60%] text-right font-medium">
                    {specialtyById[activeCase.specialty]?.name ?? activeCase.specialty}
                    {activeCase.treatmentId
                      ? ` · ${treatmentById[activeCase.treatmentId]?.name ?? activeCase.treatmentId}`
                      : " · treatment not selected yet"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Preferred hospital</dt>
                  <dd className="max-w-[60%] text-right font-medium">
                    {activeCase.preferredHospitalId
                      ? (hospitalById[activeCase.preferredHospitalId]?.name ??
                        activeCase.preferredHospitalId)
                      : "Not matched yet"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Coordinator</dt>
                  <dd className="text-right font-medium">
                    {coordinatorById[activeCase.id] ?? activeCase.coordinatorName ?? "Unassigned"}
                    <span className="block text-xs text-muted-foreground">
                      {
                        COORDINATOR_ASSIGNMENT_PRESENTATION[
                          assignmentById[activeCase.id] ?? activeCase.coordinatorAssignment
                        ].label
                      }
                    </span>
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Linked enquiry</dt>
                  <dd className="text-right font-mono text-xs">{activeCase.enquiryId}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Current stage</dt>
                  <dd>
                    <StatusBadge
                      status={activeStage}
                      label={TOURISM_STAGE_PRESENTATION[activeStage].label}
                      tone={TOURISM_STAGE_PRESENTATION[activeStage].tone}
                    />
                  </dd>
                </div>
              </dl>

              <div className="rounded-md border bg-muted/40 p-3">
                <p className="text-xs font-semibold text-foreground">
                  Documented journey position (demo guidance)
                </p>
                <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-xs text-muted-foreground">
                  {JOURNEY_BY_STAGE[activeStage].map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-muted-foreground">
                  Journey steps describe the documented pipeline — the demo contract stores no
                  visa, accommodation, transport or estimate fields, so none are claimed for this
                  case.
                </p>
              </div>

              {!viewOnly ? (
                <>
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <Label htmlFor="admin-tourism-coordinator">Assign coordinator (demo)</Label>
                    <Select
                      value={coordinatorId}
                      onValueChange={(next) => {
                        setCoordinatorId(next ?? "")
                        setCoordinatorError(null)
                      }}
                    >
                      <SelectTrigger id="admin-tourism-coordinator" className="w-full">
                        <SelectValue placeholder="Keep current coordinator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Demo coordinators</SelectLabel>
                          {DEMO_COORDINATORS.map((coordinator) => (
                            <SelectItem key={coordinator.id} value={coordinator.id}>
                              {coordinator.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <label className="mt-1 flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={handover}
                        onChange={(event) => setHandover(event.target.checked)}
                        className="size-4 rounded border-input"
                      />
                      Mark current coordination as handed over (demo)
                    </label>
                    {coordinatorError ? (
                      <p role="alert" className="text-xs font-medium text-destructive">
                        {coordinatorError}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex min-w-0 flex-col gap-1.5">
                    <Label htmlFor="admin-tourism-stage">Update case stage</Label>
                    <Select
                      value={nextStage}
                      onValueChange={(next) =>
                        setNextStage((next ?? "documents_pending") as TourismCaseStage)
                      }
                    >
                      <SelectTrigger id="admin-tourism-stage" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Set stage to</SelectLabel>
                          {Object.entries(TOURISM_STAGE_PRESENTATION).map(([value, presentation]) => (
                            <SelectItem key={value} value={value}>
                              {presentation.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex min-w-0 flex-col gap-1.5">
                    <Label htmlFor="admin-tourism-followup">Follow-up date (demo)</Label>
                    <Input
                      id="admin-tourism-followup"
                      type="date"
                      value={followUpDate}
                      onChange={(event) => setFollowUpDate(event.target.value)}
                    />
                  </div>

                  {historyById[activeCase.id]?.length ? (
                    <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
                      <p className="font-medium text-foreground">Demo case history</p>
                      <ul className="mt-1 list-inside list-disc space-y-0.5">
                        {historyById[activeCase.id].map((entry, index) => (
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
                </>
              ) : (
                <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">Demo case history</p>
                  {historyById[activeCase.id]?.length ? (
                    <ul className="mt-1 list-inside list-disc space-y-0.5">
                      {historyById[activeCase.id].map((entry, index) => (
                        <li key={`${entry}-${index}`}>{entry}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1">No demo history recorded for this case yet.</p>
                  )}
                </div>
              )}
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Close
            </Button>
            {!viewOnly ? (
              <Button onClick={confirmUpdate} disabled={pending}>
                {pending ? "Saving (demo)…" : "Save update (demo)"}
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
