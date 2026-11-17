/**
 * Rating domain contracts — BestHospitalIndia (A01 data contracts).
 *
 * Source of truth:
 * - implementation/09-data-models-and-mock-data.md (core shapes)
 * - implementation/00-project-analysis.md (PER / CER / MER semantics)
 * - audit/IMPLEMENTATION-GAPS.md §4 D-6/D-7 (PROPOSED-enum policy)
 *
 * Core rule every consumer must respect:
 * - PER (patient experience) is NEVER combined with CER/MER into a composite score.
 * - `score: null` means "no approved score exists"; UI must show "Not yet rated" /
 *   "Assessment pending" — never 0/5.
 */

export type RatingKind = 'PER' | 'CER' | 'MER';

/** Defined in 09-data-models-and-mock-data.md. */
export type RatingStatus = 'not_assessed' | 'pending' | 'published' | 'review_due';

/** Defined in 09-data-models-and-mock-data.md. */
export type RatingBasis = 'patient_feedback' | 'verified_evidence';

/** Exactly as specified in 09-data-models-and-mock-data.md. */
export interface RatingSummary {
  kind: RatingKind;
  /** null when no approved score exists — never 0. */
  score: number | null;
  scaleMax: 5;
  status: RatingStatus;
  basis: RatingBasis;
  /** Review/sample count backing the score, or null. */
  sampleSize: number | null;
  /** ISO date string, or null when never assessed. */
  lastAssessedAt: string | null;
  methodologyVersion: string | null;
  evidenceSummary: string;
}

/**
 * Rating pair container shared by hospital records (per + cer) and doctor
 * records (per + mer). Named shared contract in 12-dependency-map.md
 * ("RatingSummary and RatingPair must be frozen before hospital/doctor pages").
 */
export interface RatingPair {
  per: RatingSummary;
  cer?: RatingSummary;
  mer?: RatingSummary;
}

/** PROPOSED — pending orchestrator review (assessment lifecycle is not defined in the docs). */
export type RatingAssessmentStatus =
  | 'draft'
  | 'in_review'
  | 'changes_requested'
  | 'approved'
  | 'published';

/** PROPOSED — pending orchestrator review (evidence taxonomy is not defined in the docs). */
export type RatingEvidenceKind =
  | 'patient_feedback_sample'
  | 'clinical_audit'
  | 'accreditation_record'
  | 'credential_check'
  | 'outcome_report'
  | 'other';

/**
 * PROPOSED — pending orchestrator review (criteria schema is not specified in the 09 doc;
 * governance is an open product ambiguity, audit/IMPLEMENTATION-GAPS.md §4 D-7).
 */
export interface RatingCriterion {
  id: string;
  label: string;
  /** Relative weight as a percentage (0–100). Demo metadata only. */
  weight: number;
  /** null when the criterion is not yet scored — never 0 for "missing". */
  score: number | null;
  scaleMax: 5;
  notes?: string;
}

/** PROPOSED — pending orchestrator review (evidence record shape is not specified in the 09 doc). */
export interface RatingEvidence {
  id: string;
  label: string;
  kind: RatingEvidenceKind;
  summary: string;
  /** Demo-only reference label; never a real document URL in the mock phase. */
  referenceLabel?: string;
  /** ISO date string. */
  collectedAt: string;
}

/**
 * PROPOSED — pending orchestrator review (assessment record shape is not specified in the
 * 09 doc; relationship direction follows 09: one provider, one rating kind, one
 * methodology version).
 */
export interface RatingAssessment {
  id: string;
  providerType: ProviderRefType;
  providerId: string;
  ratingKind: RatingKind;
  methodologyVersion: string;
  status: RatingAssessmentStatus;
  sampleSize: number | null;
  criteria: RatingCriterion[];
  evidence: RatingEvidence[];
  assessedBy: string;
  /** ISO date string. */
  assessedAt: string;
  /** ISO date string, or null while unpublished. */
  publishedAt: string | null;
  notes?: string;
}

// NOTE: ProviderRefType is imported type-only from './provider'; the module cycle
// below is type-only and fully erased at runtime (no runtime import exists).
import type { ProviderRefType } from './provider';
