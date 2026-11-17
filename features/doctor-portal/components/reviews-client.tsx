"use client"

/**
 * ReviewsClient — /doctor-portal/reviews (pages/64).
 *
 * Patient feedback view + permitted response drafts per spec. Rules:
 * - Patient review content is never editable or deletable — the composer only
 *   drafts a partner reply.
 * - Replies are permitted on published reviews only; pending_moderation /
 *   rejected / flagged reviews expose no reply control (moderation rules
 *   respected — pages/64 acceptance).
 * - The individual review stars are NOT the PER — PER renders separately from
 *   the fixture RatingSummary, so no rating can be manipulated from here.
 * - One reply per review (fixture `reply` is single-valued); an existing reply
 *   renders read-only with its metadata.
 */

import { useState, useMemo } from "react"
import Link from "next/link"
import { StarIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { NOT_RATED_MESSAGE, RATING_LABELS, RATING_SCALE_MAX } from "@/constants/rating"
import { ROUTES } from "@/constants/routes"
import { formatDate, formatDateTime } from "@/features/doctor-portal/format"
import { cn } from "@/lib/utils"
import { maxLength, minLength, required, validate } from "@/lib/validation"
import type { RatingSummary, Review, ReviewStatus } from "@/types"

// ---------------------------------------------------------------------------
// Reply rules + local mock state
// ---------------------------------------------------------------------------

/** Replies are allowed only on published reviews without an existing reply. */
export function replyAllowed(review: Review): boolean {
  return review.status === "published" && review.reply === undefined
}

export interface ReviewWithDraft {
  review: Review
  /** Local drafted reply; null until composed in this session. */
  draftedReply: string | null
  draftedAt: string | null
}

export interface ReviewsClientState {
  entries: ReviewWithDraft[]
  notice: string | null
}

export type ReviewsAction =
  | { type: "save-draft"; reviewId: string; body: string }
  | { type: "dismiss-notice" }

export function reviewsReducer(
  state: ReviewsClientState,
  action: ReviewsAction,
): ReviewsClientState {
  switch (action.type) {
    case "save-draft":
      return {
        ...state,
        notice: `Response draft saved locally for review ${action.reviewId}. Drafts are never published or sent in this demo.`,
        entries: state.entries.map((entry) =>
          entry.review.id === action.reviewId
            ? { ...entry, draftedReply: action.body, draftedAt: new Date().toISOString() }
            : entry,
        ),
      }
    case "dismiss-notice":
      return { ...state, notice: null }
    default:
      return state
  }
}

export function makeInitialReviewsState(
  reviews: readonly Review[],
): ReviewsClientState {
  return {
    entries: reviews.map((review) => ({
      review,
      draftedReply: null,
      draftedAt: null,
    })),
    notice: null,
  }
}

type ReviewFilter = "all" | ReviewStatus | "needs_reply"

const FILTER_OPTIONS: ReadonlyArray<{ value: ReviewFilter; label: string }> = [
  { value: "all", label: "All reviews" },
  { value: "needs_reply", label: "Published, awaiting reply" },
  { value: "published", label: "Published" },
  { value: "pending_moderation", label: "Pending moderation" },
  { value: "flagged", label: "Flagged" },
  { value: "rejected", label: "Rejected" },
]

function matchesFilter(entry: ReviewWithDraft, filter: ReviewFilter): boolean {
  switch (filter) {
    case "all":
      return true
    case "needs_reply":
      return replyAllowed(entry.review)
    default:
      return entry.review.status === filter
  }
}

// ---------------------------------------------------------------------------
// Review card
// ---------------------------------------------------------------------------

function ReviewStars({ rating, scaleMax }: { rating: number; scaleMax: number }) {
  return (
    <p
      className="flex items-center gap-0.5"
      aria-label={`Rated ${rating} out of ${scaleMax} stars`}
    >
      {Array.from({ length: scaleMax }, (_, index) => (
        <StarIcon
          key={index}
          aria-hidden
          className={cn(
            "size-3.5",
            index < rating ? "fill-warning text-warning" : "text-muted-foreground/40",
          )}
        />
      ))}
      <span className="ml-1 text-xs font-medium text-foreground">
        {rating}/{scaleMax}
      </span>
    </p>
  )
}

function ReviewerBadge({ verification }: { verification: Review["reviewerVerification"] }) {
  const label =
    verification === "verified_patient"
      ? "Verified patient (demo)"
      : verification === "email_verified"
        ? "Email verified (demo)"
        : "Unverified reviewer"
  return (
    <Badge variant="outline" className="text-muted-foreground">
      {label}
    </Badge>
  )
}

function ReplyComposer({
  entry,
  onSave,
}: {
  entry: ReviewWithDraft
  onSave: (reviewId: string, body: string) => void
}) {
  const [body, setBody] = useState(entry.draftedReply ?? "")
  const [error, setError] = useState<string | null>(null)
  const id = `reply-${entry.review.id}`

  function handleSave() {
    const errors = validate(
      { body: [required("Reply"), minLength(10), maxLength(1200)] },
      { body },
    )
    if (errors.body) {
      setError(errors.body)
      return
    }
    onSave(entry.review.id, body.trim())
  }

  return (
    <div className="space-y-2 rounded-lg border border-dashed p-3">
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        Response draft (demo — never published)
      </Label>
      <Textarea
        id={id}
        rows={3}
        value={body}
        onChange={(event) => {
          setBody(event.target.value)
          setError(null)
        }}
        placeholder="Thank the patient and note anything you would do differently. Stays local in this demo."
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <Button size="xs" onClick={handleSave}>
          Save draft (demo)
        </Button>
        <p className="text-xs text-muted-foreground">
          You cannot edit or delete the patient&apos;s review text — only this reply draft.
        </p>
      </div>
    </div>
  )
}

function ReviewCard({
  entry,
  onSaveDraft,
}: {
  entry: ReviewWithDraft
  onSaveDraft: (reviewId: string, body: string) => void
}) {
  const review = entry.review
  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <CardTitle className="min-w-0 truncate">{review.title}</CardTitle>
            <CardDescription>
              {formatDate(review.createdAt)} · review {review.id}
            </CardDescription>
          </div>
          <StatusBadge status={review.status} />
        </div>
      </CardHeader>
      <CardContent className="gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <ReviewStars rating={review.rating} scaleMax={review.scaleMax} />
          <ReviewerBadge verification={review.reviewerVerification} />
        </div>
        <p className="text-sm leading-relaxed text-foreground">{review.body}</p>

        {/* Existing fixture reply — read-only */}
        {review.reply ? (
          <div className="space-y-1 rounded-lg border bg-muted/40 p-3">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Partner reply on record (fixture)
            </p>
            <p className="text-sm text-foreground">{review.reply.body}</p>
            <p className="text-xs text-muted-foreground">
              {review.reply.repliedBy} · {formatDateTime(review.reply.repliedAt)}
            </p>
          </div>
        ) : null}

        {/* Local drafted reply */}
        {entry.draftedReply ? (
          <div className="space-y-1 rounded-lg border border-info/40 bg-info/5 p-3">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Your response draft (local)
            </p>
            <p className="text-sm text-foreground">{entry.draftedReply}</p>
            <p className="text-xs text-muted-foreground">
              Drafted {formatDateTime(entry.draftedAt)} — not published, not sent.
            </p>
          </div>
        ) : replyAllowed(review) ? (
          <ReplyComposer entry={entry} onSave={onSaveDraft} />
        ) : (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {review.status === "published"
              ? "A reply is already on record for this review — replies are single-threaded in the demo contract."
              : "Replies unlock only after a review is published. This review is still in moderation, so no reply control is shown."}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface ReviewsClientProps {
  reviews: readonly Review[]
  /** The doctor's PER fixture — rendered read-only beside the feedback list. */
  per: RatingSummary
  doctorName: string
  className?: string
}

export function ReviewsClient({ reviews, per, doctorName, className }: ReviewsClientProps) {
  const [state, setState] = useState(() => makeInitialReviewsState(reviews))
  const [filter, setFilter] = useState<ReviewFilter>("all")

  const visible = useMemo(
    () => state.entries.filter((entry) => matchesFilter(entry, filter)),
    [state.entries, filter],
  )

  const needsReplyCount = state.entries.filter((entry) => replyAllowed(entry.review)).length

  function saveDraft(reviewId: string, body: string) {
    setState((previous) =>
      reviewsReducer(previous, { type: "save-draft", reviewId, body }),
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* PER context — read-only, separate from individual review stars */}
      <Card size="sm" className="border-info/30 bg-info/5">
        <CardContent className="gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-foreground">
              {RATING_LABELS.PER} ({per.kind})
            </p>
            <StatusBadge status={per.status} />
          </div>
          <p className="text-sm text-foreground">
            {per.score !== null ? (
              <>
                {per.score} / {RATING_SCALE_MAX}
              </>
            ) : (
              NOT_RATED_MESSAGE
            )}
            <span className="text-muted-foreground">
              {" "}
              · {per.sampleSize ?? 0} demo data points · assessed{" "}
              {formatDate(per.lastAssessedAt, "never")}
            </span>
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {per.evidenceSummary} The score above is the platform assessment — the star values
            on individual reviews below never change it, and nothing on this page can edit any
            rating.{" "}
            <Link
              href={ROUTES.public.ratingMethodology}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              How this rating works
            </Link>
          </p>
        </CardContent>
      </Card>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Label htmlFor="reviews-filter" className="text-sm text-muted-foreground">
            Show
          </Label>
          <Select
            value={filter}
            onValueChange={(value) => {
              if (typeof value === "string") setFilter(value as ReviewFilter)
            }}
          >
            <SelectTrigger id="reviews-filter" className="w-56">
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
          {visible.length} of {state.entries.length} reviews
          {needsReplyCount > 0 ? ` · ${needsReplyCount} awaiting reply` : ""}
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
            onClick={() => setState((previous) => reviewsReducer(previous, { type: "dismiss-notice" }))}
          >
            Dismiss
          </Button>
        </div>
      ) : null}

      {visible.length === 0 ? (
        <EmptyState
          title="No reviews match this filter"
          description="Switch back to “All reviews” to see the full demo feedback list for this profile."
          action={{ label: "Show all reviews", onClick: () => setFilter("all") }}
        />
      ) : (
        <ul className="space-y-4" aria-label={`Patient reviews for ${doctorName}`}>
          {visible.map((entry) => (
            <li key={entry.review.id}>
              <ReviewCard entry={entry} onSaveDraft={saveDraft} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
