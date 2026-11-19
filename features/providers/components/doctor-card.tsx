/**
 * DoctorCard — provider card for doctor listings (Agent A05).
 *
 * Contract source: implementation/08-component-catalog.md — "Doctor fields +
 * independent PER/MER". Data comes from the caller as a typed `Doctor` record
 * (@/types); hospital association and specialization names resolve through
 * shared fixture lookups.
 *
 * PER (patient experience) and MER (medical expertise) always render as two
 * visually distinct, independent modules — never a combined score. Missing
 * scores render "Not yet rated", never 0/5.
 */

import Link from "next/link"
import {
  Building2Icon,
  CalendarClockIcon,
  GraduationCapIcon,
  MapPinIcon,
  StarIcon,
} from "lucide-react"

import Image from "next/image"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CardStretchLink } from "@/components/shared/card-stretch-link"
import { VerificationBadge } from "@/features/providers/components/verification-badge"
import { getHospitalById } from "@/lib/search"
import { specialtyById } from "@/data"
import { NOT_RATED_MESSAGE, RATING_LABELS, RATING_SCALE_MAX } from "@/constants/rating"
import { doctorProfileHref } from "@/constants/routes"
import { cn } from "@/lib/utils"
import type { Doctor, RatingSummary } from "@/types"

// ---------------------------------------------------------------------------
// Compact rating module — one rating kind per module, never a composite.
// ---------------------------------------------------------------------------

export interface DoctorCardRatingModuleProps {
  rating: RatingSummary
  className?: string
}

