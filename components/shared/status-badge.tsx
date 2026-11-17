import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/** Semantic tone resolved from a status value. */
export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral"

/**
 * Known status values mapped to tones. Values commonly used by the portal
 * mock data (verification, appointments, enquiries, reviews, ratings).
 * Unknown statuses fall back to "neutral".
 */
export const STATUS_TONES = {
  // Success
  verified: "success",
  approved: "success",
  active: "success",
  published: "success",
  completed: "success",
  confirmed: "success",
  responded: "success",
  resolved: "success",
  // Warning
  pending: "warning",
  pending_review: "warning",
  under_review: "warning",
  review_due: "warning",
  action_required: "warning",
  draft: "warning",
  requested: "warning",
  scheduled: "warning",
  in_progress: "warning",
  // Danger
  rejected: "danger",
  failed: "danger",
  expired: "danger",
  suspended: "danger",
  blocked: "danger",
  // Info
  new: "info",
  info: "info",
  assigned: "info",
  open: "info",
  // Neutral
  not_rated: "neutral",
  not_verified: "neutral",
  inactive: "neutral",
  archived: "neutral",
  cancelled: "neutral",
  withdrawn: "neutral",
  closed: "neutral",
} as const satisfies Record<string, StatusTone>

export type KnownStatus = keyof typeof STATUS_TONES

/**
 * Accepts any known status (autocomplete) or an arbitrary string
 * (unknown statuses render with the neutral tone).
 */
export type StatusValue = KnownStatus | (string & {})

const toneClasses: Record<StatusTone, string> = {
  success: "bg-success/10 text-success ring-success/30",
  warning: "bg-warning/10 text-warning ring-warning/30",
  danger: "bg-danger/10 text-danger ring-danger/30",
  info: "bg-info/10 text-info ring-info/30",
  neutral: "bg-muted text-muted-foreground ring-border",
}

function humanizeStatus(status: string): string {
  return status
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export interface StatusBadgeProps {
  /** Status value; unknown values render with the neutral tone. */
  status: StatusValue
  /** Optional display label override (defaults to a humanized status). */
  label?: string
  /** Optional explicit tone override, bypassing the status map. */
  tone?: StatusTone
  className?: string
}

/**
 * Maps a status value to a semantic, token-based badge
 * (success / warning / danger / info / neutral).
 */
export function StatusBadge({
  status,
  label,
  tone,
  className,
}: StatusBadgeProps) {
  const resolvedTone: StatusTone = tone ?? STATUS_TONES[status as KnownStatus] ?? "neutral"

  return (
    <Badge
      variant="outline"
      className={cn("ring-1 ring-inset", toneClasses[resolvedTone], className)}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {label ?? humanizeStatus(status)}
    </Badge>
  )
}
