import "server-only"

import { specialtyById, treatmentById } from "@/data"
import type { Accreditation, Doctor, Facility, FacilityCategory, Hospital, RatingSummary } from "@/types"
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
    evidenceSummary: "Score entered for the public card. PER, CER and MER stay separate.",
  }
}

function slugPart(value: string): string {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  return slug || "listing"
}

export function submissionSlug(row: CatalogueSubmission): string {
  const stable = row.slug?.trim()
  if (stable) return stable
  return `${slugPart(row.name)}-${row.id}`
}

async function approved(kind: CatalogueSubmission["kind"]): Promise<CatalogueSubmission[]> {
  return (await listSubmissions(kind)).filter((row) => row.status === "approved")
}

function validIds(ids: string[] | undefined, lookup: Record<string, unknown>): string[] {
  return (ids ?? []).filter((id) => typeof id === "string" && lookup[id] !== undefined)
}

function accreditations(names: string[] | undefined): Accreditation[] {
  return (names ?? [])
    .filter((name) => typeof name === "string" && name.trim().length > 0)
    .map((name) => ({ name: name.trim(), status: "verified" as const }))
}

function asTextList(value: string[] | string | undefined): string[] {
  if (Array.isArray(value)) return value.filter((v) => typeof v === "string" && v.trim().length > 0)
  if (typeof value === "string") {
    return value.split(/[,\n]/).map((part) => part.trim()).filter(Boolean)
  }
  return []
}

function imageFor(row: CatalogueSubmission): string {
  return row.imageUrl?.trim() || "/images/hospitals/placeholder.svg"
}

function resolveSpecialtyId(raw: string | undefined): string {
  const value = raw?.trim() ?? ""
  if (!value) return ""
  if (specialtyById[value]) return value
  const byName = Object.values(specialtyById).find(
    (row) => row.name.toLowerCase() === value.toLowerCase() || row.slug === value,
  )
  return byName?.id ?? value
}

const FACILITY_CATEGORIES: FacilityCategory[] = [
  "hospital", "specialty_centre", "diagnostic_lab", "rehabilitation", "wellness", "medical_tourism",
]

export async function publishedHospitals(): Promise<Hospital[]> {
  return (await approved("hospital")).map((row) => ({
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
    accreditations: accreditations(row.accreditations),
    verificationStatus: "verified",
    ratings: { per: ratingFrom("PER", row.perScore), cer: ratingFrom("CER", row.cerScore) },
    doctorIds: asTextList(row.doctorIds),
    doctorNames: asTextList(row.doctorNames),
    treatmentNames: asTextList(row.treatmentNames),
    image: imageFor(row),
    accessibility: asTextList(row.accessibility),
  }))
}

export async function publishedDoctors(): Promise<Doctor[]> {
  return (await approved("doctor")).map((row) => ({
    id: row.id,
    slug: submissionSlug(row),
    name: row.name,
    photo: imageFor(row),
    city: row.city,
    state: row.state?.trim() || row.city,
    country: row.country?.trim() || "India",
    specialization: resolveSpecialtyId(row.specialization),
    qualifications: asTextList(row.qualifications),
    yearsExperience:
      typeof row.yearsExperience === "number" && Number.isFinite(row.yearsExperience)
        ? row.yearsExperience
        : null,
    registration: { authority: "Not listed", numberMasked: "—", status: "verified" },
    hospitalIds: asTextList(row.hospitalIds),
    treatments: validIds(row.treatments, treatmentById),
    languages: asTextList(row.languages),
    ratings: { per: ratingFrom("PER", row.perScore), mer: ratingFrom("MER", row.merScore) },
    verificationStatus: "verified",
  }))
}

export async function publishedFacilities(): Promise<Facility[]> {
  return (await approved("facility")).map((row) => ({
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
    verificationStatus: "verified",
  }))
}

export async function publishedHospitalBySlug(slug: string): Promise<Hospital | undefined> {
  return (await publishedHospitals()).find((hospital) => hospital.slug === slug)
}

export async function publishedDoctorBySlug(slug: string): Promise<Doctor | undefined> {
  return (await publishedDoctors()).find((doctor) => doctor.slug === slug)
}

export async function publishedFacilityBySlug(slug: string): Promise<Facility | undefined> {
  return (await publishedFacilities()).find((facility) => facility.slug === slug)
}

function includesQuery(query: string | undefined, parts: string[]): boolean {
  const needle = query?.trim().toLowerCase()
  if (!needle) return true
  return parts.join(" ").toLowerCase().includes(needle)
}

export async function matchingPublishedHospitals(filters: {
  query?: string
  city?: string
  state?: string
  specialties?: string[]
}): Promise<Hospital[]> {
  return (await publishedHospitals()).filter((hospital) => {
    if (filters.city && hospital.city.toLowerCase() !== filters.city.toLowerCase()) return false
    if (filters.state && hospital.state.toLowerCase() !== filters.state.toLowerCase()) return false
    if (filters.specialties && filters.specialties.length > 0) {
      if (!filters.specialties.some((id) => hospital.specialties.includes(id))) return false
    }
    return includesQuery(filters.query, [hospital.name, hospital.city, hospital.overview])
  })
}

export async function matchingPublishedDoctors(filters: {
  query?: string
  city?: string
  specialization?: string
}): Promise<Doctor[]> {
  return (await publishedDoctors()).filter((doctor) => {
    if (filters.city && doctor.city.toLowerCase() !== filters.city.toLowerCase()) return false
    if (filters.specialization && doctor.specialization !== filters.specialization) return false
    return includesQuery(filters.query, [doctor.name, doctor.city, doctor.qualifications.join(" ")])
  })
}

export async function matchingPublishedFacilities(filters: {
  query?: string
  city?: string
  category?: string
  specialties?: string[]
  services?: string
}): Promise<Facility[]> {
  return (await publishedFacilities()).filter((facility) => {
    if (filters.city && facility.city.toLowerCase() !== filters.city.toLowerCase()) return false
    if (filters.category && facility.category !== filters.category) return false
    if (filters.specialties && filters.specialties.length > 0) {
      if (!filters.specialties.some((id) => facility.specialties.includes(id))) return false
    }
    if (filters.services && !facility.services.join(" ").toLowerCase().includes(filters.services.toLowerCase())) return false
    return includesQuery(filters.query, [facility.name, facility.services.join(" ")])
  })
}