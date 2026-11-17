/**
 * Patient & enquiry domain contracts — BestHospitalIndia (A01).
 *
 * PatientEnquiry is exactly as specified in implementation/09-data-models-and-mock-data.md.
 * Patient is listed under "Additional entities" without specified fields — designed
 * minimally for the mock phase and marked PROPOSED below.
 */

/** Defined in 09-data-models-and-mock-data.md. */
export type PatientEnquiryStatus = 'submitted' | 'under_review' | 'assigned' | 'responded' | 'closed';

/** Exactly as specified in 09-data-models-and-mock-data.md. */
export interface PatientEnquiry {
  id: string;
  patientName: string;
  email: string;
  phone: string;
  country: string;
  preferredLanguage: string;
  /** Specialty ID (see data/specialties.ts) — relational, not display text. */
  specialty: string;
  preferredProviderId?: string;
  concern: string;
  reportNames: string[];
  /** ISO date string. */
  preferredDate?: string;
  /** ISO timestamp of consent capture. */
  consentAt: string;
  status: PatientEnquiryStatus;
}

/**
 * PROPOSED — pending orchestrator review (entity listed in the 09 doc "Additional
 * entities" but no fields are specified; minimal mock-phase fields).
 */
export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  city?: string;
  preferredLanguage: string;
  /** ISO date string. */
  dateOfBirth: string | null;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  /** IDs of saved hospitals/doctors. */
  savedProviderIds: string[];
  /** ISO timestamp. */
  createdAt: string;
}
