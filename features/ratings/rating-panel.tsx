/**
 * RatingPanel — ONE rating kind, full evidence metadata (Agent A04).
 *
 * Contract sources:
 * - implementation/08-component-catalog.md — "One rating only, evidence basis,
 *   sample/date".
 * - implementation/05-design-system.md "Rating visual rules" — separate
 *   modules/columns, never a combined star row, average or overall rating.
 * - implementation/00-project-analysis.md trust model — PER is never combined
 *   with CER/MER; missing scores render "Not yet rated" / "Assessment pending",
 *   never 0/5.
 *
 * Invariants enforced here:
 * - `score: null` always renders a status-appropriate empty-state message
 *   (never `0/5`), chosen from the mock `RatingStatus`.
 * - Labels come from RATING_LABELS by kind and stay readable (no tiny labels).
 * - Evidence basis, sample size, last assessed date, methodology version and a
 *   methodology link render alongside the score.
 * - A dev-time guard logs if a fixture ever pairs a null score with a
 *   `published` status (data contract violation — never rendered as 0/5).
 */

import Link from "next/link"
import {
  CalendarClockIcon,
  CircleCheckIcon,
  FlaskConicalIcon,
  InfoIcon,
  ShieldCheckIcon,
  StarIcon,
  UsersIcon,
} from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  ASSESSMENT_PENDING_MESSAGE,
  NOT_RATED_MESSAGE,
  RATING_LABELS,
  RATING_SCALE_MAX,
} from "@/constants/rating"
import { ROUTES } from "@/constants/routes"
import { cn } from "@/lib/utils"
import type { RatingKind, RatingStatus, RatingSummary } from "@/types"

/** Per-kind label + accent so PER and CER/MER panels are visually distinct. */
const KIND_PRESENTATION: Record<
  RatingKind,
  { label: string; description: string; accentClass: string; iconClass: string }
> = {
  PER: {
    label: RATING_LABELS.PER,
    description: "Patient feedback on care, staff and overall experience (demo metadata).",
    accentClass: "border-info/30 bg-info/5",
    iconClass: "text-info",
  },
  CER: {
    label: RATING_LABELS.CER,
    description: "Evidence-based assessment of clinical capabilities and verified outcomes (demo metadata).",
    accentClass: "border-success/30 bg-success/5",
    iconClass: "text-success",
  },
  MER: {
    label: RATING_LABELS.MER,
    description: "Evidence-based assessment of qualifications, credentials and experience (demo metadata).",
    accentClass: "border-success/30 bg-success/5",
    iconClass: "text-success",
  },
}

/** Human-readable evidence basis copy; unknown values fall back to the raw value. */
const BASIS_LABELS: Record<RatingSummary["basis"], string> = {
  patient_feedback: "Patient feedback",
  verified_evidence: "Verified evidence",
}

/** Mock status → visible chip + tone. `review_due` keeps its score but flags staleness. */
const STATUS_PRESENTATION: Record<
  RatingStatus,
  { label: string; tone: "success" | "warning" | "danger" | "info" | "neutral" }
> = {
  published: { label: "Published", tone: "success" },
  pending: { label: "Assessment pending", tone: "warning" },
  review_due: { label: "Review due", tone: "warning" },
  not_assessed: { label: "Not assessed", tone: "neutral" },
}

export interface RatingPanelProps {
  /** Exactly one rating summary; never merged with any other kind. */
  rating: RatingSummary
  /** Panel heading level — `h3` fits standard sections, `h4` inside cards. */
  headingLevel?: "h2" | "h3" | "h4"
  /** Show the full evidence block (basis, sample, date, methodology). Defaults to true. */
  showEvidence?: boolean
  className?: string
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null
  const parsed = new Date(iso)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toLocaleDateString("en-IN", { dateStyle: "medium" })
}

export function RatingPanel({ rating, headingLevel: Heading = "h3", showEvidence = true, className }: RatingPanelProps) {
  const presentation = KIND_PRESENTATION[rating.kind]
  const status = STATUS_PRESENTATION[rating.status]
  const isRated = rating.score !== null
  const lastAssessed = formatDate(rating.lastAssessedAt)

  // Trust-model guard: a null score must never pair with a published status.
  if (process.env.NODE_ENV !== "production" && !isRated && rating.status === "published") {
    console.error(
      `[RatingPanel] Demo data contract violation: rating kind "${rating.kind}" has score null but status "published". A missing score is never rendered as 0/${RATING_SCALE_MAX}.`
    )
  }

  return (
    <Card className={cn("gap-3", presentation.accentClass, className)} data-slot="rating-panel" data-rating-kind={rating.kind}>
      <CardHeader className="gap-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Heading className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <StarIcon aria-hidden className={cn("size-4 shrink-0", presentation.iconClass)} />
            {presentation.label}
            <span className="sr-only"> — {presentation.description}</span>
          </Heading>
          <StatusBadge status={rating.status} label={status.label} tone={status.tone} />
        </div>
        <p className="text-xs text-muted-foreground">{presentation.description}</p>
      </CardHeader>
      <CardContent className="gap-3">
        {isRated ? (
          <p className="flex items-baseline gap-1.5">
            <span className="text-3xl font-semibold tabular-nums text-foreground">{rating.score}</span>
            <span className="text-base font-medium text-muted-foreground">/ {RATING_SCALE_MAX}</span>
            <span className="sr-only"> — {presentation.label}</span>
          </p>
        ) : (
          <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <InfoIcon aria-hidden className="size-4 shrink-0" />
            {rating.status === "pending" ? ASSESSMENT_PENDING_MESSAGE : NOT_RATED_MESSAGE}
            <span className="sr-only"> — {presentation.label}</span>
          </p>
        )}

        {showEvidence ? (
          <dl className="grid gap-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Evidence basis</dt>
              <ShieldCheckIcon aria-hidden className="size-3.5 shrink-0" />
              <dd>
                {BASIS_LABELS[rating.basis] ?? rating.basis}
                <span className="sr-only"> evidence basis</span>
              </dd>
            </div>
            {rating.sampleSize !== null ? (
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Sample size</dt>
                <UsersIcon aria-hidden className="size-3.5 shrink-0" />
                <dd>{rating.sampleSize} data points</dd>
              </div>
            ) : null}
            {lastAssessed ? (
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Last assessed</dt>
                <CalendarClockIcon aria-hidden className="size-3.5 shrink-0" />
                <dd>Last assessed {lastAssessed}</dd>
              </div>
            ) : null}
            {rating.methodologyVersion !== null ? (
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Methodology version</dt>
                <FlaskConicalIcon aria-hidden className="size-3.5 shrink-0" />
                <dd>
                  Methodology <span className="font-mono">{rating.methodologyVersion}</span>
                </dd>
              </div>
            ) : null}
            <div className="flex items-start gap-1.5">
              <dt className="sr-only">Evidence summary</dt>
              <CircleCheckIcon aria-hidden className="mt-0.5 size-3.5 shrink-0" />
              <dd className="text-balance">{rating.evidenceSummary}</dd>
            </div>
          </dl>
        ) : null}

        <div>
          <Link
            href={ROUTES.public.ratingMethodology}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            How this rating works
            <span className="sr-only"> — {presentation.label} methodology</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
