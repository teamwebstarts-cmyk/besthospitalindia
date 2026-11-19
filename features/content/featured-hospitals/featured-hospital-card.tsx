"use client"

import Image from "next/image"
import Link from "next/link"

import { NOT_RATED_MESSAGE, RATING_SCALE_MAX } from "@/constants/rating"
import { whatsappHref } from "@/constants/site-contact"
import { ROUTES, hospitalProfileHref } from "@/constants/routes"
import { specialtyById } from "@/data"
import type { Hospital } from "@/types"

import { CardStretchLink } from "@/components/shared/card-stretch-link"

import { cn } from "@/lib/utils"

import { getFeaturedHospitalHeroImage } from "./featured-hospital-heroes"
import {
  FhCalendarIcon,
  FhCheckIcon,
  FhHospitalIcon,
  FhPeopleIcon,
  FhPinIcon,
  FhStarIcon,
  FhStethoscopeIcon,
  FhWhatsAppIcon,
} from "./featured-hospital-icons"

const MAX_TAGS_DESKTOP = 3
const MAX_TAGS_PHONE = 2

function formatScore(score: number | null): string | null {
  if (score === null) return null
  return score.toFixed(1).replace(/\.0$/, "")
}

export interface FeaturedHospitalCardProps {
  hospital: Hospital
}

export function FeaturedHospitalCard({ hospital }: FeaturedHospitalCardProps) {
  const heroSrc = getFeaturedHospitalHeroImage(hospital)
  const profileHref = hospitalProfileHref(hospital.slug)
  const specialtyNames = hospital.specialties
    .map((id) => specialtyById[id]?.name)
    .filter((name): name is string => Boolean(name))
    .slice(0, MAX_TAGS_DESKTOP)
  const perScore = formatScore(hospital.ratings.per.score)
  const cerScore = formatScore(hospital.ratings.cer.score)
  const isVerified = hospital.verificationStatus === "verified"

  const waHref = whatsappHref(`Hello, I want to know more about ${hospital.name}`)

  return (
    <article className="fh-card h-full w-full min-w-0">
      <CardStretchLink href={profileHref} label={`View ${hospital.name}`} />
      <div className="fh-media">
        <Image
          src={heroSrc}
          alt=""
          fill
          sizes="(max-width: 700px) 100vw, (max-width: 1180px) 50vw, 33vw"
          className="object-cover"
          priority={hospital.id === "hosp-sunrise-delhi" || hospital.id === "hosp-tranquilvalley-kochi"}
        />
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
            <h3 className="fh-h-title">{hospital.name}</h3>
            <div className="fh-h-loc">
              <FhPinIcon />
              <span>
                {hospital.city}, {hospital.state} - {hospital.facilityType}
              </span>
            </div>
          </div>
        </div>

        {specialtyNames.length > 0 ? (
          <div className="fh-tags">
            {specialtyNames.map((tag, index) => (
              <span
                key={tag}
                className={cn("fh-tag", index >= MAX_TAGS_PHONE && "max-[699px]:hidden")}
              >
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <div className="fh-tags fh-tags--empty" aria-hidden />
        )}

        <div className="fh-card-foot">
          <div className="fh-rating">
            <div className="fh-r-item fh-r-item-per">
              <FhPeopleIcon />
              <div>
                <div className="fh-r-label">PER</div>
                {perScore ? (
                  <div className="fh-r-score">
                    <FhStarIcon />
                    <b>{perScore}</b>
                    <small>/{RATING_SCALE_MAX}</small>
                  </div>
                ) : (
                  <p className="fh-r-muted mt-1">{NOT_RATED_MESSAGE}</p>
                )}
              </div>
            </div>
            <div className="fh-r-div" aria-hidden />
            <div className="fh-r-item fh-r-item-cer">
              <FhStethoscopeIcon />
              <div>
                <div className="fh-r-label">CER</div>
                {cerScore ? (
                  <div className="fh-r-score">
                    <FhStarIcon />
                    <b>{cerScore}</b>
                    <small>/{RATING_SCALE_MAX}</small>
                  </div>
                ) : (
                  <p className="fh-r-muted mt-1">{NOT_RATED_MESSAGE}</p>
                )}
              </div>
            </div>
          </div>

          <div className="fh-actions">
            <Link href={ROUTES.public.freeConsultation} className="fh-btn fh-btn-primary">
              <FhCalendarIcon />
              <span>Book Appointment</span>
            </Link>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="fh-btn fh-btn-ghost"
            >
              <FhWhatsAppIcon />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}