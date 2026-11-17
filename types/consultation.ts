/**
 * Consultation & medical-tourism domain contracts — BestHospitalIndia (A01).
 *
 * MedicalTourismCase is listed under "Additional entities" in
 * implementation/09-data-models-and-mock-data.md without specified fields.
 * FR-009 (01-requirements.md) defines the enquiry scope; the stage/status unions
 * below are PROPOSED.
 */

/** PROPOSED — pending orchestrator review (case stage vocabulary is not defined in the docs). */
export type TourismCaseStage =
  | 'enquiry_received'
  | 'documents_pending'
  | 'proposal_shared'
  | 'travel_planned'
  | 'treatment_ongoing'
  | 'follow_up'
  | 'closed';

/** PROPOSED — pending orchestrator review (assignment vocabulary is not defined in the docs). */
export type TourismCoordinatorAssignment =
  | 'unassigned'
  | 'assigned'
  | 'reassigned'
  | 'handed_over';

/** PROPOSED — pending orchestrator review (free-consultation scope is open product ambiguity D-7). */
export type ConsultationType = 'free_consultation' | 'standard_enquiry' | 'second_opinion';

/**
 * PROPOSED — pending orchestrator review (entity listed in the 09 doc "Additional
 * entities" but no fields are specified; fields follow FR-009 medical tourism
 * enquiry scope plus minimal coordinator-tracking).
 */
export interface MedicalTourismCase {
  id: string;
  /** References PatientEnquiry.id when the case originated from an enquiry. */
  enquiryId: string;
  /** References Patient.id (PROPOSED entity). */
  patientId: string;
  patientName: string;
  country: string;
  /** Specialty ID (see data/specialties.ts). */
  specialty: string;
  /** Treatment ID (see data/treatments.ts). */
  treatmentId?: string;
  type: ConsultationType;
  stage: TourismCaseStage;
  coordinatorAssignment: TourismCoordinatorAssignment;
  /** Demo-only coordinator display name; no real account exists in the mock phase. */
  coordinatorName: string | null;
  /** Provider the case is steered toward; references Hospital.id or null. */
  preferredHospitalId: string | null;
  /** ISO timestamp. */
  createdAt: string;
  /** ISO timestamp, or null while no follow-up is scheduled. */
  followUpAt: string | null;
}
