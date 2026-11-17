"use client"

/**
 * ReviewResponseManager — hospital reviews (pages/52).
 *
 * Review cards with status filter and a LOCAL response composer. Contract
 * rules from the spec:
 * - The patient review text is never editable (read-only display).
 * - Partner replies stay LOCAL DRAFTS — no reply is published, stored or
 *   sent; a "draft saved" confirmation states exactly that.
 * - No rating manipulation of any kind is offered (no flag-for-removal,
 *   no score editing; moderation is admin-owned and absent here).
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { StarIcon } from "lucide-react"
import type { Review, ReviewerVerification, ReviewStatus } from "@/types"
import { cn } from "@/lib/utils"

export interface ReviewResponseManagerProps {
  reviews: readonly Review[]
  /** Deep-linked review id from the dashboard queue, if any. */
  initialReviewKey?: string
  className?: string
}

type StatusFilter = "all" | ReviewStatus

const VERIFICATION_LABELS: Record<ReviewerVerification, string> = {
  verified_patient: "Verified patient",
  email_verified: "Email verified",
  unverified: "Unverified reviewer",
}

export function ReviewResponseManager({
  reviews,
  initialReviewKey,
  className,
}: ReviewResponseManagerProps) {
  // Local draft replies: review id → draft text; and saved-flag map.
  const [drafts, setDrafts] = React.useState<Record<string, string>>({})
  const [savedDrafts, setSavedDrafts] = React.useState<Record<string, true>>({})
  const [draftErrors, setDraftErrors] = React.useState<Record<string, string>>({})
  // Deep-linked review id (from a dashboard queue) — resolved once at mount.
  const [highlightedReviewId] = React.useState<string | undefined>(initialReviewKey)
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all")

  const filtered = React.useMemo(() => {
    if (statusFilter === "all") return reviews
    return reviews.filter((review) => review.status === statusFilter)
  }, [reviews, statusFilter])

  function setDraft(reviewId: string, text: string) {
    setDrafts((current) => ({ ...current, [reviewId]: text }))
    setDraftErrors((current) => {
      if (!current[reviewId]) return current
      const next = { ...current }
      delete next[reviewId]
      return next
    })
  }

  function saveDraft(review: Review) {
    const text = (drafts[review.id] ?? "").trim()
    if (text.length < 20) {
      setDraftErrors((current) => ({
        ...current,
        [review.id]: "Draft a response of at least 20 characters before saving.",
      }))
      return
    }
    if (text.length > 2000) {
      setDraftErrors((current) => ({ ...current, [review.id]: "Drafts stay under 2000 characters." }))
      return
    }
    setDraftErrors((current) => {
      const next = { ...current }
      delete next[review.id]
      return next
    })
    setSavedDrafts((current) => ({ ...current, [review.id]: true }))
  }

  const statusOptions: Array<{ value: StatusFilter; label: string }> = [
    { value: "all", label: "All statuses" },
    { value: "published", label: "Published" },
    { value: "pending_moderation", label: "Pending moderation" },
    { value: "rejected", label: "Rejected" },
    { value: "flagged", label: "Flagged" },
  ]

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={(next) => setStatusFilter((next ?? "all") as StatusFilter)}>
          <SelectTrigger aria-label="Filter reviews by status" className="w-full sm:w-52">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Review status</SelectLabel>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <p aria-live="polite" className="text-xs text-muted-foreground">
          Showing {filtered.length} of {reviews.length} demo reviews.
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No reviews match this filter"
          description="Hospital reviews from the demo fixture set appear here with their moderation status."
        />
      ) : (
        <ul className="space-y-4" aria-label="Hospital reviews (demo)">
          {filtered.map((review) => {
            const hasFixtureReply = review.reply !== undefined
            const draft = drafts[review.id] ?? ""
            const saved = savedDrafts[review.id] === true
            const error = draftErrors[review.id]
            const isHighlighted = review.id === highlightedReviewId

            return (
              <li key={review.id}>
                <Card
                  id={`review-${review.id}`}
                  tabIndex={-1}
                  aria-current={isHighlighted ? "true" : undefined}
                  className={cn(
                    isHighlighted && "border-primary/60 ring-2 ring-primary/30",
                  )}
                >
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <CardTitle className="text-base">{review.title}</CardTitle>
                        <CardDescription>
                          {review.rating}/{review.scaleMax} · {formatDate(review.createdAt)} ·{" "}
                          {VERIFICATION_LABELS[review.reviewerVerification]}
                        </CardDescription>
                      </div>
                      <StatusBadge status={review.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="gap-4">
                    {/* Patient review text — read-only by contract. */}
                    <blockquote className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                      {review.body}
                      <span className="sr-only">
                        — patient review text, read-only in the partner portal
                      </span>
                    </blockquote>

                    {hasFixtureReply ? (
                      <div className="rounded-md border border-info/30 bg-info/5 p-3 text-sm">
                        <p className="font-medium text-foreground">
                          Reply on record (fixture) — {review.reply?.repliedBy}
                        </p>
                        <p className="mt-1 text-muted-foreground">{review.reply?.body}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Replied {formatDate(review.reply?.repliedAt ?? "")}. Demo record only.
                        </p>
                      </div>
                    ) : review.status === "published" ? (
                      <div className="space-y-2">
                        <label
                          htmlFor={`reply-${review.id}`}
                          className="text-sm font-medium text-foreground"
                        >
                          Your response (stays a draft in the demo)
                        </label>
                        <Textarea
                          id={`reply-${review.id}`}
                          value={draft}
                          onChange={(event) => setDraft(review.id, event.target.value)}
                          aria-invalid={error ? true : undefined}
                          aria-describedby={
                            error ? `reply-${review.id}-error` : `reply-${review.id}-hint`
                          }
                          rows={3}
                          placeholder="Draft a professional response… (demo only, never published)"
                          maxLength={2000}
                        />
                        <p id={`reply-${review.id}-hint`} className="text-xs text-muted-foreground">
                          {draft.trim().length}/2000 characters. Publishing replies is not available
                          in the mock phase.
                        </p>
                        {error ? (
                          <p
                            id={`reply-${review.id}-error`}
                            role="alert"
                            className="text-xs font-medium text-destructive"
                          >
                            {error}
                          </p>
                        ) : null}
                        <div className="flex flex-wrap items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => saveDraft(review)}>
                            Save draft (demo)
                          </Button>
                          {saved ? (
                            <span
                              role="status"
                              className="inline-flex items-center gap-1 text-xs font-medium text-success"
                            >
                              <StarIcon aria-hidden className="size-3" />
                              Draft saved locally — not published, not sent.
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Responses can be drafted only for published reviews. This review is{" "}
                        {review.status.replace(/_/g, " ")} — moderation is owned by platform admin
                        in the demo model.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </li>
            )
          })}
        </ul>
      )}

      <p className="text-xs text-muted-foreground">
        Demo boundary: partner responses are local drafts only. Review moderation, takedown and
        rating changes are admin-owned platform actions that this portal never offers.
      </p>
    </div>
  )
}

function formatDate(iso: string | null): string {
  if (!iso) return "—"
  const parsed = new Date(iso)
  return Number.isNaN(parsed.getTime())
    ? iso
    : parsed.toLocaleDateString("en-IN", { dateStyle: "medium" })
}
