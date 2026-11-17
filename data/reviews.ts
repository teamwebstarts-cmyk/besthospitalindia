/**
 * FICTIONAL DEMO DATA — not real providers, ratings or outcomes.
 *
 * Review fixtures per implementation/09-data-models-and-mock-data.md ("reviews
 * reference one provider and one patient"). Every providerId and patientId below
 * resolves against data/hospitals.ts / data/doctors.ts / data/portal.ts. All
 * review text, titles and ratings are fictional demo content with no clinical
 * claims or outcome promises. Review.score is the individual review star value —
 * it is NOT a PER/CER/MER RatingSummary.
 */

import type { RatingAssessment, Review } from '@/types';

const reviewList = [
  {
    id: 'rev-001',
    providerType: 'hospital',
    providerId: 'hosp-sunrise-delhi',
    patientId: 'pat-demo-riya',
    rating: 5,
    scaleMax: 5,
    title: 'Smooth admission and caring nurses (demo)',
    body: 'Fictional demo feedback: admission was quick and the nursing team was attentive throughout the stay. Used to exercise the hospital profile review section.',
    status: 'published',
    reviewerVerification: 'verified_patient',
    reply: {
      body: 'Thank you for the demo feedback — this reply exists only to exercise the partner reply UI.',
      repliedAt: '2026-09-18T10:30:00.000Z',
      repliedBy: 'Sunrise demo partner team (fictional)',
    },
    createdAt: '2026-09-10T08:00:00.000Z',
  },
  {
    id: 'rev-002',
    providerType: 'hospital',
    providerId: 'hosp-sunrise-delhi',
    patientId: 'pat-demo-arif',
    rating: 4,
    scaleMax: 5,
    title: 'Good care, busy waiting area (demo)',
    body: 'Fictional demo feedback: clinical care was reassuring but the outpatient waiting area felt crowded at peak hours.',
    status: 'published',
    reviewerVerification: 'email_verified',
    createdAt: '2026-08-22T12:15:00.000Z',
  },
  {
    id: 'rev-003',
    providerType: 'hospital',
    providerId: 'hosp-tranquilvalley-kochi',
    patientId: 'pat-demo-mei',
    rating: 5,
    scaleMax: 5,
    title: 'Excellent international support desk (demo)',
    body: 'Fictional demo feedback: the international desk explained each step of the visit clearly. Travel and accommodation coordination was handled patiently.',
    status: 'published',
    reviewerVerification: 'verified_patient',
    createdAt: '2026-10-04T09:45:00.000Z',
  },
  {
    id: 'rev-004',
    providerType: 'hospital',
    providerId: 'hosp-silverlake-bengaluru',
    patientId: 'pat-demo-arif',
    rating: 3,
    scaleMax: 5,
    title: 'Discharge took longer than expected (demo)',
    body: 'Fictional demo feedback: treatment was fine but the discharge process involved repeated waiting. Submitted to exercise mixed-rating card states.',
    status: 'pending_moderation',
    reviewerVerification: 'email_verified',
    createdAt: '2026-10-11T16:20:00.000Z',
  },
  {
    id: 'rev-005',
    providerType: 'doctor',
    providerId: 'doc-sanjay-pillai',
    patientId: 'pat-demo-mei',
    rating: 5,
    scaleMax: 5,
    title: 'Clear explanations, unhurried consult (demo)',
    body: 'Fictional demo feedback: the consultation felt unhurried and every option was explained plainly.',
    status: 'published',
    reviewerVerification: 'verified_patient',
    createdAt: '2026-09-30T11:05:00.000Z',
  },
  {
    id: 'rev-006',
    providerType: 'doctor',
    providerId: 'doc-aarav-mehta',
    patientId: 'pat-demo-riya',
    rating: 4,
    scaleMax: 5,
    title: 'Confident and reassuring (demo)',
    body: 'Fictional demo feedback: questions were answered patiently and follow-up instructions were written down clearly.',
    status: 'published',
    reviewerVerification: 'verified_patient',
    createdAt: '2026-08-14T14:40:00.000Z',
  },
  {
    id: 'rev-007',
    providerType: 'doctor',
    providerId: 'doc-meera-joshi',
    patientId: 'pat-demo-john',
    rating: 5,
    scaleMax: 5,
    title: 'Great teleconsult experience (demo)',
    body: 'Fictional demo feedback: the video consultation connected on time and the doctor reviewed my reports screen by screen.',
    status: 'published',
    reviewerVerification: 'email_verified',
    createdAt: '2026-10-06T07:30:00.000Z',
  },
  {
    id: 'rev-008',
    providerType: 'doctor',
    providerId: 'doc-vikram-rao',
    patientId: 'pat-demo-arif',
    rating: 2,
    scaleMax: 5,
    title: 'Long wait at the clinic (demo)',
    body: 'Fictional demo feedback: waited well past the appointment time before being seen. Flagged in moderation to exercise the rejected/flagged review states.',
    status: 'rejected',
    reviewerVerification: 'unverified',
    createdAt: '2026-07-19T18:10:00.000Z',
  },
  {
    id: 'rev-009',
    providerType: 'doctor',
    providerId: 'doc-rohan-sharma',
    patientId: 'pat-demo-john',
    rating: 4,
    scaleMax: 5,
    title: 'Thorough neurological exam (demo)',
    body: 'Fictional demo feedback: the examination was methodical and the doctor avoided unnecessary tests.',
    status: 'flagged',
    reviewerVerification: 'email_verified',
    createdAt: '2026-10-13T13:25:00.000Z',
  },
] satisfies readonly Review[];

