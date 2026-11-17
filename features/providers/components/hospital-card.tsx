/**
 * HospitalCard — directory card for hospital listings (Agent A04).
 *
 * Contract source: implementation/08-component-catalog.md — "Hospital fields +
 * independent PER/CER"; implementation/05-design-system.md provider-card
 * pattern — image/logo, name, city, category, specialties, verification state,
 * separate rating modules, CTA.
 *
 * PER and CER render as two compact but visually distinct, independent
 * modules — never a combined score. Missing scores render "Not yet rated",
 * never 0/5. Identity, location and category data come from the typed
 * `Hospital` fixture; specialty names resolve through the shared lookup maps.
 */

import Image from "next/image"
import Link from "next/link"
import { MapPinIcon, StarIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { VerificationBadge } from "@/features/providers/components/verification-badge"
import { NOT_RATED_MESSAGE, RATING_LABELS, RATING_SCALE_MAX } from "@/constants/rating"
import { hospitalProfileHref } from "@/constants/routes"
import { specialtyById } from "@/data"
import { cn } from "@/lib/utils"
import type { Hospital, RatingSummary } from "@/types"

/** Max specialty chips shown before the "+N more" overflow chip. */
const MAX_VISIBLE_SPECIALTIES = 3

export interface HospitalCardProps {
  hospital: Hospital
  className?: string
}

/**
 * Compact rating module — ONE rating kind per module, mirroring the
 * RatingPanel/RatingPair contract (08 catalog) at card size. Never a composite.
 */
export function HospitalCardRatingModule({ rating, className }: { rating: RatingSummary; className?: string }) {
  const isPer = rating.kind === "PER"
  const label = isPer ? RATING_LABELS.PER : RATING_LABELS.CER

  return (
    <div
      data-slot="hospital-card-rating"
      data-rating-kind={rating.kind}
      className={cn(
        "min-w-0 flex-1 rounded-lg border p-2.5",
        isPer ? "border-info/30 bg-info/5" : "border-success/30 bg-success/5",
        className,
      )}
    >
      <p className="truncate text-[11px] leading-tight font-medium text-muted-foreground">
        <abbr title={label}>{rating.kind}</abbr>
      </p>
      {rating.score === null ? (
        <p className="mt-0.5 text-sm leading-snug font-medium text-muted-foreground">{NOT_RATED_MESSAGE}</p>
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

export function HospitalCard({ hospital, className }: HospitalCardProps) {
  const profileHref = hospitalProfileHref(hospital.slug)
  const specialtyNames = hospital.specialties
    .map((id) => specialtyById[id]?.name)
    .filter((name): name is string => name !== undefined)
  const visibleSpecialties = specialtyNames.slice(0, MAX_VISIBLE_SPECIALTIES)
  const hiddenSpecialtyCount = specialtyNames.length - visibleSpecialties.length

  return (
    <Card className={cn("h-full", className)}>
      {hospital.image ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
          <Image
            src={hospital.image}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            unoptimized
          />
        </div>
      ) : null}
      <CardContent className="gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h3 className="font-heading text-base leading-snug font-semibold text-foreground">{hospital.name}</h3>
            <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPinIcon aria-hidden className="size-3.5" />
                {hospital.city}, {hospital.state}
              </span>
              <span aria-hidden>·</span>
              <span>{hospital.facilityType}</span>
            </p>
          </div>
          <VerificationBadge status={hospital.verificationStatus} className="shrink-0" />
        </div>

        {visibleSpecialties.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5" aria-label="Specialties">
            {visibleSpecialties.map((name) => (
              <li key={name}>
                <Badge variant="outline" className="text-muted-foreground">
                  {name}
                </Badge>
              </li>
            ))}
            {hiddenSpecialtyCount > 0 ? (
              <li>
                <Badge variant="outline" className="text-muted-foreground">
                  +{hiddenSpecialtyCount} more
                </Badge>
              </li>
            ) : null}
          </ul>
        ) : null}

        <div>
          <p className="sr-only">Independent ratings for {hospital.name} — experience and clinical expertise, shown separately</p>
          <div className="flex gap-2" data-slot="hospital-card-ratings">
            <HospitalCardRatingModule rating={hospital.ratings.per} />
            <HospitalCardRatingModule rating={hospital.ratings.cer} />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="outline" className="text-muted-foreground">
            Demo profile — fictional data
          </Badge>
          <Button size="sm" render={<Link href={profileHref} />}>
            View profile
            <span className="sr-only"> for {hospital.name}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