export function DoctorCardRatingModule({ rating, className }: DoctorCardRatingModuleProps) {
  const isPer = rating.kind === "PER"
  const label = isPer ? RATING_LABELS.PER : RATING_LABELS.MER
  const accent = isPer ? "text-info" : "text-success"

  return (
    <div
      data-slot="doctor-card-rating"
      data-rating-kind={rating.kind}
      className={cn(
        "min-w-0 flex-1 rounded-md border border-border/70 bg-card px-3 py-2.5",
        isPer ? "ring-1 ring-info/15" : "ring-1 ring-success/15",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          <abbr title={label} className="no-underline">
            {rating.kind}
          </abbr>
        </p>
        <span
          aria-hidden
          className={cn("size-1.5 rounded-sm", isPer ? "bg-info/70" : "bg-success/70")}
        />
      </div>
      {rating.score === null ? (
        <p className="mt-1.5 text-sm leading-snug font-medium text-muted-foreground">
          {NOT_RATED_MESSAGE}
        </p>
      ) : (
        <div className="mt-1 flex items-center gap-1.5">
          <StarIcon
            aria-hidden
            className={cn("size-4 shrink-0", accent)}
            fill="currentColor"
            strokeWidth={0}
          />
          <p className="text-lg leading-none font-bold tracking-tight text-foreground tabular-nums">
            {rating.score}
            <span className="text-sm font-semibold text-muted-foreground">/{RATING_SCALE_MAX}</span>
          </p>
          <span className="sr-only">{label}</span>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// DoctorCard
// ---------------------------------------------------------------------------

export interface DoctorCardProps {
  doctor: Doctor
  /** Hide the footer CTA (e.g. admin catalogue preview). */
  showCta?: boolean
  disableProfileLink?: boolean
  className?: string
}

/** Number of association names shown before "+N more". */
const MAX_VISIBLE_HOSPITALS = 2

const avatarClassName =
  "size-[4.25rem] shrink-0 rounded-md after:rounded-md ring-1 ring-border/60"

export function DoctorCard({ doctor, showCta = true, disableProfileLink = false, className }: DoctorCardProps) {
  const specializationName = specialtyById[doctor.specialization]?.name ?? "Specialist"
  const hospitals = doctor.hospitalIds
    .map((id) => getHospitalById(id))
    .filter((hospital): hospital is NonNullable<typeof hospital> => hospital !== undefined)
  const visibleHospitals = hospitals.slice(0, MAX_VISIBLE_HOSPITALS)
  const hiddenHospitalCount = hospitals.length - visibleHospitals.length
  const qualificationsSummary = doctor.qualifications.join(", ")
  const profileHref = doctorProfileHref(doctor.slug)

  return (
    <Card
      className={cn(
        "relative flex h-full flex-col gap-0 overflow-hidden rounded-xl border border-border/70 bg-card p-0 shadow-none ring-0",
        className,
      )}
    >
      {disableProfileLink ? null : <CardStretchLink href={profileHref} label={`View profile for ${doctor.name}`} />}
      <CardContent className="pointer-events-none min-h-0 flex-1 gap-4 py-4">
        <div className="relative">
          <VerificationBadge
            status={doctor.verificationStatus}
            className="absolute top-0 right-0 h-6 rounded-md px-2 text-[11px]"
          />
          <div className="flex gap-3 pr-[5.75rem]">
            <Avatar className={avatarClassName}>
              {doctor.photo ? (
                <Image
                  src={doctor.photo}
                  alt={`Portrait of ${doctor.name}`}
                  fill
                  sizes="68px"
                  className="rounded-md object-cover"
                  unoptimized={doctor.photo.startsWith("http")}
                />
              ) : (
                <AvatarFallback aria-hidden className="rounded-md text-sm">
                  {doctor.name
                    .replace(/^Dr\.?\s*/i, "")
                    .split(/\s+/)
                    .map((part) => part.charAt(0))
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="min-w-0 flex-1 space-y-1 pt-0.5">
              <h3 className="line-clamp-2 font-heading text-base leading-snug font-semibold text-primary">
                {doctor.name}
              </h3>
              <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{specializationName}</span>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1">
                  <MapPinIcon aria-hidden className="size-3.5 shrink-0" />
                  {doctor.city}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 rounded-md border border-border/60 bg-muted/15 px-3 py-2.5 text-sm text-muted-foreground">
          {qualificationsSummary ? (
            <p className="flex items-start gap-2">
              <GraduationCapIcon aria-hidden className="mt-0.5 size-3.5 shrink-0 text-foreground/70" />
              <span className="line-clamp-2 leading-snug">{qualificationsSummary}</span>
            </p>
          ) : null}

          {visibleHospitals.length > 0 ? (
            <p className="flex items-start gap-2">
              <Building2Icon aria-hidden className="mt-0.5 size-3.5 shrink-0 text-foreground/70" />
              <span className="line-clamp-2 leading-snug">
                {visibleHospitals.map((hospital) => hospital.name).join(", ")}
                {hiddenHospitalCount > 0 ? (
                  <span className="text-foreground"> +{hiddenHospitalCount} more</span>
                ) : null}
              </span>
            </p>
          ) : null}

          {doctor.yearsExperience !== null ? (
            <p className="flex items-center gap-2">
              <CalendarClockIcon aria-hidden className="size-3.5 shrink-0 text-foreground/70" />
              <span>{doctor.yearsExperience} years experience</span>
            </p>
          ) : null}
        </div>
      </CardContent>

      <div className="pointer-events-none px-(--card-spacing) pb-4">
        <p className="sr-only">
          Independent ratings for {doctor.name} — patient experience and medical expertise, shown
          separately
        </p>
        <div className="grid grid-cols-2 gap-2.5" data-slot="doctor-card-ratings">
          <DoctorCardRatingModule rating={doctor.ratings.per} />
          <DoctorCardRatingModule rating={doctor.ratings.mer} />
        </div>
      </div>

      {showCta ? (
        <div className="relative z-[1] border-t border-border/60 bg-muted/15 px-(--card-spacing) py-4 pointer-events-auto">
          <Button
            variant="cta"
            size="default"
            className="h-11 w-full rounded-lg px-4 text-sm font-semibold sm:text-[0.9375rem]"
            render={<Link href={profileHref} />}
          >
            View profile
            <span className="sr-only"> for {doctor.name}</span>
          </Button>
        </div>
      ) : null}
    </Card>
  )
}