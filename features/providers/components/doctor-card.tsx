/**
 * DoctorCard — provider card for doctor listings (Agent A05).
 *
 * Contract source: implementation/08-component-catalog.md — "Doctor fields +
 * independent PER/MER". Data comes from the caller as a typed `Doctor` record
 * (@/types); hospital association and specialization names resolve through
 * shared fixture lookups.
 *
 * A16 visual alignment: media-left horizontal composition per the reference
 * doctor-card pattern (round avatar left, credentials middle, CTA footer).
 * PER (patient experience) and MER (medical expertise) always render as two
 * visually distinct, independent modules — never a combined score. Missing
 * scores render "Not yet rated", never 0/5. Verification state uses A04's
 * VerificationBadge so cards are consistent across provider types.
 */

import Link from "next/link"
import {
  Building2Icon,
  CalendarClockIcon,
  GraduationCapIcon,
  MapPinIcon,
  StarIcon,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { VerificationBadge } from "@/features/providers/components/verification-badge"
import { getHospitalById } from "@/lib/search"
import { specialtyById } from "@/data"
import { NOT_RATED_MESSAGE, RATING_LABELS, RATING_SCALE_MAX } from "@/constants/rating"
import { doctorProfileHref } from "@/constants/routes"
import { cn } from "@/lib/utils"
import type { Doctor, RatingSummary } from "@/types"

// ---------------------------------------------------------------------------
// Compact rating module — one rating kind per module, never a composite.
// Mirrors the RatingPanel/RatingPair contract (08 catalog) at card size —
// same structure as A04's HospitalCardRatingModule for cross-provider parity.
// ---------------------------------------------------------------------------

export interface DoctorCardRatingModuleProps {
  rating: RatingSummary
  className?: string
}

export function DoctorCardRatingModule({ rating, className }: DoctorCardRatingModuleProps) {
  const isPer = rating.kind === "PER"
  const label = isPer ? RATING_LABELS.PER : RATING_LABELS.MER

  return (
    <div
      data-slot="doctor-card-rating"
      data-rating-kind={rating.kind}
      className={cn(
        "min-w-0 flex-1 rounded-lg border p-2.5",
        isPer ? "border-info/30 bg-info/5" : "border-success/30 bg-success/5",
        className
      )}
    >
      <p className="truncate text-[11px] leading-tight font-medium text-muted-foreground">
        <abbr title={label}>{rating.kind}</abbr>
      </p>
      {rating.score === null ? (
        <p className="mt-0.5 text-sm leading-snug font-medium text-muted-foreground">
          {NOT_RATED_MESSAGE}
        </p>
      ) : (
        <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-foreground">
          <StarIcon aria-hidden className={cn("size-3.5", isPer ? "text-info" : "text-success")} />
          {rating.score}/{RATING_SCALE_MAX}
          <span className="sr-only"> — {label}</span>
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// DoctorCard
// ---------------------------------------------------------------------------

export interface DoctorCardProps {
  doctor: Doctor
  className?: string
}

/** Number of association names shown before "+N more". */
const MAX_VISIBLE_HOSPITALS = 2

export function DoctorCard({ doctor, className }: DoctorCardProps) {
  // Doctor.specialization holds a Specialty ID (relational), not display text.
  const specializationName = specialtyById[doctor.specialization]?.name ?? "Specialist"
  const hospitals = doctor.hospitalIds
    .map((id) => getHospitalById(id))
    .filter((hospital): hospital is NonNullable<typeof hospital> => hospital !== undefined)
  const visibleHospitals = hospitals.slice(0, MAX_VISIBLE_HOSPITALS)
  const hiddenHospitalCount = hospitals.length - visibleHospitals.length
  const qualificationsSummary = doctor.qualifications.join(", ")
  const profileHref = doctorProfileHref(doctor.slug)

  return (
    <Card className={cn("flex h-full flex-col gap-0 overflow-hidden p-0", className)}>
      <CardContent className="min-h-0 flex-1 gap-3 py-4">
        <div className="flex items-start gap-3">
          <Avatar className="size-14 shrink-0 ring-2 ring-background">
            {doctor.photo ? (
              <AvatarImage src={doctor.photo} alt={`Portrait of ${doctor.name}`} />
            ) : null}
            <AvatarFallback aria-hidden>
              {doctor.name
                .replace(/^Dr\.?\s*/i, "")
                .split(/\s+/)
                .map((part) => part.charAt(0))
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="truncate font-heading text-base leading-snug font-semibold text-primary">
              <Link
                href={profileHref}
                className="transition-colors outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {doctor.name}
              </Link>
            </h3>
            <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{specializationName}</span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <MapPinIcon aria-hidden className="size-3.5" />
                {doctor.city}
              </span>
            </p>
          </div>
          <VerificationBadge status={doctor.verificationStatus} className="shrink-0" />
        </div>

        {qualificationsSummary ? (
          <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
            <GraduationCapIcon aria-hidden className="mt-0.5 size-3.5 shrink-0" />
            <span className="line-clamp-2">{qualificationsSummary}</span>
          </p>
        ) : null}

        {visibleHospitals.length > 0 ? (
          <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
            <Building2Icon aria-hidden className="mt-0.5 size-3.5 shrink-0" />
            <p className="min-w-0 flex-1 truncate">
              {visibleHospitals.map((hospital) => hospital.name).join(", ")}
              {hiddenHospitalCount > 0 ? (
                <span className="text-foreground"> +{hiddenHospitalCount} more</span>
              ) : null}
            </p>
          </div>
        ) : null}

        {doctor.yearsExperience !== null ? (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarClockIcon aria-hidden className="size-3.5" />
            {doctor.yearsExperience} years experience
          </p>
        ) : null}
      </CardContent>

      <div className="mt-auto flex flex-col gap-3 px-(--card-spacing) pb-4">
        <div>
          <p className="sr-only">
            Independent ratings for {doctor.name} — patient experience and medical expertise, shown
            separately
          </p>
          <div className="flex gap-2" data-slot="doctor-card-ratings">
            <DoctorCardRatingModule rating={doctor.ratings.per} />
            <DoctorCardRatingModule rating={doctor.ratings.mer} />
          </div>
        </div>
      </div>

      <div className="flex justify-end rounded-b-xl border-t bg-muted/30 px-(--card-spacing) py-3">
        <Button variant="cta" size="sm" className="rounded-full px-4 font-semibold" render={<Link href={profileHref} />}>
          View profile
          <span className="sr-only"> for {doctor.name}</span>
        </Button>
      </div>
    </Card>
  )
}
