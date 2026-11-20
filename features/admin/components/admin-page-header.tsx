/**
 * AdminPageHeader — standard heading block for Admin Portal pages (A11).
 *
 * Composes the shared Breadcrumbs + SectionHeading + DemoNotice (A00/content
 * primitives) with the pages/23 §4 + pages/24 §4 rules: one H1 per page,
 * concise task context under it, and a demo-only boundary line so no fixture
 * content can be mistaken for production data. Lives inside the A11 feature
 * folder — a composition of shared components, not a duplicate primitive.
 */

import type { ReactNode } from "react"

import { SectionHeading } from "@/components/shared/section-heading"
import { DemoNotice } from "@/features/content/demo-notice"
import { cn } from "@/lib/utils"

export interface AdminPageHeaderProps {
  title: string
  description?: string
  /** Right-aligned action slot (primary action must stay visible). */
  action?: ReactNode
  /**
   * Dashboard-style header: one-line demo boundary instead of the full
   * DemoNotice alert (reduces vertical noise on overview screens).
   */
  compact?: boolean
  /** Hide the extra demo line when the page description is already enough. */
  showDemoNote?: boolean
  className?: string
}

export function AdminPageHeader({
  title,
  description,
  action,
  compact = false,
  showDemoNote = false,
  className,
}: AdminPageHeaderProps) {
  return (
    <header className={cn("pb-1", className)}>
      <SectionHeading as="h1" title={title} description={description} action={action} />
      {showDemoNote ? (
        compact ? (
          <p className="mt-2 text-xs text-muted-foreground">Platform workspace</p>
        ) : (
          <DemoNotice
            className="mt-4"
            title="Admin workspace"
            message="Changes here update the live catalogue and query records shared with city desks."
          />
        )
      ) : null}
    </header>
  )
}
