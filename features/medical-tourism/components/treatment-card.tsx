/**
 * TreatmentCard — discovery card for treatment listings (Agent A06).
 *
 * Contract source: implementation/08-component-catalog.md ("TreatmentCard") +
 * 10-treatments.md. Purely presentational: takes a Treatment + its owning
 * Specialty from typed fixtures; NO prices, outcomes or clinical claims.
 * Links to the treatment detail page and, optionally, preselects the
 * specialty in the enquiry page via search param.
 */

import Link from "next/link"
import { ArrowRightIcon, StethoscopeIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ROUTES, treatmentDetailHref } from "@/constants/routes"
import { cn } from "@/lib/utils"
import type { Specialty, Treatment } from "@/types"

export interface TreatmentCardProps {
  treatment: Treatment
  /** Owning specialty, resolved by the caller from fixture lookups. */
  specialty?: Specialty
  /** Optional count of hospitals listing this treatment (demo metadata). */
  hospitalCount?: number
  /** Optional count of doctors listing this treatment (demo metadata). */
  doctorCount?: number
  className?: string
}

export function TreatmentCard({
  treatment,
  specialty,
  hospitalCount,
  doctorCount,
  className,
}: TreatmentCardProps) {
  const detailHref = treatmentDetailHref(treatment.slug)
  const enquiryHref = `${ROUTES.public.internationalPatientEnquiry}?specialty=${encodeURIComponent(
    specialty?.id ?? treatment.specialtyId
  )}&treatment=${encodeURIComponent(treatment.id)}`

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-1.5">
          {specialty ? (
            <span className="inline-flex items-center gap-1 rounded-4xl bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              <StethoscopeIcon aria-hidden className="size-3" />
              {specialty.name}
            </span>
          ) : null}
          {typeof hospitalCount === "number" ? (
            <span className="inline-flex items-center rounded-4xl bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {hospitalCount} {hospitalCount === 1 ? "hospital" : "hospitals"} (demo)
            </span>
          ) : null}
          {typeof doctorCount === "number" ? (
            <span className="inline-flex items-center rounded-4xl bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {doctorCount} {doctorCount === 1 ? "doctor" : "doctors"} (demo)
            </span>
          ) : null}
        </div>
        <CardTitle className="text-base leading-snug font-semibold">
          <Link
            href={detailHref}
            className="transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {treatment.name}
          </Link>
        </CardTitle>
        <CardDescription>{treatment.description}</CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto flex-wrap items-center justify-between gap-2">
        <Button variant="outline" size="sm" render={<Link href={detailHref} />}>
          View details
          <span className="sr-only"> for {treatment.name}</span>
        </Button>
        <Button size="sm" variant="cta" className="rounded-full px-4 font-semibold" render={<Link href={enquiryHref} />}>
          Enquire
          <ArrowRightIcon data-icon="inline-end" aria-hidden />
          <span className="sr-only"> about {treatment.name} as an international patient</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
