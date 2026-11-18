"use client"

/**
 * AdminReviewModerationManager — /admin/reviews (pages/25 §D; FR-015).
 *
 * Review moderation queue over the frozen `Review` contract. Primary actions
 * per 14-admin-module-contracts: approve (publish), reject, flag / request
 * review. Contract rules honoured here:
 * - Review text is never edited — moderation decides visibility only.
 * - `reviewerVerification` renders exactly as the fixture declares
 *   (`verified_patient` / `email_verified` / `unverified`); nothing is
 *   upgraded to "verified" without fixture support.
 * - Rejected/flagged records stay visible in the queue — nothing is silently
 *   removed.
 * - The individual review `rating` (1–5) is a star value, NOT a PER/CER/MER
 *   score, and is labelled accordingly.
 * - Moderation history is session-local demo state (no AuditEvent fixtures
 *   exist — gap logged in the A12 report).
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
import { patientById } from "@/data"
import {
  REVIEW_STATUS_PRESENTATION,
  REVIEWER_VERIFICATION_PRESENTATION,
} from "@/features/admin/cases/case-presentations"
import { delay } from "@/features/admin/cases/demo-latency"
import { providerName, providerProfileHref } from "@/features/admin/cases/provider-lookup"
import {
  CircleAlertIcon,
  CircleCheckBigIcon,
  FlagIcon,
  SearchIcon,
  StarIcon,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { Review, ReviewStatus } from "@/types"

export interface AdminReviewModerationManagerProps {
  /** All review fixtures, fixture order (A01 `reviews`). */
  reviews: readonly Review[]
  className?: string
}

type StatusFilter = "all" | ReviewStatus

type ModerationAction = "publish" | "reject" | "flag"

const ACTION_PRESENTATION: Record<
  ModerationAction,
  { buttonLabel: string; confirmLabel: string; noteRequired: boolean; result: ReviewStatus }
> = {
  publish: {
    buttonLabel: "Approve",
    confirmLabel: "Approve & publish (demo)",
    noteRequired: false,
    result: "published",
  },
  reject: {
    buttonLabel: "Reject",
    confirmLabel: "Reject review (demo)",
    noteRequired: true,
    result: "rejected",
  },
  flag: {
    buttonLabel: "Flag",
    confirmLabel: "Flag for re-review (demo)",
    noteRequired: true,
    result: "flagged",
  },
}

function formatDateTime(iso: string): string {
  const parsed = new Date(iso)
  return Number.isNaN(parsed.getTime())
    ? iso
    : parsed.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
}

