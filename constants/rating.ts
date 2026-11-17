/**
 * Rating presentation constants — BestHospitalIndia (A01).
 *
 * Semantics from implementation/00-project-analysis.md: PER/CER/MER are
 * independent ratings, never combined; missing scores display as
 * "Not yet rated" / "Assessment pending", never 0/5.
 */

/** Canonical display labels for the three rating kinds. */
export const RATING_LABELS = {
  PER: 'Patient Experience Rating',
  CER: 'Clinical Expertise Rating',
  MER: 'Medical Expertise Rating',
} as const;

/** Maximum rating scale used across all rating kinds. */
export const RATING_SCALE_MAX = 5;

/** Display copy for any rating whose score is null (never show 0/5). */
export const NOT_RATED_MESSAGE = 'Not yet rated';

/** Alternate display copy while an assessment is in flight. */
export const ASSESSMENT_PENDING_MESSAGE = 'Assessment pending';
