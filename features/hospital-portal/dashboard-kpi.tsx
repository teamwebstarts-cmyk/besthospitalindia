/**
 * DashboardKpi — hospital-portal KPI card (Agent A09 local composition).
 *
 * Catalog name: `DashboardKpi` (08-component-catalog lists it under
 * features/admin; the shared implementation does not exist yet, so A09
 * implements the same contract locally in its feature folder and a shared
 * component request is logged in the A09 report).
 *
 * Contract: label + value + optional baseline/delta + optional href. Values
 * are demo metadata derived from frozen fixtures — never presented as live
 * platform analytics.
 */

import Link from "next/link"
import { ArrowDownRightIcon, ArrowRightIcon, ArrowUpRightIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface DashboardKpiProps {
  /** KPI label, e.g. "Open enquiries". */
  label: string
  /** Main value — string so callers control formatting (counts, percent). */
  value: string
  /** Optional context line under the value. */
  hint?: string
  /**
   * Optional demo delta vs a baseline, e.g. { direction: "up", value: "+2" }.
   * Purely presentational demo metadata.
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
        <p className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">{value}</p>
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
