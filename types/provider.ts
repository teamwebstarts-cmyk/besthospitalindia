/**
 * Provider domain contracts (hospitals, doctors, facilities) — BestHospitalIndia (A01).
 *
 * Source of truth: implementation/09-data-models-and-mock-data.md.
 * Field sets for Hospital / Doctor / Facility / accreditation / registration are
 * exactly as specified there. Extra helper unions are marked PROPOSED where the
 * docs do not define them.
 */

import type { RatingSummary } from './rating';

/** Defined in 09-data-models-and-mock-data.md. */
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected' | 'expired';

/**
 * The two provider kinds that reviews, appointment requests and rating
 * assessments can reference. Home for this union is this module to avoid a
 * runtime dependency from non-provider modules; consumers import only types.
 */
export type ProviderRefType = 'hospital' | 'doctor';

/** Accreditation entry on Hospital — shape per 09-data-models-and-mock-data.md. */
export interface Accreditation {
  name: string;
  status: VerificationStatus;
  validUntil?: string;
}

/** Doctor registration block — shape per 09-data-models-and-mock-data.md. */
export interface Registration {
  authority: string;
  numberMasked: string;
  status: VerificationStatus;
}

/** Exactly as specified in 09-data-models-and-mock-data.md. */
export interface Hospital {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  country: string;
  facilityType: string;
  overview: string;
  /** Specialty IDs (see data/specialties.ts) — relational, not display text. */
  specialties: string[];
  /** Treatment IDs (see data/treatments.ts) — relational, not display text. */
  treatments: string[];
  accreditations: Accreditation[];
  verificationStatus: VerificationStatus;
  /** Independent ratings — never combined with each other or into a composite. */
  ratings: { per: RatingSummary; cer: RatingSummary };
  /** Doctor IDs — must resolve both ways against Doctor.hospitalIds. */
  doctorIds: string[];
  /** Optional plain names when admins enter doctors without a linked profile. */
  doctorNames?: string[];
  /** Optional free-text treatment lines (admin-entered). */
  treatmentNames?: string[];
  /** Local neutral placeholder path; no hotlinked assets in the mock phase. */
  image: string;
  /** Optional access notes entered by admin. Omitted on fixture hospitals. */
  accessibility?: string[];
}

/** Exactly as specified in 09-data-models-and-mock-data.md. */
export interface Doctor {
  id: string;
  slug: string;
  name: string;
  /** Local neutral placeholder path; no hotlinked assets in the mock phase. */
  photo: string;
  city: string;
  state: string;
  country: string;
  /** Specialty ID (see data/specialties.ts) — relational, not display text. */
  specialization: string;
  qualifications: string[];
  yearsExperience: number | null;
  registration: Registration;
  /** Hospital IDs — must resolve both ways against Hospital.doctorIds. */
  hospitalIds: string[];
  /** Treatment IDs (see data/treatments.ts) — relational, not display text. */
  treatments: string[];
  languages: string[];
  /** Independent ratings — PER is never combined with MER. */
  ratings: { per: RatingSummary; mer: RatingSummary };
  verificationStatus: VerificationStatus;
}

/** Defined in 09-data-models-and-mock-data.md. */
export type FacilityCategory =
  | 'hospital'
  | 'specialty_centre'
  | 'diagnostic_lab'
  | 'rehabilitation'
  | 'wellness'
  | 'medical_tourism';

/** Exactly as specified in 09-data-models-and-mock-data.md. */
export interface Facility {
  id: string;
  slug: string;
  name: string;
  category: FacilityCategory;
  city: string;
  state: string;
  country: string;
  /** Specialty IDs (see data/specialties.ts) — relational, not display text. */
  specialties: string[];
  services: string[];
  verificationStatus: VerificationStatus;
}

/**
 * PROPOSED — pending orchestrator review (document status vocabulary is not defined in
 * the docs; the task brief lists document status as requiring a proposed union).
 */
export type DocumentStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'verified'
  | 'rejected'
  | 'expired';

/** PROPOSED — pending orchestrator review (document taxonomy is not defined in the docs). */
export type HospitalDocumentType =
  | 'registration_certificate'
  | 'accreditation'
  | 'clinical_establishment_license'
  | 'bio_medical_waste_authorization'
  | 'insurance_empanelment'
  | 'other';

/**
 * PROPOSED — pending orchestrator review (entity listed in the 09 doc "Additional
 * entities" but no fields are specified).
 */
export interface HospitalDocument {
  id: string;
  hospitalId: string;
  name: string;
  type: HospitalDocumentType;
  status: DocumentStatus;
  /** Mock file label only — no real upload/storage in the mock phase. */
  fileLabel: string;
  /** ISO date string. */
  uploadedAt: string;
  /** ISO date string, or null while unreviewed. */
  reviewedAt: string | null;
  reviewerNote?: string;
}

/** PROPOSED — pending orchestrator review (credential taxonomy is not defined in the docs). */
export type DoctorCredentialKind =
  | 'medical_degree'
  | 'postgraduate_degree'
  | 'medical_registration'
  | 'fellowship'
  | 'super_specialty'
  | 'other';

/**
 * PROPOSED — pending orchestrator review (entity listed in the 09 doc "Additional
 * entities" but no fields are specified; `status` reuses the defined
 * VerificationStatus vocabulary rather than inventing a new one).
 */
export interface DoctorCredential {
  id: string;
  doctorId: string;
  kind: DoctorCredentialKind;
  title: string;
  issuingAuthority: string;
  issuedYear: number | null;
  status: VerificationStatus;
  /** ISO date string. */
  verifiedAt: string | null;
}
