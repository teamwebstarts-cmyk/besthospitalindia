import type { ReactNode } from "react"

import { Breadcrumbs, type BreadcrumbItem } from "@/components/shared/breadcrumbs"
import { SectionHeading } from "@/components/shared/section-heading"
import { DemoNotice } from "@/features/content/demo-notice"
import { cn } from "@/lib/utils"

export interface AdminCasePageHeaderProps {
  /** Page label — mirrors the H1 and the breadcrumb leaf. */
  label: string
  /** Page description shown under the H1. */
  description?: string
  /** Optional page-level action (rendered right of the heading). */
  action?: ReactNode
  /** One-line demo boundary instead of the full DemoNotice (overview-style pages). */
  compact?: boolean
  className?: string
}

/**
 * AdminCasePageHeader — per-page furniture for the six A12 admin routes.
 *
 * Breadcrumb trail points at the A11-owned `/admin` dashboard (INTEGRATION
 * DEPENDENCY: that route and its shell are owned by Agent A11 and may not
 * exist yet; the breadcrumb target and the sidebar registry entry are the
 * only coupling). Server Component — actions must be server-safe or client
 * components.
 *
 * Uses the shared DemoNotice per pages/25: "All demo content must be visibly
 * non-production."
 */
export function AdminCasePageHeader({
  label,
  description,
  action,
  compact = false,
  className,
}: AdminCasePageHeaderProps) {
  const items: BreadcrumbItem[] = [
    { label: "Admin", href: "/admin" },
    { label },
  ]

  return (
    <header className={cn(compact ? "space-y-2" : "space-y-4", className)}>
      <Breadcrumbs items={items} />
      <SectionHeading
        as="h1"
        title={label}
        description={compact ? undefined : description}
        action={action}
      />
      {compact ? (
        <p className="text-xs text-muted-foreground">Demo workspace — mock data only.</p>
      ) : (
        <DemoNotice
          title="Admin demo — mock data only"
          message="This queue is a frontend demo using fictional fixtures. No real patient, provider, booking, moderation or rating activity exists behind it."
        />
      )}
    </header>
  )
}
