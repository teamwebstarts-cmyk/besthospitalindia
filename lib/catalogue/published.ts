import "server-only"

import type { Doctor, Hospital, RatingSummary } from "@/types"
import type { RatingKind } from "@/types/rating"

import { listSubmissions, type CatalogueSubmission } from "@/lib/catalogue/submissions"

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

function slugPart(value: string): string {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  return slug || "listing"
}

export function submissionSlug(row: CatalogueSubmission): string {
  return `${slugPart(row.name)}-${row.id}`
}

function approved(kind: CatalogueSubmission["kind"]): CatalogueSubmission[] {
  return listSubmissions(kind).filter((row) => row.status === "approved")
}

export function publishedHospitals(): Hospital[] {
  return approved("hospital").map((row) => ({
    id: row.id,
    slug: submissionSlug(row),
    name: row.name,
    city: row.city,
    state: row.city,
    country: "India",
    facilityType: "Hospital",
    overview: row.note || "Listed after admin approval.",
    specialties: [],
    treatments: [],
    accreditations: [],
    verificationStatus: "pending",
    ratings: { per: unrated("PER"), cer: unrated("CER") },
    doctorIds: [],
    image: "/images/hospitals/placeholder.svg",
  }))
}

export function publishedDoctors(): Doctor[] {
  return approved("doctor").map((row) => ({
    id: row.id,
    slug: submissionSlug(row),
    name: row.name,
    photo: "/images/hospitals/placeholder.svg",
    city: row.city,
    state: row.city,
    country: "India",
    specialization: "",
    qualifications: [],
    yearsExperience: null,
    registration: { authority: "Not listed", numberMasked: "—", status: "pending" },
    hospitalIds: [],
    treatments: [],
    languages: [],
    ratings: { per: unrated("PER"), mer: unrated("MER") },
    verificationStatus: "pending",
  }))
}

export function publishedHospitalBySlug(slug: string): Hospital | undefined {
  return publishedHospitals().find((hospital) => hospital.slug === slug)
}

export function publishedDoctorBySlug(slug: string): Doctor | undefined {
  return publishedDoctors().find((doctor) => doctor.slug === slug)
}

function includesQuery(query: string | undefined, parts: string[]): boolean {
  const needle = query?.trim().toLowerCase()
  if (!needle) return true
  return parts.join(" ").toLowerCase().includes(needle)
}

export function matchingPublishedHospitals(filters: {
  query?: string
  city?: string
  state?: string
  specialties?: string[]
}): Hospital[] {
  return publishedHospitals().filter((hospital) => {
    if (filters.city && hospital.city.toLowerCase() !== filters.city.toLowerCase()) return false
    if (filters.state && hospital.state.toLowerCase() !== filters.state.toLowerCase()) return false
    if (filters.specialties && filters.specialties.length > 0) return false
    return includesQuery(filters.query, [hospital.name, hospital.city])
  })
}

export function matchingPublishedDoctors(filters: {
  query?: string
  city?: string
  specialization?: string
}): Doctor[] {
  return publishedDoctors().filter((doctor) => {
    if (filters.city && doctor.city.toLowerCase() !== filters.city.toLowerCase()) return false
    if (filters.specialization) return false
    return includesQuery(filters.query, [doctor.name, doctor.city])
  })
}