export const reviews: readonly Review[] = Object.freeze(reviewList);

/** Reviews for one provider (hospital or doctor), preserving fixture order. */
export function reviewsForProvider(providerType: Review['providerType'], providerId: string): readonly Review[] {
  return reviews.filter((r) => r.providerType === providerType && r.providerId === providerId);
}

// ---------------------------------------------------------------------------
// Rating assessments (PROPOSED entity shape; admin /admin/ratings queue +
// rating-methodology governance per FR-016). One assessment references one
// provider, one rating kind and one methodology version (09 relationship rule).
// ---------------------------------------------------------------------------

const assessmentList = [
  {
    id: 'rass-001',
    providerType: 'hospital',
    providerId: 'hosp-sunrise-delhi',
    ratingKind: 'CER',
    methodologyVersion: 'METH-CER-1.1',
    status: 'published',
    sampleSize: 42,
    criteria: [
      { id: 'crit-acc', label: 'Accreditations (demo)', weight: 30, scaleMax: 5, score: 4.0 },
      { id: 'crit-doc', label: 'Professional credentials (demo)', weight: 40, scaleMax: 5, score: 4.5 },
      { id: 'crit-out', label: 'Verified outcomes (demo)', weight: 30, scaleMax: 5, score: 4.0 },
    ],
    evidence: [
      {
        id: 'ev-001',
        label: 'Accreditation record (demo)',
        kind: 'accreditation_record',
        summary: 'Fictional demo accreditation record referenced by the hospital profile.',
        collectedAt: '2026-09-20',
      },
      {
        id: 'ev-002',
        label: 'Clinical audit excerpt (demo)',
        kind: 'clinical_audit',
        summary: 'Fictional demo audit excerpt summarised for assessment review.',
        collectedAt: '2026-09-25',
      },
    ],
    assessedBy: 'Demo reviewer A (fictional)',
    assessedAt: '2026-09-30',
    publishedAt: '2026-09-30',
    notes: 'Demo record backing the published CER on the Sunrise Delhi fixture.',
  },
  {
    id: 'rass-002',
    providerType: 'hospital',
    providerId: 'hosp-sunrise-mumbai',
    ratingKind: 'CER',
    methodologyVersion: 'METH-CER-1.1',
    status: 'in_review',
    sampleSize: null,
    criteria: [
      { id: 'crit-acc', label: 'Accreditations (demo)', weight: 30, scaleMax: 5, score: null },
      { id: 'crit-doc', label: 'Professional credentials (demo)', weight: 40, scaleMax: 5, score: null },
      { id: 'crit-out', label: 'Verified outcomes (demo)', weight: 30, scaleMax: 5, score: null },
    ],
    evidence: [],
    assessedBy: 'Demo reviewer B (fictional)',
    assessedAt: '2026-10-08',
    publishedAt: null,
    notes: 'Demo record behind the pending CER state on the Sunrise Mumbai fixture.',
  },
  {
    id: 'rass-003',
    providerType: 'doctor',
    providerId: 'doc-aarav-mehta',
    ratingKind: 'MER',
    methodologyVersion: 'METH-MER-1.0',
    status: 'published',
    sampleSize: 12,
    criteria: [
      { id: 'crit-qual', label: 'Qualifications (demo)', weight: 40, scaleMax: 5, score: 4.5 },
      { id: 'crit-reg', label: 'Registration checks (demo)', weight: 30, scaleMax: 5, score: 4.0 },
      { id: 'crit-exp', label: 'Experience record (demo)', weight: 30, scaleMax: 5, score: 4.5 },
    ],
    evidence: [
      {
        id: 'ev-003',
        label: 'Credential check summary (demo)',
        kind: 'credential_check',
        summary: 'Fictional demo credential check summary backing the doctor MER.',
        collectedAt: '2026-09-18',
      },
    ],
    assessedBy: 'Demo reviewer A (fictional)',
    assessedAt: '2026-09-20',
    publishedAt: '2026-09-20',
  },
  {
    id: 'rass-004',
    providerType: 'hospital',
    providerId: 'hosp-metropulse-ahmedabad',
    ratingKind: 'CER',
    methodologyVersion: 'METH-CER-1.1',
    status: 'changes_requested',
    sampleSize: null,
    criteria: [{ id: 'crit-acc', label: 'Accreditations (demo)', weight: 30, scaleMax: 5, score: null }],
    evidence: [
      {
        id: 'ev-004',
        label: 'Outcome report draft (demo)',
        kind: 'outcome_report',
        summary: 'Fictional demo draft outcome report returned for changes in review.',
        collectedAt: '2026-08-28',
      },
    ],
    assessedBy: 'Demo reviewer B (fictional)',
    assessedAt: '2026-08-30',
    publishedAt: null,
    notes: 'Demo record behind the rejected CER state on the MetroPulse fixture.',
  },
] satisfies readonly RatingAssessment[];

export const ratingAssessments: readonly RatingAssessment[] = Object.freeze(assessmentList);

/** Assessments for one provider, optionally narrowed to one rating kind. */
export function assessmentsForProvider(
  providerType: RatingAssessment['providerType'],
  providerId: string,
  ratingKind?: RatingAssessment['ratingKind'],
): readonly RatingAssessment[] {
  return ratingAssessments.filter(
    (a) =>
      a.providerType === providerType &&
      a.providerId === providerId &&
      (ratingKind === undefined || a.ratingKind === ratingKind),
  );
}
