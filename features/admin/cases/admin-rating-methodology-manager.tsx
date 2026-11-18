"use client"

/**
 * AdminRatingMethodologyManager — /admin/rating-methodology (pages/25 §F;
 * 14-admin-module-contracts: "Which criteria/version governs a rating? —
 * Versioned criteria editor; draft, compare, approve methodology version").
 *
 * Methodology governance over the frozen contracts:
 * - Versions are DERIVED from `ratingAssessments` methodologyVersion values
 *   (METH-CER-1.1, METH-MER-1.0) — A01 ships no dedicated methodology fixture
 *   (gap logged in the A12 report), so this screen presents recorded
 *   assessment metadata rather than inventing a new version register.
 * - PER / CER / MER criteria panels aggregate the criteria rows that the
 *   frozen assessments actually record. No new criterion, weight or formula
 *   is created here.
 * - The "draft editor" is an explicitly-labelled DEMONSTRATION: weight
 *   sliders / text edits update session state only, never persist, and the
 *   approve action records a demo decision. Per the task contract, editable
 *   methodology controls must be mock-only and clearly identified.
 * - PER and CER/MER criteria remain in separate, independent panels.
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/shared/status-badge"
import { RATING_LABELS } from "@/constants/rating"
import {
  ASSESSMENT_STATUS_PRESENTATION,
} from "@/features/admin/cases/case-presentations"
import { delay } from "@/features/admin/cases/demo-latency"
import {
  BookOpenCheckIcon,
  CircleAlertIcon,
  CircleCheckBigIcon,
  FlaskConicalIcon,
  InfoIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { RatingAssessment, RatingKind } from "@/types"

export interface AdminRatingMethodologyManagerProps {
  /** All assessment fixtures; version register is derived from these. */
  assessments: readonly RatingAssessment[]
  className?: string
}

interface CriteriaRow {
  id: string
  label: string
  weight: number
  scaleMax: number
  score: number | null
  notes?: string
}

/** A methodology version derived from assessment fixtures (no new fixture). */
interface MethodologyVersion {
  version: string
  ratingKind: RatingKind
  assessmentIds: string[]
  statuses: RatingAssessment["status"][]
  criteria: CriteriaRow[]
  latestAssessedAt: string
}

const KIND_ORDER: ReadonlyArray<RatingKind> = ["PER", "CER", "MER"]

/** Derive the version register purely from frozen assessment fixtures. */
function deriveVersions(assessments: readonly RatingAssessment[]): MethodologyVersion[] {
  const byKey = new Map<string, MethodologyVersion>()
  for (const assessment of assessments) {
    const key = `${assessment.methodologyVersion}`
    const existing = byKey.get(key)
    const criteria: CriteriaRow[] = assessment.criteria.map((criterion) => ({
      id: criterion.id,
      label: criterion.label,
      weight: criterion.weight,
      scaleMax: criterion.scaleMax,
      score: criterion.score,
      notes: criterion.notes,
    }))
    if (existing) {
      existing.assessmentIds.push(assessment.id)
      existing.statuses.push(assessment.status)
      if (assessment.assessedAt > existing.latestAssessedAt) {
        existing.latestAssessedAt = assessment.assessedAt
      }
      for (const criterion of criteria) {
        if (!existing.criteria.some((row) => row.id === criterion.id)) {
          existing.criteria.push(criterion)
        }
      }
    } else {
      byKey.set(key, {
        version: assessment.methodologyVersion,
        ratingKind: assessment.ratingKind,
        assessmentIds: [assessment.id],
        statuses: [assessment.status],
        criteria,
        latestAssessedAt: assessment.assessedAt,
      })
    }
  }
  return Array.from(byKey.values()).sort(
    (a, b) => b.latestAssessedAt.localeCompare(a.latestAssessedAt) || a.version.localeCompare(b.version),
  )
}

function formatDate(iso: string): string {
  const parsed = new Date(iso)
  return Number.isNaN(parsed.getTime()) ? iso : parsed.toLocaleDateString("en-IN", { dateStyle: "medium" })
}

