import type { ReactNode } from "react"

import { SectionHeading } from "@/components/shared/section-heading"
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
  /** Reserved for future in-page notices (unused). */
  showDemoNotice?: boolean
  className?: string
}

export function PortalPageHeader({
  label,
  description,
  action,
  className,
}: PortalPageHeaderProps) {
  return (
    <header className={cn("space-y-4 pb-1", className)}>
      <SectionHeading as="h1" title={label} description={description} action={action} />
    </header>
  )
}
