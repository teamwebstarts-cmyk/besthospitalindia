/**
 * Admin Portal data selectors (A11) — pure functions over the frozen A01
 * fixtures. No record arrays are embedded in page JSX (pages/23 §6, pages/24
 * §6); every screen consumes these selectors, so dashboard totals reconcile
 * exactly with the queues/tables the module pages render.
 *
 * RATINGS RULE: PER/CER/MER stay separate — helpers expose one rating kind at
 * a time and a missing score renders as "Not yet rated"/"Assessment pending",
 * never 0/5. Verification status is reported independently of any rating.
 */

import {
  appointments,
  assessmentsForProvider,
  doctorById,
  doctors,
  facilities,
  hospitals,
  patientById,
  patientEnquiries,
  partnerUsers,
  reviews,
  specialtyById,
  tourismCases,
  treatmentById,
} from "@/data"
import type {
  AppointmentRequest,
  Doctor,
  Facility,
  FacilityCategory,
  Hospital,
  PatientEnquiry,
  PartnerUser,
  Review,
  VerificationStatus,
} from "@/types"

// ---------------------------------------------------------------------------
// Display-name helpers (id → label resolution stays out of page JSX)
// ---------------------------------------------------------------------------

/** Specialty display name; falls back to the raw id if the link is broken. */
export function specialtyLabel(specialtyId: string): string {
  return specialtyById[specialtyId]?.name ?? specialtyId
}

/** Treatment display name; undefined passes through for optional ids. */
export function treatmentLabel(treatmentId: string | undefined): string | undefined {
  if (!treatmentId) return undefined
  return treatmentById[treatmentId]?.name
}

/** Patient display name with an explicit unknown fallback for broken links. */
export function patientDisplayName(patientId: string): string {
  return patientById[patientId]?.name ?? "Unknown patient (demo)"
}

/** Hospital display name with an explicit unknown fallback for broken links. */
export function hospitalDisplayName(hospitalId: string): string {
  const hospital = hospitals.find((h) => h.id === hospitalId)
  return hospital?.name ?? "Unknown hospital (demo)"
}

/** Doctor display name with an explicit unknown fallback for broken links. */
export function doctorDisplayName(doctorId: string): string {
  const doctor = doctorById[doctorId]
  return doctor?.name ?? "Unknown doctor (demo)"
}

// ---------------------------------------------------------------------------
// Provider queues — verification states (admin work queues)
// ---------------------------------------------------------------------------

/** Hospitals whose profile verification is not yet approved. */
export function hospitalsPendingVerification(): Hospital[] {
  return hospitals.filter(
    (h) => h.verificationStatus === "pending" || h.verificationStatus === "unverified",
  )
}

/** Doctors whose profile or registration verification needs review. */
export function doctorsPendingVerification(): Doctor[] {
  return doctors.filter(
    (d) =>
      d.verificationStatus !== "verified" || d.registration.status !== "verified",
  )
}

/** Facilities whose verification is not yet approved. */
export function facilitiesPendingVerification(): Facility[] {
  return facilities.filter(
    (f) => f.verificationStatus === "pending" || f.verificationStatus === "unverified",
  )
}

/**
 * Rating assessments that a reviewer still has to act on — the dashboard
 * "urgent queue" for the ratings module (A12-owned route; the dashboard only
 * counts and links to it).
 */
export function assessmentsNeedingReviewCount(): number {
  const pendingKinds = new Set(["in_review", "changes_requested", "submitted"])
  let count = 0
  for (const hospital of hospitals) {
    for (const assessment of assessmentsForProvider("hospital", hospital.id)) {
      if (pendingKinds.has(assessment.status)) count += 1
    }
  }
  for (const doctor of doctors) {
    for (const assessment of assessmentsForProvider("doctor", doctor.id)) {
      if (pendingKinds.has(assessment.status)) count += 1
    }
  }
  return count
}

// ---------------------------------------------------------------------------
// Enquiry / appointment / moderation queues
// ---------------------------------------------------------------------------

const OPEN_ENQUIRY_STATUSES = new Set(["submitted", "under_review", "assigned"])

/** Enquiries awaiting admin/coordinator action. */
export function openEnquiries(): PatientEnquiry[] {
  return patientEnquiries
    .filter((enquiry) => OPEN_ENQUIRY_STATUSES.has(enquiry.status))
    .slice()
    .sort((a, b) => b.consentAt.localeCompare(a.consentAt))
}

/** Appointment requests that have not reached a terminal state. */
export function openAppointmentRequests(): AppointmentRequest[] {
  return appointments.filter(
    (a) => a.status !== "cancelled" && a.status !== "completed",
  )
}

/** Reviews awaiting moderation (pending or flagged). */
export function reviewsAwaitingModeration(): Review[] {
  return reviews.filter(
    (review) => review.status === "pending_moderation" || review.status === "flagged",
  )
}

/** Unassigned international medical-tourism cases (coordinator queue). */
export function unassignedTourismCases(): number {
  return tourismCases.filter((c) => c.coordinatorAssignment === "unassigned").length
}

// ---------------------------------------------------------------------------
// Recent platform activity (dashboard feed)
// ---------------------------------------------------------------------------

export interface AdminActivityItem {
  id: string
  summary: string
  detail: string
  /** ISO timestamp. */
  at: string
  href?: string
  kind: "enquiry" | "appointment" | "review" | "tourism" | "provider"
}

const ACTIVITY_LIMIT = 8

/**
 * Recent demo platform activity, merged from the frozen fixture queues and
 * sorted newest first. Derived purely from existing records — no new fixture
 * type and no invented events.
 */
