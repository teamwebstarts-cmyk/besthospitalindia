"use client"

/**
 * AdminRatingAssessmentManager — /admin/ratings (pages/25 §E; FR-016).
 *
 * Rating governance queue over the frozen `RatingAssessment` contract. The
 * platform keeps three distinct rating kinds — Hospital: PER + CER, Doctor:
 * PER + MER — and this queue NEVER combines them into a composite score.
 * `score: null` renders "Not yet rated" / "Assessment pending", never 0/5.
 *
 * Primary actions per 14-admin-module-contracts: review evidence, request
 * changes, publish. Publishing is only reachable from `approved`
 * (pages/25 §7: "publish only approved demo assessment"). Criteria weights
 * and scores come from the fixtures — no formula is computed or invented
 * here; the criteria list is presented as recorded demo metadata.
 *
 * Documented workflow presented per assessment (pages/25 §E):
 * criteria/weightage definition → evidence/documents → verification →
 * clinical assessment → patient-review collection (PER) → calculation →
 * admin approval → publication → periodic review (status).
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
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { RATING_LABELS, RATING_SCALE_MAX } from "@/constants/rating"
import {
  ASSESSMENT_STATUS_PRESENTATION,
} from "@/features/admin/cases/case-presentations"
import { delay } from "@/features/admin/cases/demo-latency"
import { providerName } from "@/features/admin/cases/provider-lookup"
import {
  CircleAlertIcon,
  CircleCheckBigIcon,
  ClipboardListIcon,
  FileTextIcon,
  SearchIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { RatingAssessment, RatingAssessmentStatus, RatingEvidenceKind, RatingKind } from "@/types"

export interface AdminRatingAssessmentManagerProps {
  /** All rating-assessment fixtures, fixture order (A01 `ratingAssessments`). */
  assessments: readonly RatingAssessment[]
  className?: string
}

type KindFilter = "all" | RatingKind
type StatusFilter = "all" | RatingAssessmentStatus

const EVIDENCE_KIND_LABELS: Record<RatingEvidenceKind, string> = {
  patient_feedback_sample: "Patient feedback sample",
  clinical_audit: "Clinical audit",
  accreditation_record: "Accreditation record",
  credential_check: "Credential check",
  outcome_report: "Outcome report",
  other: "Other evidence",
}

/**
 * Assessment lifecycle transitions (PROPOSED union from types/rating.ts).
 * Publishing is only offered from `approved` — never from draft/review states.
 */
const STATUS_TRANSITIONS: ReadonlyArray<{
  value: RatingAssessmentStatus
  from: ReadonlyArray<RatingAssessmentStatus>
  label: string
  noteRequired: boolean
}> = [
  { value: "in_review", from: ["draft", "changes_requested"], label: "Send for review", noteRequired: false },
  { value: "changes_requested", from: ["draft", "in_review"], label: "Request changes", noteRequired: true },
  { value: "approved", from: ["in_review"], label: "Approve assessment", noteRequired: false },
  { value: "published", from: ["approved"], label: "Publish rating", noteRequired: false },
]

/** Workflow stage copy shown per status (pages/25 §E steps 1–8). */
const WORKFLOW_BY_STATUS: Record<RatingAssessmentStatus, string> = {
  draft: "Criteria and evidence are being assembled; verification has not concluded.",
  in_review: "Verification team is validating evidence and the clinical assessment record.",
  changes_requested: "Reviewer returned the assessment — provider evidence needs updating.",
  approved: "Admin approved the assessment; it is eligible for publication.",
  published: "Published under its methodology version; periodically reviewed and re-assessed.",
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null
  const parsed = new Date(iso)
  return Number.isNaN(parsed.getTime()) ? iso : parsed.toLocaleDateString("en-IN", { dateStyle: "medium" })
}

