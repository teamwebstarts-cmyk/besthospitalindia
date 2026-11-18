/**
 * HospitalCard — directory card for hospital listings (Agent A04).
 *
 * Contract source: implementation/08-component-catalog.md — "Hospital fields +
 * independent PER/CER"; implementation/05-design-system.md provider-card
 * pattern — image/logo, name, city, category, specialties, verification state,
 * separate rating modules, CTA.
 *
 * A16 visual alignment: media-left horizontal composition per the reference
 * listing-card pattern (image left ~30%, content right; stacked image-top on
 * mobile). Blue provider name, specialty chips, separate PER/CER modules and
 * a conversion-red CTA. PER and CER render as two compact but visually
 * distinct, independent modules — never a combined score. Missing scores
 * render "Not yet rated", never 0/5. Identity, location and category data
 * come from the typed `Hospital` fixture; specialty names resolve through the
 * shared lookup maps.
 */

import Image from "next/image"
import Link from "next/link"
import { Building2Icon, MapPinIcon, StarIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { VerificationBadge } from "@/features/providers/components/verification-badge"
import { NOT_RATED_MESSAGE, RATING_LABELS, RATING_SCALE_MAX } from "@/constants/rating"
import { ROUTES, hospitalProfileHref } from "@/constants/routes"
import { specialtyById } from "@/data"
import { cn } from "@/lib/utils"
import type { Hospital, RatingSummary } from "@/types"

/** Max specialty chips shown before the "+N more" overflow chip. */
const MAX_VISIBLE_SPECIALTIES = 3

const WHATSAPP_URL = "https://wa.me/911140501200"

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("size-4", className)} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.617h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export interface HospitalCardProps {
  hospital: Hospital
  /**
   * `stacked` — image on top (home / 3-col grids). `horizontal` — media left
   * (directory two-column listings).
   */
  layout?: "horizontal" | "stacked"
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

function HospitalCardMedia({
  hospital,
  layout,
}: {
  hospital: Hospital
  layout: "horizontal" | "stacked"
}) {
  const placeholder = (
    <div className="flex size-full items-center justify-center bg-muted text-muted-foreground/60">
      <Building2Icon aria-hidden className="size-10" />
    </div>
  )

  if (layout === "stacked") {
    return (
      <div
        className="relative aspect-[125/54] w-full shrink-0 overflow-hidden border-b border-border/60 bg-muted"
        aria-hidden
      >
        {hospital.image ? (
          <Image
            src={hospital.image}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            unoptimized
          />
        ) : (
          placeholder
        )}
      </div>
    )
  }

  return (
    <div
      className="relative hidden w-[38%] max-w-44 shrink-0 self-stretch bg-muted sm:block"
      aria-hidden
    >
      {hospital.image ? (
        <Image
          src={hospital.image}
          alt=""
          fill
          sizes="(max-width: 1024px) 176px, 176px"
          className="object-cover"
          unoptimized
        />
      ) : (
        placeholder
      )}
    </div>
  )
}

export function HospitalCard({
  hospital,
  layout = "horizontal",
  className,
}: HospitalCardProps) {
  const profileHref = hospitalProfileHref(hospital.slug)
  const specialtyNames = hospital.specialties
    .map((id) => specialtyById[id]?.name)
    .filter((name): name is string => name !== undefined)
  const visibleSpecialties = specialtyNames.slice(0, MAX_VISIBLE_SPECIALTIES)
  const hiddenSpecialtyCount = specialtyNames.length - visibleSpecialties.length
  const isStacked = layout === "stacked"

  return (
    <Card
      className={cn(
        "h-full overflow-hidden p-0",
        isStacked ? "flex flex-col gap-0" : "flex flex-row",
        className
      )}
    >
      <HospitalCardMedia hospital={hospital} layout={layout} />
      <div className="flex min-w-0 flex-1 flex-col">
        <CardContent
          className={cn(
            "gap-3",
            isStacked && "min-h-0 flex-1 py-4",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <h3 className="font-heading text-base leading-snug font-semibold text-primary">
                <Link
                  href={profileHref}
                  className="transition-colors outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {hospital.name}
                </Link>
              </h3>
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

          {!isStacked ? (
            <div>
              <p className="sr-only">
                Independent ratings for {hospital.name} — experience and clinical expertise, shown
                separately
              </p>
              <div className="flex gap-2" data-slot="hospital-card-ratings">
                <HospitalCardRatingModule rating={hospital.ratings.per} />
                <HospitalCardRatingModule rating={hospital.ratings.cer} />
              </div>
            </div>
          ) : null}
        </CardContent>

        {isStacked ? (
          <div className="mt-auto flex flex-col gap-3 px-(--card-spacing) pb-4">
            <div>
              <p className="sr-only">
                Independent ratings for {hospital.name} — experience and clinical expertise, shown
                separately
              </p>
              <div className="flex gap-2" data-slot="hospital-card-ratings">
                <HospitalCardRatingModule rating={hospital.ratings.per} />
                <HospitalCardRatingModule rating={hospital.ratings.cer} />
              </div>
            </div>
          </div>
        ) : null}

        <div
          className={cn(
            "flex flex-row gap-2 border-t bg-muted/30 px-(--card-spacing) py-3",
            isStacked ? "mt-0 py-4" : "mt-auto",
          )}
        >
          <Button
            variant="cta"
            size="sm"
            className="h-9 min-w-0 flex-1 rounded-lg px-3 font-semibold shadow-sm"
            render={<Link href={ROUTES.public.freeConsultation} />}
          >
            Book Appointment
            <span className="sr-only"> with {hospital.name}</span>
          </Button>
          <Button
            size="sm"
            className="h-9 min-w-0 flex-1 rounded-lg border-0 bg-[#49C659] px-3 font-semibold text-white shadow-sm hover:bg-[#3eb84d]"
            render={
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <WhatsAppIcon />
            WhatsApp Us
            <span className="sr-only"> about {hospital.name}</span>
          </Button>
        </div>
      </div>
    </Card>
  )
}
