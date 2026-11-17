/**
 * ComparisonTable — side-by-side hospital comparison (Agent A04).
 *
 * Contract source: implementation/08-component-catalog.md — "Side-by-side
 * values, distinct rating rows"; pages/06-hospital-compare.md — separate PER
 * row and CER row, methodology note, handles missing values.
 *
 * Trust model (00-project-analysis.md): PER and CER render as two DISTINCT
 * rows, each labelled with its own RATING_LABELS entry; values are never
 * averaged, merged, or shown as an overall score. Null scores render
 * "Not yet rated" / "Assessment pending" per status — never 0/5. Missing
 * hospitals (fewer than the max selected) render em-dash placeholder columns.
 */

import Link from "next/link"
import { MapPinIcon } from "lucide-react"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { VerificationBadge } from "@/features/providers/components/verification-badge"
import {
  ASSESSMENT_PENDING_MESSAGE,
  NOT_RATED_MESSAGE,
  RATING_LABELS,
  RATING_SCALE_MAX,
} from "@/constants/rating"
import { hospitalProfileHref } from "@/constants/routes"
import { specialtyById } from "@/data"
import { cn } from "@/lib/utils"
import type { Hospital, RatingSummary } from "@/types"

/** Maximum hospitals compared side by side (06 spec proposes up to 3). */
export const MAX_COMPARE_HOSPITALS = 3

export interface ComparisonTableProps {
  /** 1–3 hospitals, in selected order. Fewer than 3 renders placeholder columns. */
  hospitals: Hospital[]
  className?: string
}

/** Render ONE rating-kind cell; missing scores never render as 0/5. */
function RatingCell({ rating, kind }: { rating: RatingSummary | undefined; kind: "per" | "cer" }) {
  if (!rating) {
    return <span className="text-muted-foreground">—</span>
  }
  if (rating.score === null) {
    return (
      <span className="text-sm text-muted-foreground">
        {rating.status === "pending" ? ASSESSMENT_PENDING_MESSAGE : NOT_RATED_MESSAGE}
        <span className="sr-only"> — {RATING_LABELS[kind === "per" ? "PER" : "CER"]}</span>
      </span>
    )
  }
  return (
    <span className="text-sm font-semibold tabular-nums text-foreground">
      {rating.score}
      <span className="font-normal text-muted-foreground">/{RATING_SCALE_MAX}</span>
      <span className="sr-only"> — {RATING_LABELS[kind === "per" ? "PER" : "CER"]}</span>
    </span>
  )
}

function specialtiesSummary(hospital: Hospital): string {
  const names = hospital.specialties
    .map((id) => specialtyById[id]?.name)
    .filter((name): name is string => name !== undefined)
  return names.length > 0 ? names.join(", ") : "—"
}

export function ComparisonTable({ hospitals, className }: ComparisonTableProps) {
  const columns: (Hospital | null)[] = [
    ...hospitals.slice(0, MAX_COMPARE_HOSPITALS),
    ...Array.from({ length: Math.max(0, MAX_COMPARE_HOSPITALS - hospitals.length) }, () => null),
  ]

  return (
    <div className={cn("overflow-x-auto rounded-lg border", className)} data-slot="comparison-table">
      <Table className="min-w-160">
        <TableCaption className="sr-only">
          Side-by-side hospital comparison. Patient experience and clinical expertise ratings are independent and never combined.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col" className="w-40 min-w-36 bg-muted/40 align-bottom">
              <span className="sr-only">Compare field</span>
              <span aria-hidden className="text-xs text-muted-foreground">
                Compare
              </span>
            </TableHead>
            {columns.map((hospital, index) => (
              <TableHead key={hospital?.id ?? `placeholder-${index}`} scope="col" className="min-w-56 align-bottom">
                {hospital ? (
                  <div className="space-y-1 py-1">
                    <Link
                      href={hospitalProfileHref(hospital.slug)}
                      className="font-heading text-sm font-semibold text-foreground underline-offset-4 hover:underline"
                    >
                      {hospital.name}
                    </Link>
                    <p className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
                      <MapPinIcon aria-hidden className="size-3" />
                      {hospital.city}, {hospital.state}
                    </p>
                  </div>
                ) : (
                  <span className="text-sm font-normal text-muted-foreground">No hospital selected</span>
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableHead scope="row" className="text-xs font-medium text-muted-foreground">
              Verification
            </TableHead>
            {columns.map((hospital, index) => (
              <TableCell key={hospital?.id ?? `verification-${index}`}>
                {hospital ? (
                  <VerificationBadge status={hospital.verificationStatus} />
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableHead scope="row" className="text-xs font-medium text-muted-foreground">
              Location
            </TableHead>
            {columns.map((hospital, index) => (
              <TableCell key={hospital?.id ?? `location-${index}`} className="text-sm">
                {hospital ? `${hospital.city}, ${hospital.state}, ${hospital.country}` : <span className="text-muted-foreground">—</span>}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableHead scope="row" className="text-xs font-medium text-muted-foreground">
              Facility type
            </TableHead>
            {columns.map((hospital, index) => (
              <TableCell key={hospital?.id ?? `facility-${index}`} className="text-sm">
                {hospital ? hospital.facilityType : <span className="text-muted-foreground">—</span>}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableHead scope="row" className="text-xs font-medium text-muted-foreground">
              Specialties
            </TableHead>
            {columns.map((hospital, index) => (
              <TableCell key={hospital?.id ?? `specialties-${index}`} className="max-w-64 text-sm whitespace-normal">
                {hospital ? specialtiesSummary(hospital) : <span className="text-muted-foreground">—</span>}
              </TableCell>
            ))}
          </TableRow>
          {/* Distinct rating rows — PER and CER are NEVER merged or averaged. */}
          <TableRow>
            <TableHead scope="row" className="text-xs font-medium text-muted-foreground">
              <abbr title={RATING_LABELS.PER} className="underline decoration-dotted">
                {RATING_LABELS.PER}
              </abbr>
            </TableHead>
            {columns.map((hospital, index) => (
              <TableCell key={hospital?.id ?? `per-${index}`}>
                <RatingCell rating={hospital?.ratings.per} kind="per" />
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableHead scope="row" className="text-xs font-medium text-muted-foreground">
              <abbr title={RATING_LABELS.CER} className="underline decoration-dotted">
                {RATING_LABELS.CER}
              </abbr>
            </TableHead>
            {columns.map((hospital, index) => (
              <TableCell key={hospital?.id ?? `cer-${index}`}>
                <RatingCell rating={hospital?.ratings.cer} kind="cer" />
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableHead scope="row" className="text-xs font-medium text-muted-foreground">
              Accreditations
            </TableHead>
            {columns.map((hospital, index) => (
              <TableCell key={hospital?.id ?? `accreditations-${index}`} className="text-sm whitespace-normal">
                {hospital ? (
                  hospital.accreditations.length > 0 ? (
                    <ul className="space-y-1">
                      {hospital.accreditations.map((accreditation, accreditationIndex) => (
                        <li key={`${hospital.id}-accreditation-${accreditationIndex}`}>
                          {accreditation.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-muted-foreground">None listed</span>
                  )
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
