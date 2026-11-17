/**
 * Appointment domain contracts — BestHospitalIndia (A01).
 *
 * AppointmentRequest is listed under "Additional entities" in
 * implementation/09-data-models-and-mock-data.md without specified fields. FR-008
 * (01-requirements.md) frames appointments as a request workflow — no live slot
 * integration — so the status union below is PROPOSED.
 */

/** PROPOSED — pending orchestrator review (appointment status vocabulary is not defined in the docs). */
export type AppointmentStatus =
  | 'requested'
  | 'under_review'
  | 'scheduled'
  | 'confirmed'
  | 'cancelled'
  | 'completed';

/** PROPOSED — pending orchestrator review (consultation mode is not defined in the docs). */
export type ConsultationMode = 'in_person' | 'video' | 'phone';

/**
 * PROPOSED — pending orchestrator review (entity listed in the 09 doc "Additional
 * entities" but no fields are specified; fields follow FR-008 "request against a
 * provider" semantics).
 */
export interface AppointmentRequest {
  id: string;
  /** References Patient.id (PROPOSED entity). */
  patientId: string;
  providerType: ProviderRefType;
  providerId: string;
  /** Treatment ID (see data/treatments.ts); optional for general consultation. */
  treatmentId?: string;
  mode: ConsultationMode;
  /** ISO date string. */
  preferredDate: string;
  /** Patient-entered free-text preference, e.g. "morning". */
  preferredTimeNote?: string;
  concern: string;
  status: AppointmentStatus;
  /** Demo-only admin/partner note; never a real scheduling confirmation. */
  note?: string;
  /** ISO timestamp. */
  createdAt: string;
  /** ISO timestamp, or null while the request is untouched. */
  updatedAt: string | null;
}

// Type-only import placed at the bottom per repo convention established in this module set;
// fully erased at runtime.
import type { ProviderRefType } from './provider';
