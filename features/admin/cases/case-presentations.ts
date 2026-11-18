/**
 * A12 case-status presentation maps — Admin Case & Trust Operations.
 *
 * Pure display metadata (labels + StatusBadge tones) for the status
 * vocabularies this queue set consumes. Tones MIRROR the shared
 * `STATUS_TONES` map in components/shared/status-badge.tsx wherever a value
 * is already covered there, and only add tones for A12 vocabularies the
 * shared map does not include (consultation enquiry, tourism stage,
 * coordinator assignment, review moderation, assessment lifecycle).
 *
 * No new status values are invented here — every key comes from a frozen A01
 * union (types/appointment.ts, types/patient.ts, types/consultation.ts,
 * types/portal.ts, types/rating.ts). These maps exist only because
 * `StatusBadge.status` falls back to neutral for values outside its shared
 * map; passing an explicit `tone` keeps semantic color without editing the
 * shared component.
 */

import type { StatusTone } from "@/components/shared/status-badge"
import type {
  AppointmentStatus,
  ConsultationType,
  PatientEnquiryStatus,
  RatingAssessmentStatus,
  ReviewStatus,
  ReviewerVerification,
  TourismCaseStage,
  TourismCoordinatorAssignment,
} from "@/types"

export interface CaseStatusPresentation {
  /** Human label for tables, badges and dialogs. */
  label: string
  /** Semantic tone forwarded to the shared StatusBadge `tone` prop. */
  tone: StatusTone
}

/** AppointmentRequest.status (types/appointment.ts). Tones match the shared map. */
export const APPOINTMENT_STATUS_PRESENTATION: Record<
  AppointmentStatus,
  CaseStatusPresentation
> = {
  requested: { label: "Requested", tone: "warning" },
  under_review: { label: "Under review", tone: "warning" },
  scheduled: { label: "Scheduled", tone: "warning" },
  confirmed: { label: "Confirmed", tone: "success" },
  cancelled: { label: "Cancelled", tone: "neutral" },
  completed: { label: "Completed", tone: "success" },
}

/** PatientEnquiry.status (types/patient.ts) — the consultation queue states. */
export const ENQUIRY_STATUS_PRESENTATION: Record<
  PatientEnquiryStatus,
  CaseStatusPresentation
> = {
  submitted: { label: "Submitted", tone: "info" },
  under_review: { label: "Under review", tone: "warning" },
  assigned: { label: "Assigned", tone: "info" },
  responded: { label: "Responded", tone: "success" },
  closed: { label: "Closed", tone: "neutral" },
}

/** MedicalTourismCase.stage (types/consultation.ts) — documented case pipeline. */
export const TOURISM_STAGE_PRESENTATION: Record<
  TourismCaseStage,
  CaseStatusPresentation
> = {
  enquiry_received: { label: "Enquiry received", tone: "info" },
  documents_pending: { label: "Documents pending", tone: "warning" },
  proposal_shared: { label: "Proposal shared", tone: "info" },
  travel_planned: { label: "Travel planned", tone: "info" },
  treatment_ongoing: { label: "Treatment ongoing", tone: "warning" },
  follow_up: { label: "Follow-up", tone: "info" },
  closed: { label: "Closed", tone: "neutral" },
}

/** MedicalTourismCase.coordinatorAssignment (types/consultation.ts). */
export const COORDINATOR_ASSIGNMENT_PRESENTATION: Record<
  TourismCoordinatorAssignment,
  CaseStatusPresentation
> = {
  unassigned: { label: "Unassigned", tone: "neutral" },
  assigned: { label: "Assigned", tone: "info" },
  reassigned: { label: "Reassigned", tone: "warning" },
  handed_over: { label: "Handed over", tone: "neutral" },
}

/** Review.status (types/portal.ts) — moderation queue states. */
export const REVIEW_STATUS_PRESENTATION: Record<
  ReviewStatus,
  CaseStatusPresentation
> = {
  pending_moderation: { label: "Pending moderation", tone: "warning" },
  published: { label: "Published", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
  flagged: { label: "Flagged", tone: "warning" },
}

/** Review.reviewerVerification (types/portal.ts) — authenticity is fixture-only. */
export const REVIEWER_VERIFICATION_PRESENTATION: Record<
  ReviewerVerification,
  CaseStatusPresentation
> = {
  verified_patient: { label: "Verified patient", tone: "success" },
  email_verified: { label: "Email verified", tone: "info" },
  unverified: { label: "Unverified reviewer", tone: "neutral" },
}

/**
 * RatingAssessment.status (types/rating.ts) — PROPOSED assessment lifecycle.
 * Publishing is only reachable from `approved` (page spec: "publish only
 * approved demo assessment").
 */
export const ASSESSMENT_STATUS_PRESENTATION: Record<
  RatingAssessmentStatus,
  CaseStatusPresentation
> = {
  draft: { label: "Draft", tone: "warning" },
  in_review: { label: "In review", tone: "warning" },
  changes_requested: { label: "Changes requested", tone: "danger" },
  approved: { label: "Approved", tone: "success" },
  published: { label: "Published", tone: "success" },
}

/** ConsultationType (types/consultation.ts) — IUF free vs standard scope. */
export const CONSULTATION_TYPE_PRESENTATION: Record<
  ConsultationType,
  CaseStatusPresentation
> = {
  free_consultation: { label: "IUF free consultation", tone: "info" },
  standard_enquiry: { label: "Standard enquiry", tone: "neutral" },
  second_opinion: { label: "Second opinion", tone: "info" },
}

/** Minimal next-step copy for the consultation workflow (pages/25 §7). */
export const ENQUIRY_NEXT_STEP: Record<PatientEnquiryStatus, string> = {
  submitted: "Admin review — open the case and start the demo review.",
  under_review:
    "Validate patient information and requirements, then assign a hospital or doctor.",
  assigned:
    "Provider decision pending — record the acceptance, or decline and reassign.",
  responded: "Patient informed (demo record). Close the case when follow-up ends.",
  closed: "Case closed — demo record retained for reporting review.",
}
