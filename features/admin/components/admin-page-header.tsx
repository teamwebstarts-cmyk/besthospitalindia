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

import { Breadcrumbs, type BreadcrumbItem } from "@/components/shared/breadcrumbs"
import { SectionHeading } from "@/components/shared/section-heading"
import { DemoNotice } from "@/features/content/demo-notice"

export interface AdminPageHeaderProps {
  /** Breadcrumb trail; the last item mirrors the H1. */
  items: BreadcrumbItem[]
  title: string
  description?: string
  /** Right-aligned action slot (primary action must stay visible). */
  action?: ReactNode
  className?: string
}

export function AdminPageHeader({
  items,
  title,
  description,
  action,
  className,
}: AdminPageHeaderProps) {
  return (
    <header className={className}>
      <Breadcrumbs items={items} />
      <SectionHeading
        as="h1"
        title={title}
        description={description}
        action={action}
        className="mt-2"
      />
      <DemoNotice
        className="mt-4"
        title="Demo admin workspace — mock data only"
        message="Every record on this page is fictional fixture data. Status changes are local demo state: nothing is sent, published, verified or notified, and no real provider, patient or partner exists behind any row."
      />
    </header>
  )
}
