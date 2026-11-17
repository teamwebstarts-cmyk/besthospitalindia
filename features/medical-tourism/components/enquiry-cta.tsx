/**
 * EnquiryCta — shared call-to-action band for medical-tourism pages (Agent A06).
 *
 * Contract source: implementation/08-component-catalog.md ("EnquiryCTA") +
 * 09/12/13 page specs. Purely presentational: renders reassurance copy, a
 * primary CTA to /international-patient/enquiry (with optional preselect
 * search params) and an optional secondary link. Makes the demo-only boundary
 * explicit — no real submission happens anywhere in the mock phase.
 */

import Link from "next/link"
import { ArrowRightIcon, MessagesSquareIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes"
import { cn } from "@/lib/utils"

export interface EnquiryCtaProps {
  title: string
  description: string
  /** Query params appended to the enquiry href, e.g. specialty/treatment preselects. */
  enquiryParams?: Record<string, string>
  /** Secondary action label; renders as an outline link under the primary CTA. */
  secondaryLabel?: string
  secondaryHref?: string
  className?: string
}

export function EnquiryCta({
  title,
  description,
  enquiryParams,
  secondaryLabel,
  secondaryHref,
  className,
}: EnquiryCtaProps) {
  let enquiryHref: string = ROUTES.public.internationalPatientEnquiry
  if (enquiryParams) {
    const search = new URLSearchParams(enquiryParams).toString()
    if (search) enquiryHref = `${enquiryHref}?${search}`
  }

  return (
    <section
      aria-labelledby="enquiry-cta-heading"
      className={cn(
        "flex flex-col items-start gap-4 rounded-xl border bg-card p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-8",
        className
      )}
    >
      <div className="max-w-2xl space-y-1.5">
        <h2
          id="enquiry-cta-heading"
          className="text-xl font-semibold tracking-tight sm:text-2xl"
        >
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground">
          Demo platform: submissions stay in this browser session — nothing is
          sent to a hospital or coordinator.
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
        <Button size="lg" variant="cta" className="rounded-full font-semibold shadow-sm" render={<Link href={enquiryHref} />}>
          <MessagesSquareIcon data-icon="inline-start" aria-hidden />
          Start an enquiry
        </Button>
        {secondaryLabel && secondaryHref ? (
          <Button variant="ghost" size="sm" render={<Link href={secondaryHref} />}>
            {secondaryLabel}
            <ArrowRightIcon data-icon="inline-end" aria-hidden />
          </Button>
        ) : null}
      </div>
    </section>
  )
}
