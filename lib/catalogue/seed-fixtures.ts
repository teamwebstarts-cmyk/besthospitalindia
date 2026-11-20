import "server-only"

import { doctors, facilities, hospitals } from "@/data"
import type { Doctor, Facility, Hospital } from "@/types"

import type { CatalogueSubmission } from "@/lib/catalogue/submissions"

/** How many fixture rows per kind are mirrored into admin catalogue (Mongo/file). */
export const CATALOGUE_SEED_LIMIT = 10

const SEED_EMAIL_PREFIX = "listings"
const SEED_DOMAIN = "besthospitalindian.com"

function seedEmail(id: string): string {
  return `${SEED_EMAIL_PREFIX}+${id}@${SEED_DOMAIN}`
}

function scoreFromSummary(summary: { score: number | null } | undefined): number | null {
  const score = summary?.score
  return typeof score === "number" && Number.isFinite(score) ? score : null
}

function hospitalRow(hospital: Hospital, now: string): CatalogueSubmission {
  return {
    id: hospital.id,
    kind: "hospital",
    slug: hospital.slug,
    name: hospital.name,
    email: seedEmail(hospital.id),
    phone: "",
    city: hospital.city,
    note: hospital.overview,
    status: "approved",
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
    overview: hospital.overview,
    state: hospital.state,
    country: hospital.country,
    imageUrl: hospital.image,
    facilityType: hospital.facilityType,
    specialties: [...hospital.specialties],
    treatments: [...hospital.treatments],
    accreditations: hospital.accreditations.map((row) => row.name),
    perScore: scoreFromSummary(hospital.ratings.per),
    cerScore: scoreFromSummary(hospital.ratings.cer),
    doctorIds: [...hospital.doctorIds],
    treatmentNames: hospital.treatmentNames ? [...hospital.treatmentNames] : undefined,
    accessibility: hospital.accessibility ? [...hospital.accessibility] : undefined,
  }
}

function doctorRow(doctor: Doctor, now: string): CatalogueSubmission {
  return {
    id: doctor.id,
    kind: "doctor",
    slug: doctor.slug,
    name: doctor.name,
    email: seedEmail(doctor.id),
    phone: "",
    city: doctor.city,
    note: doctor.qualifications.join(" · "),
    status: "approved",
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
    state: doctor.state,
    country: doctor.country,
    imageUrl: doctor.photo,
    specialization: doctor.specialization,
    qualifications: [...doctor.qualifications],
    yearsExperience: doctor.yearsExperience,
    languages: [...doctor.languages],
    treatments: [...doctor.treatments],
    hospitalIds: [...doctor.hospitalIds],
    perScore: scoreFromSummary(doctor.ratings.per),
    merScore: scoreFromSummary(doctor.ratings.mer),
  }
}

function facilityRow(facility: Facility, now: string): CatalogueSubmission {
  return {
    id: facility.id,
    kind: "facility",
    slug: facility.slug,
    name: facility.name,
    email: seedEmail(facility.id),
    phone: "",
    city: facility.city,
    note: facility.services.join(" · "),
    status: "approved",
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
    state: facility.state,
    country: facility.country,
    category: facility.category,
    specialties: [...facility.specialties],
    services: [...facility.services],
  }
}

/** Inserts missing fixture rows so the public site and admin share one catalogue. */
export function buildMissingFixtureSeeds(existing: CatalogueSubmission[]): CatalogueSubmission[] {
  const known = new Set(existing.map((row) => row.id))
  const now = new Date().toISOString()
  const pending: CatalogueSubmission[] = []

  for (const hospital of hospitals.slice(0, CATALOGUE_SEED_LIMIT)) {
    if (!known.has(hospital.id)) pending.push(hospitalRow(hospital, now))
  }
  for (const doctor of doctors.slice(0, CATALOGUE_SEED_LIMIT)) {
    if (!known.has(doctor.id)) pending.push(doctorRow(doctor, now))
  }
  for (const facility of facilities.slice(0, CATALOGUE_SEED_LIMIT)) {
    if (!known.has(facility.id)) pending.push(facilityRow(facility, now))
  }

  return pending
}