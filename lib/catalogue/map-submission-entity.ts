import { specialtyById, treatmentById } from "@/data"
import type { Accreditation, Doctor, Facility, FacilityCategory, Hospital, RatingSummary } from "@/types"
import type { RatingKind } from "@/types/rating"

import type { CatalogueKind, CatalogueStatus } from "@/lib/catalogue/store"

/** Client-safe profile slice for mapping submissions to public card models. */
export interface SubmissionMapInput {
  id: string
  kind: CatalogueKind
  name: string
  city: string
  note?: string
  status?: CatalogueStatus
  overview?: string
  state?: string
  country?: string
  imageUrl?: string
  facilityType?: string
  specialties?: string[]
  treatments?: string[]
  accreditations?: string[]
  specialization?: string
  qualifications?: string[]
  yearsExperience?: number | null
  languages?: string[]
  category?: string
  services?: string[]
  perScore?: number | null
  cerScore?: number | null
  merScore?: number | null
  doctorIds?: string[]
  hospitalIds?: string[]
  doctorNames?: string[]
  treatmentNames?: string[]
  accessibility?: string[]
}

function unrated(kind: RatingKind): RatingSummary {
  return {
    kind,
    score: null,
    scaleMax: 5,
    status: "not_assessed",
    basis: kind === "PER" ? "patient_feedback" : "verified_evidence",
    sampleSize: null,
    lastAssessedAt: null,
    methodologyVersion: null,
    evidenceSummary: "Not yet rated.",
  }
}

function ratingFrom(kind: RatingKind, score: number | null | undefined): RatingSummary {
  if (typeof score !== "number" || !Number.isFinite(score) || score < 1 || score > 5) return unrated(kind)
  return {
    kind,
    score: Math.round(score * 10) / 10,
    scaleMax: 5,
    status: "published",
    basis: kind === "PER" ? "patient_feedback" : "verified_evidence",
    sampleSize: null,
    lastAssessedAt: null,
    methodologyVersion: "admin-entry",
    evidenceSummary: "Score entered for the public card.",
  }
}

export function submissionSlug(row: Pick<SubmissionMapInput, "id" | "name">): string {
  const slug = row.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  return `${slug || "listing"}-${row.id}`
}

function validIds(ids: string[] | undefined, lookup: Record<string, unknown>): string[] {
  return (ids ?? []).filter((id) => typeof id === "string" && lookup[id] !== undefined)
}

function accreditations(names: string[] | undefined, verified: boolean): Accreditation[] {
  return (names ?? [])
    .filter((name) => typeof name === "string" && name.trim().length > 0)
    .map((name) => ({ name: name.trim(), status: verified ? ("verified" as const) : ("pending" as const) }))
}

function asTextList(value: string[] | string | undefined): string[] {
  if (Array.isArray(value)) return value.filter((v) => typeof v === "string" && v.trim().length > 0)
  if (typeof value === "string") {
    return value.split(/[,\n]/).map((part) => part.trim()).filter(Boolean)
  }
  return []
}

function imageFor(row: SubmissionMapInput): string {
  const url = row.imageUrl?.trim()
  if (url) return url
  if (row.kind === "doctor") return "/images/doctors/doctor-portrait-demo.png"
  return "/images/hospitals/placeholder.svg"
}

const FACILITY_CATEGORIES: FacilityCategory[] = [
  "hospital",
  "specialty_centre",
  "diagnostic_lab",
  "rehabilitation",
  "wellness",
  "medical_tourism",
]

export function mapSubmissionToHospital(row: SubmissionMapInput): Hospital {
  const verified = row.status === "approved"
  return {
    id: row.id,
    slug: submissionSlug(row),
    name: row.name,
    city: row.city,
    state: row.state?.trim() || row.city,
    country: row.country?.trim() || "India",
    facilityType: row.facilityType?.trim() || "Hospital",
    overview: row.overview?.trim() || row.note || "Listed after admin approval.",
    specialties: validIds(row.specialties, specialtyById),
    treatments: validIds(row.treatments, treatmentById),
    accreditations: accreditations(row.accreditations, verified),
    verificationStatus: verified ? "verified" : "pending",
    ratings: { per: ratingFrom("PER", row.perScore), cer: ratingFrom("CER", row.cerScore) },
    doctorIds: asTextList(row.doctorIds),
    doctorNames: asTextList(row.doctorNames),
    treatmentNames: asTextList(row.treatmentNames),
    image: imageFor(row),
    accessibility: asTextList(row.accessibility),
  }
}

export function mapSubmissionToDoctor(row: SubmissionMapInput): Doctor {
  const verified = row.status === "approved"
  return {
    id: row.id,
    slug: submissionSlug(row),
    name: row.name,
    photo: imageFor(row),
    city: row.city,
    state: row.state?.trim() || row.city,
    country: row.country?.trim() || "India",
    specialization: validIds([row.specialization ?? ""], specialtyById)[0] ?? "",
    qualifications: asTextList(row.qualifications),
    yearsExperience:
      typeof row.yearsExperience === "number" && Number.isFinite(row.yearsExperience)
        ? row.yearsExperience
        : null,
    registration: { authority: "Not listed", numberMasked: "—", status: verified ? "verified" : "pending" },
    hospitalIds: asTextList(row.hospitalIds),
    treatments: validIds(row.treatments, treatmentById),
    languages: asTextList(row.languages),
    ratings: { per: ratingFrom("PER", row.perScore), mer: ratingFrom("MER", row.merScore) },
    verificationStatus: verified ? "verified" : "pending",
  }
}

export function mapSubmissionToFacility(row: SubmissionMapInput): Facility {
  const verified = row.status === "approved"
  return {
    id: row.id,
    slug: submissionSlug(row),
    name: row.name,
    category: FACILITY_CATEGORIES.includes(row.category as FacilityCategory)
      ? (row.category as FacilityCategory)
      : "hospital",
    city: row.city,
    state: row.state?.trim() || row.city,
    country: row.country?.trim() || "India",
    specialties: validIds(row.specialties, specialtyById),
    services: asTextList(row.services),
    verificationStatus: verified ? "verified" : "pending",
  }
}