export function AdminRatingMethodologyManager({
  assessments,
  className,
}: AdminRatingMethodologyManagerProps) {
  const versions = React.useMemo(() => deriveVersions(assessments), [assessments])

  const [flash, setFlash] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)
  const [approvedVersion, setApprovedVersion] = React.useState<string | null>(null)
  /** Demo draft editor state: version key → editable weight overrides. */
  const [weightDraft, setWeightDraft] = React.useState<Record<string, Record<string, number>>>({})
  const [weightError, setWeightError] = React.useState<Record<string, string | null>>({})

  function setDraftWeight(version: string, criterionId: string, weight: number) {
    setWeightDraft((current) => ({
      ...current,
      [version]: { ...(current[version] ?? {}), [criterionId]: weight },
    }))
    setWeightError((current) => ({ ...current, [version]: null }))
  }

  function draftWeight(version: MethodologyVersion, row: CriteriaRow): number {
    return weightDraft[version.version]?.[row.id] ?? row.weight
  }

  function draftTotal(version: MethodologyVersion): number {
    return version.criteria.reduce((total, row) => total + draftWeight(version, row), 0)
  }

  function resetDraft(version: string) {
    setWeightDraft((current) => {
      const next = { ...current }
      delete next[version]
      return next
    })
    setWeightError((current) => ({ ...current, [version]: null }))
  }

  async function approveVersion(version: MethodologyVersion) {
    const total = draftTotal(version)
    if (total !== 100) {
      setWeightError((current) => ({
        ...current,
        [version.version]: `Demo weights total ${total}% — approve needs exactly 100%.`,
      }))
      return
    }
    setPending(true)
    await delay()
    setApprovedVersion(version.version)
    setFlash(
      `Methodology ${version.version} approved in the demo session — this is a recorded demo decision only; no methodology change went live anywhere.`,
    )
    setPending(false)
  }

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
          <CardTitle>Methodology versions</CardTitle>
          <CardDescription>
            The criteria and version that govern each rating kind, derived from recorded demo
            assessments. PER, hospital CER and doctor MER are separate methodologies — their
            criteria are never merged.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          {versions.length === 0 ? (
            <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No methodology versions recorded in the demo assessments yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {versions.map((version) => {
                const isApproved = approvedVersion === version.version
                const total = draftTotal(version)
                const draftChanged = weightDraft[version.version] !== undefined
                return (
                  <li key={version.version}>
                    <article
                      className={cn(
                        "rounded-lg border bg-card p-4 shadow-xs",
                        version.ratingKind === "PER" ? "border-info/30" : "border-success/30",
                      )}
                      aria-label={`Methodology version ${version.version}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="flex items-center gap-1.5 font-medium text-foreground">
                            <FlaskConicalIcon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                            <span className="font-mono">{version.version}</span>
                            <Badge
                              variant="outline"
                              className={cn(
                                version.ratingKind === "PER"
                                  ? "border-info/40 text-info"
                                  : "border-success/40 text-success",
                              )}
                            >
                              {version.ratingKind === "PER"
                                ? RATING_LABELS.PER
                                : version.ratingKind === "CER"
                                  ? RATING_LABELS.CER
                                  : RATING_LABELS.MER}
                            </Badge>
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {version.assessmentIds.length} demo{" "}
                            {version.assessmentIds.length === 1 ? "assessment" : "assessments"}{" "}
                            recorded · latest assessed {formatDate(version.latestAssessedAt)}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {isApproved ? (
                            <StatusBadge
                              status="approved"
                              label="Approved (demo)"
                              tone="success"
                            />
                          ) : null}
                          {version.statuses.map((status) => (
                            <StatusBadge
                              key={status}
                              status={status}
                              label={ASSESSMENT_STATUS_PRESENTATION[status].label}
                              tone={ASSESSMENT_STATUS_PRESENTATION[status].tone}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="mt-3">
                        <h4 className="text-sm font-semibold text-foreground">
                          Criteria &amp; weightages (demo metadata)
                        </h4>
                        <ul className="mt-1.5 space-y-1.5">
                          {version.criteria.map((row) => (
                            <li key={row.id} className="rounded-md border bg-muted/40 p-2.5">
                              <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                                <span className="font-medium text-foreground">{row.label}</span>
                                <span className="text-muted-foreground">
                                  weight{" "}
                                  <span className="tabular-nums">
                                    {draftChanged ? `${draftWeight(version, row)}%` : `${row.weight}%`}
                                  </span>
                                  {draftChanged && draftWeight(version, row) !== row.weight ? (
                                    <span className="ml-1">(recorded: {row.weight}%)</span>
                                  ) : null}
                                </span>
                              </div>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {row.score === null ? (
                                  <>
                                    Criterion score: not yet scored
                                    <span className="sr-only">
                                      {" "}
                                      — never displayed as 0 out of {row.scaleMax}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    Criterion score: {row.score} / {row.scaleMax}
                                  </>
                                )}
                              </p>
                              {row.notes ? (
                                <p className="mt-0.5 text-xs text-muted-foreground">{row.notes}</p>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                        <p
                          className={cn(
                            "mt-1.5 text-xs",
                            total === 100 ? "text-muted-foreground" : "font-medium text-warning",
                          )}
                        >
                          Demo weight total: {total}% (recorded methodology totals 100% — the demo
                          editor below never changes the recorded version)
                        </p>
                      </div>

                      {/* Explicitly-labelled demonstration editor — session state only. */}
                      <div className="mt-3 rounded-md border border-dashed p-3">
                        <p className="flex items-start gap-1.5 text-xs font-medium text-foreground">
                          <InfoIcon aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                          Demonstration editor — local demo state only
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Adjusting these weights changes this demo session only. The recorded
                          methodology version and all published assessments stay untouched.
                        </p>
                        <div className="mt-2 space-y-2">
                          {version.criteria.map((row) => (
                            <div
                              key={row.id}
                              className="flex items-center gap-3"
                            >
                              <Label
                                htmlFor={`weight-${version.version}-${row.id}`}
                                className="min-w-0 flex-1 truncate text-xs text-muted-foreground"
                              >
                                {row.label}
                              </Label>
                              <Input
                                id={`weight-${version.version}-${row.id}`}
                                type="number"
                                min={0}
                                max={100}
                                value={draftWeight(version, row)}
                                onChange={(event) => {
                                  const parsed = Number(event.target.value)
                                  if (Number.isFinite(parsed)) {
                                    setDraftWeight(version.version, row.id, parsed)
                                  }
                                }}
                                className="w-20"
                                aria-describedby={`weight-hint-${version.version}`}
                              />
                            </div>
                          ))}
                        </div>
                        <p
                          id={`weight-hint-${version.version}`}
                          aria-live="polite"
                          className="mt-2 text-xs text-muted-foreground"
                        >
                          Weight total in this demo editor: {total}% / 100%
                        </p>
                        {weightError[version.version] ? (
                          <p role="alert" className="mt-1 text-xs font-medium text-destructive">
                            {weightError[version.version]}
                          </p>
                        ) : null}
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => resetDraft(version.version)}
                            disabled={!draftChanged}
                          >
                            Reset demo edits
                          </Button>
                          <Button
                            variant="default"
                            size="xs"
                            onClick={() => approveVersion(version)}
                            disabled={pending}
                          >
                            {pending ? "Approving (demo)…" : "Approve methodology (demo)"}
                          </Button>
                        </div>
                      </div>
                    </article>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {KIND_ORDER.map((kind) => (
          <Card key={kind} className={cn(kind === "PER" ? "border-info/30" : "border-success/30")}>
            <CardHeader className="gap-1">
              <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
                <BookOpenCheckIcon
                  aria-hidden
                  className={cn("size-4 shrink-0", kind === "PER" ? "text-info" : "text-success")}
                />
                {kind === "PER"
                  ? RATING_LABELS.PER
                  : kind === "CER"
                    ? RATING_LABELS.CER
                    : RATING_LABELS.MER}
              </CardTitle>
              <CardDescription className="text-xs">
                {kind === "PER"
                  ? "Criteria: collected, verified patient feedback on care and service experience. Never combined with clinical expertise."
                  : kind === "CER"
                    ? "Criteria: accreditations, professional credentials and verified outcomes — assessed independently of patient feedback."
                    : "Criteria: qualifications, registration checks and experience record — assessed independently of patient feedback."}
              </CardDescription>
            </CardHeader>
            <CardContent className="gap-2 text-xs text-muted-foreground">
              <p className="flex items-start gap-1.5">
                <CircleAlertIcon aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                Evidence requirements come from the recorded demo assessments; this demo adds no
                new criteria or formulas.
              </p>
              <p className="flex items-start gap-1.5">
                <CircleAlertIcon aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                {kind === "PER" ? "PER" : kind === "CER" ? "CER" : "MER"} is displayed
                independently wherever it appears on the platform.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="governance">
        <TabsList>
          <TabsTrigger value="governance">Governance &amp; audit posture</TabsTrigger>
          <TabsTrigger value="evidence">Evidence requirements</TabsTrigger>
        </TabsList>
        <TabsContent value="governance">
          <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
            <p>
              Documented governance workflow (demo presentation): criteria and weightages are
              defined → providers submit supporting documents → a verification team validates
              information → the clinical assessment is recorded → patient reviews are collected
              through a verified process → the system calculates PER using approved review rules →
              admin approves and publishes → ratings are periodically reviewed and updated.
            </p>
            <p className="mt-2">
              Clinical assessments keep their independent oversight and auditability requirements:
              every demo decision on the /admin/ratings queue records a session-local history
              entry, and publication is reachable only from an approved assessment.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="evidence">
          <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
            <p>
              Evidence categories recorded by the frozen demo assessments: patient feedback
              samples (PER), clinical audits, accreditation records (CER), credential checks
              (MER) and outcome reports. Ratings display their evidence basis, last verification
              date, sample size and methodology version — a rating is never presented as
              clinically validated beyond what its evidence records support.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
