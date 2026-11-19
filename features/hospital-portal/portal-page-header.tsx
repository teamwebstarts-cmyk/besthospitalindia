import type { ReactNode } from "react"

import { SectionHeading } from "@/components/shared/section-heading"
import { DemoNotice } from "@/features/content/demo-notice"
import { cn } from "@/lib/utils"

/**
 * PortalPageHeader — per-page furniture for hospital-portal pages (A09).
 *
 * Breadcrumb trail (Dashboard → page), semantic single H1 via SectionHeading,
 * the shared DemoNotice for the mock-only boundary, and a page-level action
 * slot. Server Component — actions must be server-safe or client components.
 */

export interface PortalPageHeaderProps {
  /** Breadcrumb trail after "Dashboard". The last item mirrors the H1. */
  label: string
  /** Page description shown under the H1. */
  description?: string
  /** Optional page-level action (rendered right of the heading). */
  action?: ReactNode
  /** When false, skips the page-level DemoNotice (shell topbar already states demo scope). */
  showDemoNotice?: boolean
  className?: string
}

export function PortalPageHeader({
  label,
  description,
  action,
  showDemoNotice = true,
  className,
}: PortalPageHeaderProps) {
  return (
    <header className={cn("space-y-4 pb-1", className)}>
      <SectionHeading as="h1" title={label} description={description} action={action} />
      {showDemoNotice ? (
        <DemoNotice
          title="Demo portal — mock data only"
          message="Fictional fixture data only — nothing here is sent or stored."
        />
      ) : (
        <p className="text-xs text-muted-foreground lg:hidden">Demo — fixture data only.</p>
      )}
    </header>
  )
}
