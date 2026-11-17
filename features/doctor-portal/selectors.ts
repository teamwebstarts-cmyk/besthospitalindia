/**
 * Portal data selectors for the Doctor Portal (A10).
 *
 * Pure functions over the frozen A01 fixtures — no embedded record arrays in
 * page JSX (pages/22 §6). All relationships resolve through the shared lookup
 * maps, so every id must exist in the fixture data (09 contract).
 *
 * Demo-session mapping (see session.ts): enquiries "assigned" to the demo
 * doctor are PatientEnquiry rows whose `preferredProviderId` equals the demo
 * doctor id — the only doctor-directed assignment vocabulary in the fixtures.
 */

import {
  appointments,
  doctorById,
  hospitalById,
  patientById,
  patientEnquiries,
  reviews,
  specialtyById,
  treatmentById,
} from "@/data"
import type {
  AppointmentRequest,
  Doctor,
  PatientEnquiry,
  Review,
} from "@/types"

// ---------------------------------------------------------------------------
// Doctor-side appointment queue
// ---------------------------------------------------------------------------

/** All appointment requests addressed to the given doctor, newest first. */
export function appointmentsForDoctor(doctorId: string): readonly AppointmentRequest[] {
  return appointments
    .filter((a) => a.providerType === "doctor" && a.providerId === doctorId)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

// ---------------------------------------------------------------------------
// Consultation queue (doctor-directed enquiries)
// ---------------------------------------------------------------------------

/**
 * Enquiries assigned to the given doctor (preferredProviderId = doctor id),
 * newest consent first. Enquiries without a preferred provider are IUF-desk
 * traffic, not doctor-assigned, and never appear here.
 */
export function consultationQueueForDoctor(doctorId: string): readonly PatientEnquiry[] {
  return patientEnquiries
    .filter((e) => e.preferredProviderId === doctorId)
    .slice()
    .sort((a, b) => b.consentAt.localeCompare(a.consentAt))
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

/** Doctor reviews, newest first (partner-facing view; all fixture statuses). */
export function reviewsForDoctor(doctorId: string): readonly Review[] {
  return reviews
    .filter((r) => r.providerType === "doctor" && r.providerId === doctorId)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

// ---------------------------------------------------------------------------
// Display-name helpers (id → label resolution stays out of page JSX)
// ---------------------------------------------------------------------------

/** Patient display name with an explicit unknown fallback for broken links. */
export function patientDisplayName(patientId: string): string {
  return patientById[patientId]?.name ?? "Unknown patient (demo)"
}

/** Doctor display name with an explicit unknown fallback for broken links. */
export function doctorDisplayName(doctorId: string): string | undefined {
  return doctorById[doctorId]?.name
}

/** Treatment display name; undefined passes through for optional ids. */
export function treatmentLabel(treatmentId: string | undefined): string | undefined {
  if (!treatmentId) return undefined
  return treatmentById[treatmentId]?.name
}

/** Specialty display name; falls back to the raw id if the link is broken. */
export function specialtyLabel(specialtyId: string): string {
  return specialtyById[specialtyId]?.name ?? specialtyId
}

/** Hospital display name with an explicit unknown fallback for broken links. */
export function hospitalDisplayName(hospitalId: string): string {
  return hospitalById[hospitalId]?.name ?? "Unknown hospital (demo)"
}

/** Full typed doctor record for pages that need more than the display name. */
export function getDoctor(doctorId: string): Doctor | undefined {
  return doctorById[doctorId]
}
