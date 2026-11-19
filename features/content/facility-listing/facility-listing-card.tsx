import Image from "next/image"
import Link from "next/link"

import { CardStretchLink } from "@/components/shared/card-stretch-link"
import { FACILITY_CATEGORY_LABELS } from "@/features/discovery/facility-meta"
import { FhCheckIcon, FhHospitalIcon, FhPinIcon } from "@/features/content/featured-hospitals/featured-hospital-icons"
import { ROUTES } from "@/constants/routes"
import { FACILITY_LISTING_IMAGE_BY_CATEGORY } from "@/lib/facility-listing-images"
import { cn } from "@/lib/utils"
import type { Facility } from "@/types"

import "@/features/content/featured-hospitals/featured-hospitals.css"

export interface FacilityListingCardProps {
  facility: Facility
  /** Hide footer link (e.g. admin catalogue preview). */
  showCta?: boolean
  disableProfileLink?: boolean
  compact?: boolean
  className?: string
}

const MAX_SERVICE_TAGS = 2

/** Strip demo “— Facility, City” suffix so the address line carries location. */
function facilityCardTitle(name: string, city: string): string {
  const escaped = city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return name.replace(new RegExp(`\\s*—\\s*Facility,\\s*${escaped}\\s*$`, "i"), "").trim()
}

/** Facility directory card — shared featured-hospital shell (no ratings block). */
export function FacilityListingCard({
  facility,
  showCta = true,
  disableProfileLink = false,
  compact = false,
  className,
}: FacilityListingCardProps) {
  const profileHref = `${ROUTES.public.facilities}/${facility.slug}`
  const heroSrc = FACILITY_LISTING_IMAGE_BY_CATEGORY[facility.category]
  const isVerified = facility.verificationStatus === "verified"
  const title = facilityCardTitle(facility.name, facility.city)
  const addressLine = `${facility.city}, ${facility.state}, ${facility.country}`
  const categoryLabel = FACILITY_CATEGORY_LABELS[facility.category]
  const services = facility.services.slice(0, MAX_SERVICE_TAGS)

  return (
    <article
      className={cn(
        "fh-card fh-card--facility h-full w-full min-w-0",
        compact && "[&_.fh-media]:h-32 [&_.fh-media]:rounded-xl",
        className,
      )}
    >
      {disableProfileLink ? null : <CardStretchLink href={profileHref} label={`View ${title}`} />}
      <div className="fh-media">
        <Image src={heroSrc} alt="" fill sizes="(max-width: 1100px) 100vw, 50vw" className="object-cover" />
        {isVerified ? (
          <div className="fh-verified">
            <FhCheckIcon />
            <span>Verified</span>
          </div>
        ) : null}
      </div>

      <div className="fh-card-main">
        <div className="fh-h-row">
          <div className="fh-h-icon">
            <FhHospitalIcon />
          </div>
          <div className="fh-h-info">
            <h3 className="fh-h-title">{title}</h3>
            <div className="fh-h-loc">
              <FhPinIcon />
              <span>
                {addressLine} · {categoryLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="fh-tags">
          {services.length > 0 ? (
            services.map((tag) => (
              <span key={tag} className="fh-tag">
                {tag}
              </span>
            ))
          ) : (
            <span className="fh-tag fh-tag--spacer" aria-hidden>
              —
            </span>
          )}
        </div>

        {showCta ? (
          <div className="fh-card-foot">
            <div className="fh-actions fh-actions--single">
              <Link href={profileHref} className="fh-btn fh-btn-primary">
                <span>View facility</span>
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  )
}