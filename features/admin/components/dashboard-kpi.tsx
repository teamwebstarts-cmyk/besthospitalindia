/**
 * DashboardKpi — admin dashboard metric card (A11 catalog composition).
 *
 * Catalog contract (08-component-catalog.md): "value + baseline + optional
 * delta". A09 and A10 implemented local variants and logged a shared-component
 * request for this file ("A11 may absorb this shape when /admin lands"); this
 * is the catalog home, matching the hospital-portal variant's contract so the
 * three portals stay visually consistent.
 *
 * Rules honored:
 * - Values are demo metadata derived from frozen fixtures — never presented
 *   as live platform analytics (pages/23 §6: "Do not … claim that illustrative
 *   metrics are live").
 * - String values so callers can render "Not yet rated" honestly for missing
 *   scores — never 0/5.
 */

import Link from "next/link"
import { ArrowDownRightIcon, ArrowRightIcon, ArrowUpRightIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface DashboardKpiProps {
  /** KPI label, e.g. "Total hospitals". */
  label: string
  /** Main value — string so callers control formatting and missing states. */
  value: string
  /** Optional context line under the value. */
  hint?: string
  /**
   * Optional demo delta vs a baseline, e.g. { direction: "up", value: "+2" }.
   * Purely presentational demo metadata with an explicit sr-only baseline.
   */
  delta?: { direction: "up" | "down" | "flat"; value: string }
  /** Optional internal route — renders the whole card as a link. */
  href?: string
  /** Optional leading icon. */
  icon?: React.ComponentType<{ className?: string }>
  className?: string
}

export function DashboardKpi({
  label,
  value,
  hint,
  delta,
  href,
  icon: Icon,
  className,
}: DashboardKpiProps) {
  const DeltaIcon =
    delta?.direction === "up"
      ? ArrowUpRightIcon
      : delta?.direction === "down"
        ? ArrowDownRightIcon
        : null

  const body = (
    <CardContent className="gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon ? <Icon aria-hidden className="size-4 shrink-0 text-muted-foreground" /> : null}
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
          {value}
        </p>
        {delta && DeltaIcon ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-medium",
              delta.direction === "up" && "text-success",
              delta.direction === "down" && "text-destructive",
              delta.direction === "flat" && "text-muted-foreground",
            )}
          >
            <DeltaIcon aria-hidden className="size-3" />
            {delta.value}
            <span className="sr-only"> vs previous demo period</span>
          </span>
        ) : null}
      </div>
      {hint ? <p className="text-xs text-balance text-muted-foreground">{hint}</p> : null}
      {href ? (
        <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary">
          View
          <ArrowRightIcon aria-hidden className="size-3" />
          <span className="sr-only">{label}</span>
        </p>
      ) : null}
    </CardContent>
  )

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "group/kpi rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 outline-none transition-shadow focus-visible:ring-3 focus-visible:ring-ring/50 hover:ring-foreground/20",
          className,
        )}
      >
        {body}
      </Link>
    )
  }

  return <Card className={className}>{body}</Card>
}