export function AdminRatingAssessmentManager({
  assessments,
  className,
}: AdminRatingAssessmentManagerProps) {
  const [statusById, setStatusById] = React.useState<Record<string, RatingAssessmentStatus>>(() =>
    Object.fromEntries(assessments.map((assessment) => [assessment.id, assessment.status])),
  )
  const [historyById, setHistoryById] = React.useState<Record<string, string[]>>({})

  const [query, setQuery] = React.useState("")
  const [kindFilter, setKindFilter] = React.useState<KindFilter>("all")
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all")
  const [flash, setFlash] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)

  const readyForApproval = React.useMemo(
    () =>
      assessments.filter((assessment) => {
        const status = statusById[assessment.id] ?? assessment.status
        return status === "in_review" || status === "changes_requested"
      }).length,
    [assessments, statusById],
  )

  const filtered = React.useMemo(() => {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean)
    return assessments.filter((assessment) => {
      const status = statusById[assessment.id] ?? assessment.status
      if (kindFilter !== "all" && assessment.ratingKind !== kindFilter) return false
      if (statusFilter !== "all" && status !== statusFilter) return false
      if (tokens.length > 0) {
        const haystack = [
          assessment.id,
          providerName(assessment.providerType, assessment.providerId),
          assessment.ratingKind,
          assessment.methodologyVersion,
          assessment.assessedBy,
        ]
          .join(" ")
          .toLowerCase()
        if (!tokens.every((token) => haystack.includes(token))) return false
      }
      return true
    })
  }, [assessments, statusById, query, kindFilter, statusFilter])

  const [activeAssessment, setActiveAssessment] = React.useState<RatingAssessment | null>(null)
  const [viewOnly, setViewOnly] = React.useState(false)
  const [nextStatus, setNextStatus] = React.useState<RatingAssessmentStatus>("in_review")
  const [actionNote, setActionNote] = React.useState("")
  const [noteError, setNoteError] = React.useState<string | null>(null)

  function openAssessment(assessment: RatingAssessment, viewOnlyMode: boolean) {
    setActiveAssessment(assessment)
    setViewOnly(viewOnlyMode)
    const current = statusById[assessment.id] ?? assessment.status
    const transition = STATUS_TRANSITIONS.find((entry) => entry.from.includes(current))
    setNextStatus(transition ? transition.value : current)
    setActionNote("")
    setNoteError(null)
  }

  function closeDialog() {
    setActiveAssessment(null)
    setViewOnly(false)
    setNoteError(null)
  }

  async function confirmUpdate() {
    if (!activeAssessment) return
    const transition = STATUS_TRANSITIONS.find((entry) => entry.value === nextStatus)
    if (transition?.noteRequired && actionNote.trim().length < 4) {
      setNoteError("Add a short note (demo) — at least 4 characters.")
      return
    }
    setPending(true)
    await delay()
    const previous = statusById[activeAssessment.id] ?? activeAssessment.status
    setStatusById((current) => ({ ...current, [activeAssessment.id]: nextStatus }))
    setHistoryById((current) => ({
      ...current,
      [activeAssessment.id]: [
        ...(current[activeAssessment.id] ?? []),
        `${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} — ${previous.replace(/_/g, " ")} → ${nextStatus.replace(/_/g, " ")}${actionNote.trim() ? ` · “${actionNote.trim()}”` : ""} (demo)`,
      ],
    }))
    setFlash(
      nextStatus === "published"
        ? `Assessment ${activeAssessment.id} published in the demo session under methodology ${activeAssessment.methodologyVersion} — no real rating went live anywhere.`
        : `Assessment ${activeAssessment.id} set to “${ASSESSMENT_STATUS_PRESENTATION[nextStatus].label}” in the demo session.`,
    )
    setPending(false)
    closeDialog()
  }

  const availableTransitions = activeAssessment
    ? STATUS_TRANSITIONS.filter((entry) =>
        entry.from.includes(statusById[activeAssessment.id] ?? activeAssessment.status),
      )
    : []

  const activeStatus = activeAssessment
    ? (statusById[activeAssessment.id] ?? activeAssessment.status)
    : "draft"

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
          <CardTitle>Rating assessment queue</CardTitle>
          <CardDescription>
            Independent PER, CER and MER assessments. Review evidence, request changes and publish
            approved demo assessments — PER is never combined with CER or MER, and missing scores
            stay “Not yet rated”, never 0/{RATING_SCALE_MAX}.
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
                placeholder="Search id, provider, reviewer…"
                aria-label="Search rating assessments"
                className="pl-8"
              />
            </div>
            <Select value={kindFilter} onValueChange={(next) => setKindFilter((next ?? "all") as KindFilter)}>
              <SelectTrigger aria-label="Filter assessments by rating kind" className="w-full">
                <SelectValue placeholder="All rating kinds" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Rating kind</SelectLabel>
                  <SelectItem value="all">All rating kinds</SelectItem>
                  <SelectItem value="PER">{RATING_LABELS.PER} (PER)</SelectItem>
                  <SelectItem value="CER">{RATING_LABELS.CER} (CER)</SelectItem>
                  <SelectItem value="MER">{RATING_LABELS.MER} (MER)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(next) => setStatusFilter((next ?? "all") as StatusFilter)}
            >
              <SelectTrigger aria-label="Filter assessments by status" className="w-full">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="all">All statuses</SelectItem>
                  {Object.entries(ASSESSMENT_STATUS_PRESENTATION).map(([value, presentation]) => (
                    <SelectItem key={value} value={value}>
                      {presentation.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <div
              aria-live="polite"
              className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 text-xs text-muted-foreground"
            >
              <ClipboardListIcon aria-hidden className="size-3.5 shrink-0" />
              {readyForApproval} awaiting verification / changes
            </div>
          </div>

          <p aria-live="polite" className="text-xs text-muted-foreground">
            Showing {filtered.length} of {assessments.length} demo assessments.
          </p>

          {filtered.length === 0 ? (
            <EmptyState
              icon={ClipboardListIcon}
              title="No assessments match the demo filters"
              description="Adjust the search, rating kind or status filter to see assessment records again."
            />
          ) : (
            <ul className="space-y-3">
              {filtered.map((assessment) => {
                const status = statusById[assessment.id] ?? assessment.status
                const statusPresentation = ASSESSMENT_STATUS_PRESENTATION[status]
                const rated = assessment.sampleSize !== null
                return (
                  <li key={assessment.id}>
                    <article
                      className={cn(
                        "rounded-lg border bg-card p-4 shadow-xs",
                        assessment.ratingKind === "PER" ? "border-info/30" : "border-success/30",
                      )}
                      aria-label={`Assessment ${assessment.id}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-foreground">
                            <span className="font-mono text-xs text-muted-foreground">
                              {assessment.ratingKind}
                            </span>{" "}
                            · {providerName(assessment.providerType, assessment.providerId)}
                            <span className="block text-xs font-normal text-muted-foreground">
                              {assessment.providerType} · methodology{" "}
                              <span className="font-mono">{assessment.methodologyVersion}</span> ·
                              assessed by {assessment.assessedBy}
                            </span>
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              assessment.ratingKind === "PER"
                                ? "border-info/40 text-info"
                                : "border-success/40 text-success",
                            )}
                          >
                            {assessment.ratingKind === "PER"
                              ? RATING_LABELS.PER
                              : assessment.ratingKind === "CER"
                                ? RATING_LABELS.CER
                                : RATING_LABELS.MER}
                          </Badge>
                          <StatusBadge
                            status={status}
                            label={statusPresentation.label}
                            tone={statusPresentation.tone}
                          />
                        </div>
                      </div>

                      <dl className="mt-3 grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
                        <div className="flex items-center gap-1.5">
                          <dt className="shrink-0">Score:</dt>
                          <dd className="font-medium text-foreground">
                            {rated ? "Recorded in assessment" : "Not yet rated"}
                            <span className="sr-only">
                              {rated
                                ? ""
                                : " — a missing score is never displayed as 0 out of 5"}
                            </span>
                          </dd>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <dt className="shrink-0">Sample size:</dt>
                          <dd>{assessment.sampleSize ?? "No sample yet"}</dd>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <dt className="shrink-0">Assessed:</dt>
                          <dd>{formatDate(assessment.assessedAt) ?? "—"}</dd>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <dt className="shrink-0">Published:</dt>
                          <dd>
                            {assessment.publishedAt
                              ? (formatDate(assessment.publishedAt) ?? "—")
                              : "Not published"}
                          </dd>
                        </div>
                      </dl>

                      {assessment.notes ? (
                        <p className="mt-2 text-xs text-muted-foreground">{assessment.notes}</p>
                      ) : null}

                      {historyById[assessment.id]?.length ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Demo assessment history: {historyById[assessment.id].join(" · ")}
                        </p>
                      ) : null}

                      <div className="mt-3 flex flex-wrap justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => openAssessment(assessment, true)}
                          aria-label={`View assessment ${assessment.id}`}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => openAssessment(assessment, false)}
                          aria-label={`Review assessment ${assessment.id}`}
                        >
                          Review evidence
                        </Button>
                      </div>
                    </article>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={activeAssessment !== null}
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
      >
        <DialogContent aria-describedby="admin-rating-dialog-desc">
          <DialogHeader>
            <DialogTitle>
              {viewOnly
                ? `Assessment ${activeAssessment?.id}`
                : `Review assessment — ${activeAssessment?.id}`}
            </DialogTitle>
            <DialogDescription id="admin-rating-dialog-desc">
              Demo action only — no rating is published to any real platform. Criteria weights and
              scores are frozen demo metadata; nothing is recalculated here.
            </DialogDescription>
          </DialogHeader>

          {activeAssessment ? (
            <div className="space-y-4">
              <dl className="grid gap-1.5 rounded-md border bg-muted/40 p-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Provider</dt>
                  <dd className="text-right font-medium">
                    {providerName(activeAssessment.providerType, activeAssessment.providerId)} (
                    {activeAssessment.providerType})
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Rating kind</dt>
                  <dd className="text-right font-medium">
                    {activeAssessment.ratingKind === "PER"
                      ? RATING_LABELS.PER
                      : activeAssessment.ratingKind === "CER"
                        ? RATING_LABELS.CER
                        : RATING_LABELS.MER}{" "}
                    ({activeAssessment.ratingKind})
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Methodology version</dt>
                  <dd className="text-right font-mono text-xs">
                    {activeAssessment.methodologyVersion}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Sample size</dt>
                  <dd className="text-right">
                    {activeAssessment.sampleSize ?? "No sample yet (demo)"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Assessed by · date</dt>
                  <dd className="text-right">
                    {activeAssessment.assessedBy} · {formatDate(activeAssessment.assessedAt)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Publication state</dt>
                  <dd className="text-right">
                    {activeAssessment.publishedAt
                      ? `Published ${formatDate(activeAssessment.publishedAt)}`
                      : "Not published"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Lifecycle status</dt>
                  <dd>
                    <StatusBadge
                      status={activeStatus}
                      label={ASSESSMENT_STATUS_PRESENTATION[activeStatus].label}
                      tone={ASSESSMENT_STATUS_PRESENTATION[activeStatus].tone}
                    />
                  </dd>
                </div>
              </dl>

              <p className="text-xs text-muted-foreground">
                Workflow position: {WORKFLOW_BY_STATUS[activeStatus]}
              </p>

              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Criteria &amp; weightages (demo metadata — recorded, not computed)
                </h4>
                <ul className="mt-1.5 space-y-1.5">
                  {activeAssessment.criteria.map((criterion) => (
                    <li
                      key={criterion.id}
                      className="rounded-md border bg-muted/40 p-2.5 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="font-medium text-foreground">{criterion.label}</span>
                        <span className="text-muted-foreground">
                          weight {criterion.weight}%
                        </span>
                      </div>
                      <p className="mt-0.5 text-muted-foreground">
                        {criterion.score === null ? (
                          <>
                            Criterion score: not yet scored
                            <span className="sr-only">
                              {" "}
                              — never displayed as 0 out of {criterion.scaleMax}
                            </span>
                          </>
                        ) : (
                          <>
                            Criterion score: {criterion.score} / {criterion.scaleMax}
                          </>
                        )}
                      </p>
                      {criterion.notes ? (
                        <p className="mt-0.5 text-muted-foreground">{criterion.notes}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
                <p className="mt-1.5 flex items-start gap-1.5 text-xs text-muted-foreground">
                  <CircleAlertIcon aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                  {activeAssessment.ratingKind === "PER"
                    ? "PER reflects collected patient feedback only. It is independent of any clinical assessment and the two are never combined."
                    : activeAssessment.ratingKind === "CER"
                      ? "CER reflects the independently assessed clinical record (accreditations, credentials, verified outcomes). It never blends with patient-experience PER."
                      : "MER reflects the independently assessed doctor record (qualifications, registration, experience). It never blends with patient-experience PER."}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Evidence basis ({activeAssessment.evidence.length}{" "}
                  {activeAssessment.evidence.length === 1 ? "record" : "records"})
                </h4>
                {activeAssessment.evidence.length === 0 ? (
                  <p className="mt-1.5 rounded-md border border-dashed p-3 text-xs text-muted-foreground">
                    No evidence records attached yet — verification cannot conclude without
                    evidence (demo posture).
                  </p>
                ) : (
                  <ul className="mt-1.5 space-y-1.5">
                    {activeAssessment.evidence.map((evidence) => (
                      <li
                        key={evidence.id}
                        className="flex items-start gap-2 rounded-md border bg-muted/40 p-2.5 text-xs"
                      >
                        <FileTextIcon aria-hidden className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                        <span className="min-w-0">
                          <span className="block font-medium text-foreground">
                            {evidence.label}
                            <span className="ml-1 font-normal text-muted-foreground">
                              · {EVIDENCE_KIND_LABELS[evidence.kind]}
                            </span>
                          </span>
                          <span className="block text-muted-foreground">{evidence.summary}</span>
                          <span className="block text-muted-foreground">
                            Collected {formatDate(evidence.collectedAt) ?? evidence.collectedAt}
                            {evidence.referenceLabel ? ` · ${evidence.referenceLabel}` : ""}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {activeAssessment.notes ? (
                <p className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Assessment notes: </span>
                  {activeAssessment.notes}
                </p>
              ) : null}

              {!viewOnly ? (
                <>
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <Label htmlFor="admin-rating-status">Assessment decision</Label>
                    {availableTransitions.length > 0 ? (
                      <Select
                        value={nextStatus}
                        onValueChange={(next) => {
                          setNextStatus((next ?? "in_review") as RatingAssessmentStatus)
                          setNoteError(null)
                        }}
                      >
                        <SelectTrigger id="admin-rating-status" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Set status to</SelectLabel>
                            {availableTransitions.map((transition) => (
                              <SelectItem key={transition.value} value={transition.value}>
                                {transition.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No further lifecycle transitions from “
                        {ASSESSMENT_STATUS_PRESENTATION[activeStatus].label}” in the demo workflow.
                      </p>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-col gap-1.5">
                    <Label htmlFor="admin-rating-note">
                      Review note
                      {availableTransitions.find((entry) => entry.value === nextStatus)
                        ?.noteRequired ? (
                        <span aria-hidden className="text-destructive">*</span>
                      ) : null}
                    </Label>
                    <Textarea
                      id="admin-rating-note"
                      value={actionNote}
                      onChange={(event) => {
                        setActionNote(event.target.value)
                        setNoteError(null)
                      }}
                      aria-invalid={noteError ? true : undefined}
                      aria-describedby={noteError ? "admin-rating-note-error" : undefined}
                      rows={3}
                      placeholder="Demo note stored on this record only"
                    />
                    {noteError ? (
                      <p
                        id="admin-rating-note-error"
                        role="alert"
                        className="text-xs font-medium text-destructive"
                      >
                        {noteError}
                      </p>
                    ) : null}
                  </div>
                </>
              ) : historyById[activeAssessment.id]?.length ? (
                <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">Demo assessment history</p>
                  <ul className="mt-1 list-inside list-disc space-y-0.5">
                    {historyById[activeAssessment.id].map((entry, index) => (
                      <li key={`${entry}-${index}`}>{entry}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No demo assessment history recorded yet.
                </p>
              )}
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Close
            </Button>
            {!viewOnly && availableTransitions.length > 0 ? (
              <Button
                variant={nextStatus === "changes_requested" ? "destructive" : "default"}
                onClick={confirmUpdate}
                disabled={pending}
              >
                {pending
                  ? "Saving (demo)…"
                  : nextStatus === "published"
                    ? "Publish rating (demo)"
                    : "Save decision (demo)"}
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
