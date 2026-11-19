/**
 * PortalPageHeader — standard heading block for Doctor Portal pages (A10).
 *
 * Composes the shared Breadcrumbs + SectionHeading with the pages/22 §4 rules:
 * one H1 per page, concise task context under it, demo-only line so no fixture
 * content can be mistaken for production data. Lives inside the A10 feature
 * folder; it is a composition of shared components, not a duplicate primitive.
 */

import type { ReactNode } from "react"

import { SectionHeading } from "@/components/shared/section-heading"
import { cn } from "@/lib/utils"

export interface PortalPageHeaderProps {
  title: string
  description?: string
  /** Right-aligned action slot (primary action must stay visible — pages/22 §4). */
  action?: ReactNode
  className?: string
}

export function PortalPageHeader({
  title,
  description,
  action,
  className,
}: PortalPageHeaderProps) {
  return (
    <div className={cn("pb-1", className)}>
      <SectionHeading as="h1" title={title} description={description} action={action} />
      <p className="mt-2 text-xs text-muted-foreground">
        Demo portal — all records, names and outcomes on this page are fictional
        fixture data. Nothing here connects to a real practice.
      </p>
    </div>
  )
}
