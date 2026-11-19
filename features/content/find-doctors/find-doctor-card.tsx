"use client"

import Image from "next/image"
import Link from "next/link"

import { NOT_RATED_MESSAGE } from "@/constants/rating"
import { doctorProfileHref } from "@/constants/routes"
import { specialtyById } from "@/data"
import { getHospitalById } from "@/lib/search"
import { cn } from "@/lib/utils"
import type { Doctor } from "@/types"

import { CardStretchLink } from "@/components/shared/card-stretch-link"
import {
  FhPeopleIcon,
  FhStethoscopeIcon,
} from "@/features/content/featured-hospitals/featured-hospital-icons"

import {
  FdArrowIcon,
  FdBldIcon,
  FdCalIcon,
  FdCapIcon,
  FdCheckIcon,
  FdClockIcon,
  FdEyeIcon,
  FdPinIcon,
  FdStarIcon,
} from "./find-doctor-icons"

/** `4.6` stays `4.6`, a whole score renders `4` — never a trailing `.0`. */
function formatScore(score: number | null): string | null {
  if (score === null) return null
  return score.toFixed(1).replace(/\.0$/, "")
}

export interface FindDoctorCardProps {
  doctor: Doctor
  /** Mock highlight ring on the centre card of the home grid. */
  highlighted?: boolean
}

function RatingColumn({
  label,
  title,
  icon,
  score,
  scaleMax,
}: {
  label: string
  title: string
  icon: React.ReactNode
  score: string | null
  scaleMax: number
}) {
  return (
    <div className="fd-r-col">
      <span className="fd-r-ico">{icon}</span>
      <div className="fd-r-body">
        <p className="fd-r-lab">
          <abbr title={title}>{label}</abbr>
        </p>
        {score === null ? (
          <p className="fd-r-norate">{NOT_RATED_MESSAGE}</p>
        ) : (
          <p className="fd-r-val">
            <FdStarIcon />
            <b>{score}</b>
            <small>/{scaleMax}</small>
          </p>
        )}
      </div>
    </div>
  )
}

export function FindDoctorCard({ doctor, highlighted = false }: FindDoctorCardProps) {
  const specialty = specialtyById[doctor.specialization]
  const hospitalNames = doctor.hospitalIds
    .map((id) => getHospitalById(id)?.name)
    .filter((name): name is string => Boolean(name))
  const isVerified = doctor.verificationStatus === "verified"
  const profileHref = doctorProfileHref(doctor.slug)
  const perScore = formatScore(doctor.ratings.per.score)
  const merScore = formatScore(doctor.ratings.mer.score)

  return (
    <article className={cn("fd-card", highlighted && "fd-card-hl")}>
      <CardStretchLink href={profileHref} label={`View profile for ${doctor.name}`} />
      <div className="fd-top">
        <div className="fd-avatar">
          <Image
            src={doctor.photo}
            alt=""
            fill
            sizes="(max-width: 420px) 84px, 117px"
            className="object-cover"
            unoptimized={doctor.photo.startsWith("http")}
          />
        </div>
        <div className="fd-t-info">
          <div className="fd-t-head">
            <div className="fd-name">{doctor.name}</div>
          </div>
          <span
            className={cn(
              "fd-pill",
              isVerified ? "fd-pill-verified" : "fd-pill-pending",
            )}
          >
            {isVerified ? <FdCheckIcon /> : <FdClockIcon />}
            {isVerified ? "Verified" : "Pending"}
          </span>
          <p className="fd-spec">{specialty?.name}</p>
          <p className="fd-loc">
            <FdPinIcon />
            {doctor.city}
          </p>
        </div>
      </div>

      <div className="fd-info">
        <div className="fd-i-row">
          <span className="fd-i-ico">
            <FdCapIcon />
          </span>
          <p>{doctor.qualifications.join(", ")}</p>
        </div>
        {hospitalNames.length > 0 ? (
          <div className="fd-i-row">
            <span className="fd-i-ico">
              <FdBldIcon />
            </span>
            <p>{hospitalNames.join(", ")}</p>
          </div>
        ) : null}
        {doctor.yearsExperience !== null ? (
          <div className="fd-i-row">
            <span className="fd-i-ico">
              <FdCalIcon />
            </span>
            <p>{doctor.yearsExperience} years experience</p>
          </div>
        ) : null}
      </div>

      <div className="fd-rating">
        <RatingColumn
          label="PER"
          title="Patient Experience Rating"
          icon={<FhPeopleIcon />}
          score={perScore}
          scaleMax={doctor.ratings.per.scaleMax}
        />
        <span className="fd-r-div" />
        <RatingColumn
          label="MER"
          title="Medical Expertise Rating"
          icon={<FhStethoscopeIcon />}
          score={merScore}
          scaleMax={doctor.ratings.mer.scaleMax}
        />
      </div>

      <Link href={profileHref} className="fd-btn">
        <FdEyeIcon />
        <span>View Profile</span>
        <FdArrowIcon className="fd-arr" />
      </Link>
    </article>
  )
}
