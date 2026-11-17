import type { ReactNode } from "react"

import { Breadcrumbs, type BreadcrumbItem } from "@/components/shared/breadcrumbs"
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
  className?: string
}

export function PortalPageHeader({ label, description, action, className }: PortalPageHeaderProps) {
  const items: BreadcrumbItem[] = [
    { label: "Dashboard", href: "/hospital-portal" },
    { label },
  ]

  return (
    <header className={cn("space-y-4", className)}>
      <Breadcrumbs items={items} />
      <SectionHeading as="h1" title={label} description={description} action={action} />
      <DemoNotice
        title="Demo portal — mock data only"
        message="This workspace is a frontend demo using fictional fixtures. No real hospital, patient, booking, document or rating activity exists behind it."
      />
    </header>
  )
}
