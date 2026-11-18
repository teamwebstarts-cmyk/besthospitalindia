/**
 * Portal-support domain contracts (reviews, users, notifications, audit, CMS) —
 * BestHospitalIndia (A01).
 *
 * Review, PartnerUser, Notification, AuditEvent, Faq and Testimonial are listed
 * under "Additional entities" in implementation/09-data-models-and-mock-data.md
 * without specified fields — designed minimally for the mock phase and marked
 * PROPOSED where the docs do not define them.
 */

import type { ProviderRefType } from './provider';

/** PROPOSED — pending orchestrator review (review status vocabulary is not defined in the docs). */
export type ReviewStatus = 'pending_moderation' | 'published' | 'rejected' | 'flagged';

/** PROPOSED — pending orchestrator review (review verification is open product ambiguity D-7). */
export type ReviewerVerification = 'unverified' | 'email_verified' | 'verified_patient';

/**
 * PROPOSED — pending orchestrator review (entity listed in the 09 doc "Additional
 * entities" but no fields are specified; relationship direction per 09: one
 * provider + one patient).
 */
export interface Review {
  id: string;
  providerType: ProviderRefType;
  providerId: string;
  /** References Patient.id (PROPOSED entity). */
  patientId: string;
  rating: number;
  scaleMax: 5;
  title: string;
  body: string;
  status: ReviewStatus;
  reviewerVerification: ReviewerVerification;
  /** Partner reply; demo-only and absent until a partner "replies". */
  reply?: { body: string; repliedAt: string; repliedBy: string };
  /** ISO timestamp. */
  createdAt: string;
}

/** PROPOSED — pending orchestrator review (partner role vocabulary is not defined in the docs). */
export type PartnerRole = 'owner' | 'staff' | 'coordinator';

/**
 * PROPOSED — pending orchestrator review (entity listed in the 09 doc "Additional
 * entities" but no fields are specified).
 */
export interface PartnerUser {
  id: string;
  name: string;
  email: string;
  role: PartnerRole;
  /** When role is owner/staff: Hospital.id; when coordinator: null (doctor-side). */
  hospitalId: string | null;
  /** Demo-only; no real auth exists in the mock phase. */
  mockLoginHint: string;
  /** ISO timestamp. */
  createdAt: string;
}

/** PROPOSED — pending orchestrator review (notification status vocabulary is not defined in the docs). */
export type NotificationStatus = 'unread' | 'read' | 'dismissed';

/** PROPOSED — pending orchestrator review (audience vocabulary is not defined in the docs). */
export type NotificationAudience = 'patient' | 'hospital_partner' | 'doctor_partner' | 'admin';

/** PROPOSED — pending orchestrator review (category vocabulary is not defined in the docs). */
export type NotificationCategory =
  | 'appointment'
  | 'enquiry'
  | 'review'
  | 'rating'
  | 'verification'
  | 'system';

/**
 * PROPOSED — pending orchestrator review (entity listed in the 09 doc "Additional
 * entities" but no fields are specified; FR-017 limits phase 1 to local mock
 * notification states — never a real send).
 */
export interface Notification {
  id: string;
  audience: NotificationAudience;
  /** Patient/partner/admin demo id the notification is addressed to; null = broadcast. */
  recipientId: string | null;
  category: NotificationCategory;
  title: string;
  body: string;
  status: NotificationStatus;
  /** ISO timestamp. */
  createdAt: string;
  /** ISO timestamp, or null while unread. */
  readAt: string | null;
  /** In-app mock link target, e.g. "/patient/notifications". */
  linkHref?: string;
}

/** PROPOSED — pending orchestrator review (audit vocabulary is not defined in the docs). */
export type AuditActorRole = 'admin' | 'hospital_partner' | 'doctor_partner' | 'patient' | 'system';

/** PROPOSED — pending orchestrator review (audit action taxonomy is not defined in the docs). */
export type AuditAction =
  | 'enquiry_submitted'
  | 'appointment_requested'
  | 'review_submitted'
  | 'review_moderated'
  | 'rating_published'
  | 'verification_updated'
  | 'document_reviewed'
  | 'notification_dismissed';

/**
 * PROPOSED — pending orchestrator review (entity listed in the 09 doc "Additional
 * entities" but no fields are specified; preserves auditability per 01-requirements.md
 * non-functional requirement "Preserve auditability in rating and verification data models").
 */
export interface AuditEvent {
  id: string;
  actorRole: AuditActorRole;
  /** Demo-only actor display id. */
  actorId: string | null;
  action: AuditAction;
  summary: string;
  /** ISO timestamp. */
  at: string;
  /** Mock link to the affected record, when applicable. */
  targetHref?: string;
}

/** PROPOSED — pending orchestrator review (CMS content status is not defined in the docs). */
export type CmsContentStatus = 'draft' | 'in_review' | 'published' | 'archived';

/**
 * PROPOSED — pending orchestrator review (entity listed in the 09 doc "Additional
 * entities" but no fields are specified; minimal admin-CMS mock shape).
 */
export interface CmsContent {
  id: string;
  slug: string;
  title: string;
  status: CmsContentStatus;
  /** Demo-only body excerpt; full copy is owned by CMS page agents, not fixtures. */
  bodyExcerpt: string;
  /** ISO timestamp. */
  updatedAt: string;
}

/**
 * PROPOSED — pending orchestrator review (entity listed in the 09 doc "Additional
 * entities" but no fields are specified; minimal FAQ shape for the homepage FAQ section).
 */
export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'patients' | 'partners' | 'ratings';
  order: number;
}

/**
 * PROPOSED — pending orchestrator review (entity listed in the 09 doc "Additional
 * entities" but no fields are specified; minimal testimonial shape for the homepage).
 */
export interface Testimonial {
  id: string;
  /** Demo-only attribution; never a real person. */
  authorName: string;
  authorCountry: string;
  quote: string;
  /** Optional demo reference to a Hospital.id or null. */
  hospitalId: string | null;
  /** ISO date string. */
  at: string;
  /** Demo portrait URL (stock placeholder). */
  authorPhoto?: string;
  /** Demo star rating (1–5) for review-style presentation. */
  rating?: number;
  /** Short relative label, e.g. "3 weeks ago". */
  relativeTime?: string;
}
