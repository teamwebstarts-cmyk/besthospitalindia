/**
 * DoctorKpi — dashboard metric card for the Doctor Portal (A10).
 *
 * Catalog contract (08-component-catalog.md "DashboardKpi — value + baseline +
 * optional delta") is owned by A11 (features/admin/components/dashboard-kpi.tsx
 * does not exist yet). Per the ownership rules (agent-a10 brief: "If a required
 * shared component is missing, report the exact contract needed instead of
 * cloning it") this is a LOCAL doctor-portal variant, not a fork of a shared
 * file: it lives entirely inside features/doctor-portal and shares nothing with
 * the future admin component. A11 may absorb this shape when /admin lands.
 *
 * Rating rule honored: a KPI value of "Not yet rated" / "Not assessed" renders
 * missing data honestly — never as 0.
 */

import Link from "next/link"
import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface DoctorKpiProps {
  /** Metric label, e.g. "Open appointment requests". */
  label: string
  /** Main value — string so callers can render "—" / "Not yet rated" honestly. */
  value: string
  /** Supporting line under the value (demo metadata, counts, dates). */
  hint?: string
  icon?: LucideIcon
  /** Visual accent for the leading icon. */
  tone?: "info" | "success" | "warning" | "neutral"
  /** Optional internal route; when set the card title area becomes one link. */
  href?: string
  className?: string
}

const toneClasses: Record<NonNullable<DoctorKpiProps["tone"]>, string> = {
  info: "bg-info/10 text-info",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  neutral: "bg-muted text-muted-foreground",
}

export function DoctorKpi({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
  href,
  className,
}: DoctorKpiProps) {
  return (
    <Card size="sm" data-slot="doctor-kpi" className={cn("gap-2 py-4", className)}>
      <CardContent className="gap-2">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {Icon ? (
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-md",
                toneClasses[tone],
              )}
            >
              <Icon aria-hidden className="size-4" />
            </span>
          ) : null}
        </div>
        <p className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">
          {value}
        </p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        {href ? (
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            View details
            <span className="sr-only"> — {label}</span>
          </Link>
        ) : null}
      </CardContent>
    </Card>
  )
}