export function AdminReviewModerationManager({
  reviews,
  className,
}: AdminReviewModerationManagerProps) {
  const [statusById, setStatusById] = React.useState<Record<string, ReviewStatus>>(() =>
    Object.fromEntries(reviews.map((review) => [review.id, review.status])),
  )
  const [historyById, setHistoryById] = React.useState<Record<string, string[]>>({})

  const [query, setQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all")
  const [flash, setFlash] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)

  const flaggedCount = React.useMemo(
    () =>
      reviews.filter((review) => {
        const status = statusById[review.id] ?? review.status
        return status === "flagged" || status === "pending_moderation"
      }).length,
    [reviews, statusById],
  )

  const filtered = React.useMemo(() => {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean)
    const rows = reviews.filter((review) => {
      const status = statusById[review.id] ?? review.status
      if (statusFilter !== "all" && status !== statusFilter) return false
      if (tokens.length > 0) {
        const haystack = [
          review.id,
          review.title,
          review.body,
          providerName(review.providerType, review.providerId),
          patientById[review.patientId]?.name ?? "",
        ]
          .join(" ")
          .toLowerCase()
        if (!tokens.every((token) => haystack.includes(token))) return false
      }
      return true
    })
    // Newest first (deterministic tie-break by id).
    return [...rows].sort(
      (a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id),
    )
  }, [reviews, statusById, query, statusFilter])

  const [activeReview, setActiveReview] = React.useState<Review | null>(null)
  const [viewOnly, setViewOnly] = React.useState(false)
  const [actionMode, setActionMode] = React.useState<ModerationAction>("publish")
  const [actionNote, setActionNote] = React.useState("")
  const [noteError, setNoteError] = React.useState<string | null>(null)

  function openAction(review: Review, mode: ModerationAction) {
    setActiveReview(review)
    setViewOnly(false)
    setActionMode(mode)
    setActionNote("")
    setNoteError(null)
  }

  function openView(review: Review) {
    setActiveReview(review)
    setViewOnly(true)
    setActionNote("")
    setNoteError(null)
  }

  function closeDialog() {
    setActiveReview(null)
    setViewOnly(false)
    setNoteError(null)
  }

  async function confirmAction() {
    if (!activeReview) return
    const action = ACTION_PRESENTATION[actionMode]
    if (action.noteRequired && actionNote.trim().length < 4) {
      setNoteError("Add a short moderation note (demo) — at least 4 characters.")
      return
    }
    setPending(true)
    await delay()
    const previous = statusById[activeReview.id] ?? activeReview.status
    setStatusById((current) => ({ ...current, [activeReview.id]: action.result }))
    setHistoryById((current) => ({
      ...current,
      [activeReview.id]: [
        ...(current[activeReview.id] ?? []),
        `${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} — ${action.buttonLabel.toLowerCase()}${actionNote.trim() ? ` · “${actionNote.trim()}”` : ""} (demo)`,
      ],
    }))
    setFlash(
      action.result === "published"
        ? `Review ${activeReview.id} approved in the demo session — nothing was published to a real site.`
        : action.result === "rejected"
          ? `Review ${activeReview.id} rejected in the demo session — the record stays visible in this queue; nothing was deleted.`
          : `Review ${activeReview.id} flagged for re-review in the demo session — no notification was sent.`,
    )
    void previous
    setPending(false)
    closeDialog()
  }

  const activeStatus = activeReview
    ? (statusById[activeReview.id] ?? activeReview.status)
    : "pending_moderation"

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
          <CardTitle>Review moderation queue</CardTitle>
          <CardDescription>
            Patient reviews across hospitals and doctors. Approve, reject or flag — moderation
            changes visibility in this demo only and never edits or deletes review text.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <div className="relative xl:col-span-2">
              <SearchIcon
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search id, title, provider, patient…"
                aria-label="Search reviews"
                className="pl-8"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(next) => setStatusFilter((next ?? "all") as StatusFilter)}
            >
              <SelectTrigger aria-label="Filter reviews by status" className="w-full">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="all">All statuses</SelectItem>
                  {Object.entries(REVIEW_STATUS_PRESENTATION).map(([value, presentation]) => (
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
              <FlagIcon aria-hidden className="size-3.5 shrink-0" />
              {flaggedCount} need moderation (pending or flagged)
            </div>
          </div>

          <p aria-live="polite" className="text-xs text-muted-foreground">
            Showing {filtered.length} of {reviews.length} demo reviews, newest first.
          </p>

          {filtered.length === 0 ? (
            <EmptyState
              icon={StarIcon}
              title="No reviews match the demo filters"
              description="Adjust the search or status filter to see moderation records again."
            />
          ) : (
            <ul className="space-y-3">
              {filtered.map((review) => {
                const status = statusById[review.id] ?? review.status
                const statusPresentation = REVIEW_STATUS_PRESENTATION[status]
                const verification =
                  REVIEWER_VERIFICATION_PRESENTATION[review.reviewerVerification]
                const profileHref = providerProfileHref(review.providerType, review.providerId)
                return (
                  <li key={review.id}>
                    <article
                      className={cn(
                        "rounded-lg border bg-card p-4 shadow-xs",
                        (status === "flagged" || status === "pending_moderation") &&
                          "ring-1 ring-warning/30",
                      )}
                      aria-label={`Review ${review.id}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 font-medium text-foreground">
                            <StarIcon aria-hidden className="size-4 shrink-0 text-warning" />
                            {review.rating} / {review.scaleMax}
                            <span className="sr-only">
                              individual review star value (not a PER/CER/MER score)
                            </span>
                            <span className="truncate">· {review.title}</span>
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {review.id} ·{" "}
                            {profileHref ? (
                              <Link
                                href={profileHref}
                                className="font-medium text-primary underline-offset-4 hover:underline"
                              >
                                {providerName(review.providerType, review.providerId)}
                              </Link>
                            ) : (
                              providerName(review.providerType, review.providerId)
                            )}{" "}
                            ({review.providerType}) · {patientById[review.patientId]?.name ?? "Demo patient"}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <StatusBadge
                            status={status}
                            label={statusPresentation.label}
                            tone={statusPresentation.tone}
                          />
                          <StatusBadge
                            status={review.reviewerVerification}
                            label={verification.label}
                            tone={verification.tone}
                          />
                        </div>
                      </div>

                      <blockquote className="mt-3 rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                        {review.body}
                        <footer className="mt-1.5 text-xs">
                          Submitted {formatDateTime(review.createdAt)} · fictional demo feedback
                        </footer>
                      </blockquote>

                      {review.reply ? (
                        <p className="mt-2 rounded-md border border-info/30 bg-info/5 p-3 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">Partner reply (demo):</span>{" "}
                          {review.reply.body}
                          <span className="mt-1 block">
                            — {review.reply.repliedBy}, {formatDateTime(review.reply.repliedAt)}
                          </span>
                        </p>
                      ) : null}

                      {historyById[review.id]?.length ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Demo moderation history: {historyById[review.id].join(" · ")}
                        </p>
                      ) : null}

                      <div className="mt-3 flex flex-wrap justify-end gap-1.5">
                        <Button variant="ghost" size="xs" onClick={() => openView(review)}>
                          View
                        </Button>
                        {status !== "published" ? (
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => openAction(review, "publish")}
                            aria-label={`Approve review ${review.id}`}
                          >
                            Approve
                          </Button>
                        ) : null}
                        {status !== "flagged" ? (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => openAction(review, "flag")}
                            aria-label={`Flag review ${review.id} for re-review`}
                          >
                            Flag
                          </Button>
                        ) : null}
                        {status !== "rejected" ? (
                          <Button
                            variant="destructive"
                            size="xs"
                            onClick={() => openAction(review, "reject")}
                            aria-label={`Reject review ${review.id}`}
                          >
                            Reject
                          </Button>
                        ) : null}
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
        open={activeReview !== null}
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
      >
        <DialogContent aria-describedby="admin-review-dialog-desc">
          <DialogHeader>
            <DialogTitle>
              {viewOnly
                ? `Review ${activeReview?.id}`
                : `${ACTION_PRESENTATION[actionMode].buttonLabel} review — ${activeReview?.id}`}
            </DialogTitle>
            <DialogDescription id="admin-review-dialog-desc">
              Demo action only — nothing is published, removed or reported to any real platform.
              The review text itself is read-only.
            </DialogDescription>
          </DialogHeader>

          {activeReview ? (
            <div className="space-y-4">
              <dl className="grid gap-1.5 rounded-md border bg-muted/40 p-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Provider</dt>
                  <dd className="text-right font-medium">
                    {providerName(activeReview.providerType, activeReview.providerId)} (
                    {activeReview.providerType})
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Patient</dt>
                  <dd className="text-right font-medium">
                    {patientById[activeReview.patientId]?.name ?? "Demo patient"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Star value (single review)</dt>
                  <dd className="text-right font-medium">
                    {activeReview.rating} / {activeReview.scaleMax}
                    <span className="block text-xs text-muted-foreground">
                      Not a PER, CER or MER rating.
                    </span>
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Reviewer verification</dt>
                  <dd className="text-right">
                    <StatusBadge
                      status={activeReview.reviewerVerification}
                      label={
                        REVIEWER_VERIFICATION_PRESENTATION[activeReview.reviewerVerification].label
                      }
                      tone={REVIEWER_VERIFICATION_PRESENTATION[activeReview.reviewerVerification].tone}
                    />
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Current status</dt>
                  <dd>
                    <StatusBadge
                      status={activeStatus}
                      label={REVIEW_STATUS_PRESENTATION[activeStatus].label}
                      tone={REVIEW_STATUS_PRESENTATION[activeStatus].tone}
                    />
                  </dd>
                </div>
              </dl>

              <blockquote className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{activeReview.title}</p>
                <p className="mt-1">{activeReview.body}</p>
              </blockquote>

              {!viewOnly ? (
                <div className="flex min-w-0 flex-col gap-1.5">
                  <Label htmlFor="admin-review-note">
                    Moderation note
                    {ACTION_PRESENTATION[actionMode].noteRequired ? (
                      <span aria-hidden className="text-destructive">*</span>
                    ) : null}
                  </Label>
                  <Textarea
                    id="admin-review-note"
                    value={actionNote}
                    onChange={(event) => {
                      setActionNote(event.target.value)
                      setNoteError(null)
                    }}
                    aria-invalid={noteError ? true : undefined}
                    aria-describedby={noteError ? "admin-review-note-error" : undefined}
                    rows={3}
                    placeholder={
                      ACTION_PRESENTATION[actionMode].noteRequired
                        ? "Required for reject / flag (demo note only)"
                        : "Optional demo note stored on this record only"
                    }
                  />
                  {noteError ? (
                    <p
                      id="admin-review-note-error"
                      role="alert"
                      className="text-xs font-medium text-destructive"
                    >
                      {noteError}
                    </p>
                  ) : null}
                  <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <CircleAlertIcon aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                    Rejected and flagged reviews remain visible in the queue — no silent removal.
                  </p>
                </div>
              ) : historyById[activeReview.id]?.length ? (
                <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">Demo moderation history</p>
                  <ul className="mt-1 list-inside list-disc space-y-0.5">
                    {historyById[activeReview.id].map((entry, index) => (
                      <li key={`${entry}-${index}`}>{entry}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No demo moderation history recorded for this review yet.
                </p>
              )}
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Close
            </Button>
            {!viewOnly ? (
              <Button
                variant={actionMode === "reject" ? "destructive" : "default"}
                onClick={confirmAction}
                disabled={pending}
              >
                {pending ? "Saving (demo)…" : ACTION_PRESENTATION[actionMode].confirmLabel}
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        Demo boundary: moderation decisions update local state only — nothing is published,
        deleted or reported to a real platform, and review authenticity is shown exactly as the
        fixtures declare it.
        <Badge variant="outline">Mock phase</Badge>
      </p>
    </div>
  )
}