export function recentPlatformActivity(): AdminActivityItem[] {
  const items: AdminActivityItem[] = []

  for (const enquiry of patientEnquiries) {
    items.push({
      id: `activity-enquiry-${enquiry.id}`,
      summary: `Enquiry ${enquiry.id} — ${specialtyLabel(enquiry.specialty)}`,
      detail: `${enquiry.patientName} · ${enquiry.country}`,
      at: enquiry.consentAt,
      href: "/admin/patients",
      kind: "enquiry",
    })
  }

  for (const appointment of appointments) {
    const providerName =
      appointment.providerType === "doctor"
        ? doctorDisplayName(appointment.providerId)
        : hospitalDisplayName(appointment.providerId)
    items.push({
      id: `activity-appointment-${appointment.id}`,
      summary: `Appointment request ${appointment.id} — ${treatmentLabel(appointment.treatmentId) ?? "General consultation"}`,
      detail: `${patientDisplayName(appointment.patientId)} · ${providerName}`,
      at: appointment.updatedAt ?? appointment.createdAt,
      href: "/admin/appointments",
      kind: "appointment",
    })
  }

  for (const review of reviews) {
    const providerName =
      review.providerType === "doctor"
        ? doctorDisplayName(review.providerId)
        : hospitalDisplayName(review.providerId)
    items.push({
      id: `activity-review-${review.id}`,
      summary: `Review ${review.id} for ${providerName}`,
      detail: `${patientDisplayName(review.patientId)} · ${review.rating}/${review.scaleMax} stars (individual review, not a platform rating)`,
      at: review.createdAt,
      href: "/admin/reviews",
      kind: "review",
    })
  }

  for (const tourismCase of tourismCases) {
    items.push({
      id: `activity-tourism-${tourismCase.id}`,
      summary: `Tourism case ${tourismCase.id} — ${tourismCase.stage.replace(/_/g, " ")}`,
      detail: `${tourismCase.patientName} · ${tourismCase.country}`,
      at: tourismCase.createdAt,
      href: "/admin/medical-tourism",
      kind: "tourism",
    })
  }

  for (const hospital of hospitalsPendingVerification()) {
    items.push({
      id: `activity-hospital-${hospital.id}`,
      summary: `Hospital verification ${hospital.verificationStatus} — ${hospital.name}`,
      detail: `${hospital.city}, ${hospital.state}`,
      at: "2026-10-15T09:00:00.000Z",
      href: "/admin/hospitals",
      kind: "provider",
    })
  }

  for (const doctor of doctorsPendingVerification()) {
    items.push({
      id: `activity-doctor-${doctor.id}`,
      summary: `Doctor credential review — ${doctor.name}`,
      detail: `Registration ${doctor.registration.status.replace(/_/g, " ")} · ${doctor.city}`,
      at: "2026-10-14T09:00:00.000Z",
      href: "/admin/doctors",
      kind: "provider",
    })
  }

  return items
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, ACTIVITY_LIMIT)
}

// ---------------------------------------------------------------------------
// Patient helpers (privacy-conscious presentation)
// ---------------------------------------------------------------------------

/** Age in whole years from a date of birth, or null when not on record. */
export function patientAgeYears(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null
  const birth = new Date(dateOfBirth)
  if (Number.isNaN(birth.getTime())) return null
  const now = new Date("2026-11-17T00:00:00.000Z")
  let age = now.getUTCFullYear() - birth.getUTCFullYear()
  const beforeBirthday =
    now.getUTCMonth() < birth.getUTCMonth() ||
    (now.getUTCMonth() === birth.getUTCMonth() && now.getUTCDate() < birth.getUTCDate())
  if (beforeBirthday) age -= 1
  return age
}

/** Enquiries submitted by one patient, newest consent first. */
export function enquiriesForPatient(patientName: string): PatientEnquiry[] {
  return patientEnquiries
    .filter((enquiry) => enquiry.patientName === patientName)
    .slice()
    .sort((a, b) => b.consentAt.localeCompare(a.consentAt))
}

/** Appointment requests submitted by one patient, newest first. */
export function appointmentsForPatientAdmin(patientId: string): AppointmentRequest[] {
  return appointments
    .filter((appointment) => appointment.patientId === patientId)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

// ---------------------------------------------------------------------------
// Partner helpers
// ---------------------------------------------------------------------------

/** All partner users, fixture order. */
export function allPartnerUsers(): readonly PartnerUser[] {
  return partnerUsers
}

/** Partner users belonging to one hospital. */
export function partnerUsersForHospital(hospitalId: string): PartnerUser[] {
  return partnerUsers.filter((user) => user.hospitalId === hospitalId)
}

/** Resolved hospital record for a partner user's organization, when linked. */
export function partnerHospital(user: PartnerUser): Hospital | undefined {
  return user.hospitalId ? hospitals.find((h) => h.id === user.hospitalId) : undefined
}

// ---------------------------------------------------------------------------
// Category labels (facility taxonomy — existing contract values only)
// ---------------------------------------------------------------------------

/** Human labels for the frozen FacilityCategory union (types/provider.ts). */
export const FACILITY_CATEGORY_LABELS: Record<FacilityCategory, string> = {
  hospital: "Hospital",
  specialty_centre: "Specialty centre",
  diagnostic_lab: "Diagnostic lab",
  rehabilitation: "Rehabilitation",
  wellness: "Wellness",
  medical_tourism: "Medical tourism",
}

/** Verification status display copy used consistently across admin tables. */
export const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  verified: "Verified",
  pending: "Pending review",
  rejected: "Rejected",
  expired: "Expired",
  unverified: "Unverified",
}
