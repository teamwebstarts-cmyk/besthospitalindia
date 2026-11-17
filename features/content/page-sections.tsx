import type { ReactNode } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Breadcrumbs,
  type BreadcrumbItem,
} from "@/components/shared/breadcrumbs"
import { SectionHeading } from "@/components/shared/section-heading"
import { cn } from "@/lib/utils"

export interface PageHeaderProps {
  /** Page H1 — exactly one per page. */
  title: string
  /** Lead paragraph under the H1. */
  description?: string
  /** Trail from Home to the current page (last item renders as current). */
  breadcrumbItems?: BreadcrumbItem[]
  /** Optional extra row under the description (e.g. DemoNotice). */
  children?: ReactNode
  className?: string
}

/**
 * Informational/legal page header: breadcrumb trail, H1 and lead copy.
 * The public route-group layout already provides the site shell.
 */
export function PageHeader({
  title,
  description,
  breadcrumbItems,
  children,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("space-y-4 border-b pb-8", className)}>
      {breadcrumbItems && breadcrumbItems.length > 0 ? (
        <Breadcrumbs items={breadcrumbItems} />
      ) : null}
      <SectionHeading as="h1" title={title} description={description} />
      {children}
    </header>
  )
}

export interface PageSectionProps {
  /** Section H2. */
  title: string
  /** Optional lead paragraph under the H2. */
  description?: string
  /** Optional anchor id for in-page navigation links. */
  id?: string
  children?: ReactNode
  className?: string
}

/**
 * Long-form content section with a semantic H2 heading and readable measure.
 */
export function PageSection({
  title,
  description,
  id,
  children,
  className,
}: PageSectionProps) {
  return (
    <section id={id} className={cn("scroll-mt-24 space-y-4", className)}>
      <SectionHeading as="h2" title={title} description={description} />
      {children ? (
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          {children}
        </div>
      ) : null}
    </section>
  )
}

export interface LegalDraftNoticeProps {
  className?: string
}

/**
 * Draft-pending banner for legal pages whose approved text has not been
 * supplied. Placeholder copy on these pages is explicitly not legal advice.
 */
export function LegalDraftNotice({ className }: LegalDraftNoticeProps) {
  return (
    <Alert className={className}>
      <AlertTitle>DRAFT — Pending approved legal text</AlertTitle>
      <AlertDescription>
        This page contains neutral placeholder policy copy for the demo build.
        It is not approved legal text, has not been reviewed by legal counsel,
        and must not be relied on as legal advice. Final wording will be
        supplied by the platform owner.
      </AlertDescription>
    </Alert>
  )
}
