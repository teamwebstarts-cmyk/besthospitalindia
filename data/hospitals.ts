/**
 * FICTIONAL DEMO DATA — not real providers, ratings or outcomes.
 *
 * Hospital fixtures per implementation/09-data-models-and-mock-data.md.
 * - All names, locations, contacts, accreditations and scores are demo data.
 * - ratings.per and ratings.cer are INDEPENDENT RatingSummary objects — they are never
 *   combined, and `score: null` always pairs with status 'pending' or 'not_assessed'
 *   (or a rejected assessment) — never 0.
 * - specialtyIds reference data/specialties.ts; treatmentIds reference data/treatments.ts;
 *   doctorIds reference data/doctors.ts (two-way consistent).
 */

import type { Hospital, RatingKind, RatingSummary } from '@/types';

/** Typed helper so every fixture rating carries kind + scaleMax correctly. */
function rating(kind: RatingKind) {
  return (input: Omit<RatingSummary, 'kind' | 'scaleMax'>): RatingSummary => ({
    kind,
    scaleMax: 5,
    ...input,
  });
}

const per = rating('PER');
const cer = rating('CER');

/** Shared demo photograph for hospital card / profile media (build). */
const HOSPITAL_DEMO_IMAGE = '/images/hospitals/hospital-exterior-demo.png';

const hospitalList = [
  {
    id: 'hosp-sunrise-delhi',
    slug: 'sunrise-multispeciality-hospital-delhi',
    name: 'Sunrise Multispeciality Hospital, New Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    facilityType: 'Multispeciality hospital',
    overview:
      'Multispeciality hospital in South Delhi offering cardiology, oncology and orthopaedic programmes with structured patient enquiries and appointment requests.',
    specialties: ['spec-cardiology', 'spec-oncology', 'spec-orthopaedics'],
    treatments: ['trt-coronary-angioplasty', 'trt-bypass-surgery', 'trt-chemotherapy', 'trt-knee-replacement'],
    accreditations: [
      { name: 'National Accreditation Board', status: 'verified', validUntil: '2027-03-31' },
      { name: 'Quality Council Listing', status: 'pending' },
    ],
    verificationStatus: 'verified',
    ratings: {
      per: per({
        score: 4.5,
        status: 'published',
        basis: 'patient_feedback',
        sampleSize: 128,
        lastAssessedAt: '2026-10-12',
        methodologyVersion: 'METH-PER-1.2',
        evidenceSummary: 'Batch of 128 patient-feedback surveys.',
      }),
      cer: cer({
        score: 4.2,
        status: 'published',
        basis: 'verified_evidence',
        sampleSize: 42,
        lastAssessedAt: '2026-09-30',
        methodologyVersion: 'METH-CER-1.1',
        evidenceSummary:
          'evidence pack (simulated accreditation record + audit excerpt), 42 data points.',
      }),
    },
    doctorIds: ['doc-aarav-mehta', 'doc-isha-kapoor', 'doc-rohan-sharma'],
    image: HOSPITAL_DEMO_IMAGE,
  },
  {
    id: 'hosp-sunrise-mumbai',
    slug: 'sunrise-multispeciality-hospital-mumbai',
    name: 'Sunrise Multispeciality Hospital, Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    facilityType: 'Multispeciality hospital',
    overview:
      'Sunrise Multispeciality Hospital in Mumbai — maternity, neurology and orthopaedic care with published patient experience ratings and clinical assessments under review where noted.',
    specialties: ['spec-neurology', 'spec-maternity-neonatal', 'spec-orthopaedics'],
    treatments: ['trt-maternity-care', 'trt-stroke-rehab', 'trt-knee-replacement'],
    accreditations: [{ name: 'National Accreditation Board', status: 'verified', validUntil: '2027-08-31' }],
    verificationStatus: 'verified',
    ratings: {
      per: per({
        score: 4.1,
        status: 'published',
        basis: 'patient_feedback',
        sampleSize: 86,
        lastAssessedAt: '2026-08-21',
        methodologyVersion: 'METH-PER-1.2',
        evidenceSummary: 'Batch of 86 patient-feedback surveys.',
      }),
      cer: cer({
        score: null,
        status: 'pending',
        basis: 'verified_evidence',
        sampleSize: null,
        lastAssessedAt: null,
        methodologyVersion: 'METH-CER-1.1',
        evidenceSummary: 'Clinical assessment in progress — no approved score yet.',
      }),
    },
    doctorIds: ['doc-rohan-sharma', 'doc-priya-nair', 'doc-vikram-rao'],
    image: HOSPITAL_DEMO_IMAGE,
  },
  {
    id: 'hosp-azurecoast-chennai',
    slug: 'azurecoast-speciality-hospital-chennai',
    name: 'AzureCoast Speciality Hospital, Chennai',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    facilityType: 'Single-specialty hospital',
    overview:
      'AzureCoast Speciality Hospital in Chennai — nephrology, urology and gastroenterology with ratings published when assessments complete.',
    specialties: ['spec-nephrology-urology', 'spec-gastroenterology'],
    treatments: ['trt-dialysis', 'trt-liver-transplant'],
    accreditations: [{ name: 'Quality Council Listing', status: 'unverified' }],
    verificationStatus: 'pending',
    ratings: {
      per: per({
        score: null,
        status: 'pending',
        basis: 'patient_feedback',
        sampleSize: null,
        lastAssessedAt: null,
        methodologyVersion: 'METH-PER-1.2',
        evidenceSummary: 'Feedback collection underway — no approved score yet.',
      }),
      cer: cer({
        score: null,
        status: 'not_assessed',
        basis: 'verified_evidence',
        sampleSize: null,
        lastAssessedAt: null,
        methodologyVersion: null,
        evidenceSummary: 'No clinical assessment has been scheduled yet.',
      }),
    },
    doctorIds: ['doc-ananya-desai', 'doc-karan-malhotra'],
    image: HOSPITAL_DEMO_IMAGE,
  },
  {
    id: 'hosp-silverlake-bengaluru',
    slug: 'silverlake-medical-city-bengaluru',
    name: 'SilverLake Medical City, Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    facilityType: 'Multispeciality hospital',
    overview:
      'SilverLake Medical City in Bengaluru — cardiology, gastroenterology and pulmonology on a large multispeciality campus.',
    specialties: ['spec-cardiology', 'spec-gastroenterology', 'spec-pulmonology'],
    treatments: ['trt-bypass-surgery', 'trt-liver-transplant', 'trt-asthma-care'],
    accreditations: [
      { name: 'National Accreditation Board', status: 'verified', validUntil: '2027-01-31' },
      { name: 'Radiation Safety Registration', status: 'expired' },
    ],
    verificationStatus: 'verified',
    ratings: {
      per: per({
        score: 3.9,
        status: 'published',
        basis: 'patient_feedback',
        sampleSize: 57,
        lastAssessedAt: '2026-07-15',
        methodologyVersion: 'METH-PER-1.2',
        evidenceSummary: 'Batch of 57 patient-feedback surveys.',
      }),
      cer: cer({
        score: 4.6,
        status: 'review_due',
        basis: 'verified_evidence',
        sampleSize: 38,
        lastAssessedAt: '2026-06-28',
        methodologyVersion: 'METH-CER-1.1',
        evidenceSummary:
          'evidence pack last reviewed 2026-06-28; periodic re-review is due.',
      }),
    },
    doctorIds: ['doc-karan-malhotra', 'doc-meera-joshi'],
    image: HOSPITAL_DEMO_IMAGE,
  },
  {
    id: 'hosp-tranquilvalley-kochi',
    slug: 'tranquilvalley-medical-institute-kochi',
    name: 'TranquilValley Medical Institute, Kochi',
    city: 'Kochi',
    state: 'Kerala',
    country: 'India',
    facilityType: 'Multispeciality hospital',
    overview:
      'TranquilValley Medical Institute in Kochi — maternity, ophthalmology and pulmonary medicine with strong patient experience and clinical expertise ratings.',
    specialties: ['spec-maternity-neonatal', 'spec-ophthalmology', 'spec-pulmonology'],
    treatments: ['trt-maternity-care', 'trt-cataract-surgery', 'trt-asthma-care'],
    accreditations: [
      { name: 'National Accreditation Board', status: 'verified', validUntil: '2028-02-29' },
      { name: 'Green Facility Listing', status: 'verified', validUntil: '2027-12-31' },
    ],
    verificationStatus: 'verified',
    ratings: {
      per: per({
        score: 4.7,
        status: 'published',
        basis: 'patient_feedback',
        sampleSize: 212,
        lastAssessedAt: '2026-10-02',
        methodologyVersion: 'METH-PER-1.2',
        evidenceSummary: 'Batch of 212 patient-feedback surveys.',
      }),
      cer: cer({
        score: 4.8,
        status: 'published',
        basis: 'verified_evidence',
        sampleSize: 96,
        lastAssessedAt: '2026-10-05',
        methodologyVersion: 'METH-CER-1.1',
        evidenceSummary:
          'evidence pack (simulated accreditation + outcome excerpts), 96 data points.',
      }),
    },
    doctorIds: ['doc-priya-nair', 'doc-sanjay-pillai', 'doc-leena-fernandes'],
    image: HOSPITAL_DEMO_IMAGE,
  },
  {
    id: 'hosp-northganga-varanasi',
    slug: 'northganga-charitable-hospital-varanasi',
    name: 'NorthGanga Charitable Hospital, Varanasi',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    country: 'India',
    facilityType: 'Charitable trust hospital',
    overview:
      'NorthGanga Charitable Hospital in Varanasi — orthopaedic and endocrine services with ratings added as assessments complete.',
    specialties: ['spec-orthopaedics', 'spec-endocrinology'],
    treatments: ['trt-knee-replacement'],
    accreditations: [],
    verificationStatus: 'unverified',
    ratings: {
      per: per({
        score: null,
        status: 'not_assessed',
        basis: 'patient_feedback',
        sampleSize: null,
        lastAssessedAt: null,
        methodologyVersion: null,
        evidenceSummary: 'No feedback assessment has been scheduled yet.',
      }),
      cer: cer({
        score: null,
        status: 'not_assessed',
        basis: 'verified_evidence',
        sampleSize: null,
        lastAssessedAt: null,
        methodologyVersion: null,
        evidenceSummary: 'No clinical assessment has been scheduled yet.',
      }),
    },
    doctorIds: ['doc-arjun-khanna', 'doc-nandini-bose'],
    image: HOSPITAL_DEMO_IMAGE,
  },
  {
    id: 'hosp-metropulse-ahmedabad',
    slug: 'metropulse-heart-institute-ahmedabad',
    name: 'MetroPulse Heart Institute, Ahmedabad',
    city: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    facilityType: 'Single-specialty cardiac hospital',
    overview:
      'MetroPulse Heart Institute in Ahmedabad — dedicated cardiac centre for angioplasty and bypass programmes.',
    specialties: ['spec-cardiology'],
    treatments: ['trt-coronary-angioplasty', 'trt-bypass-surgery'],
    accreditations: [{ name: 'National Accreditation Board', status: 'verified', validUntil: '2027-06-30' }],
    verificationStatus: 'verified',
    ratings: {
      per: per({
        score: 4.0,
        status: 'published',
        basis: 'patient_feedback',
        sampleSize: 44,
        lastAssessedAt: '2026-09-18',
        methodologyVersion: 'METH-PER-1.2',
        evidenceSummary: 'Batch of 44 patient-feedback surveys.',
      }),
      cer: cer({
        score: null,
        status: 'not_assessed',
        basis: 'verified_evidence',
        sampleSize: null,
        lastAssessedAt: '2026-08-30',
        methodologyVersion: 'METH-CER-1.1',
        evidenceSummary:
          'Clinical assessment submitted 2026-08-30 returned for changes; no approved score is published yet.',
      }),
    },
    doctorIds: ['doc-aarav-mehta', 'doc-meera-joshi'],
    image: HOSPITAL_DEMO_IMAGE,
  },
  {
    id: 'hosp-goldenpeak-jaipur',
    slug: 'goldenpeak-women-children-hospital-jaipur',
    name: 'GoldenPeak Women & Children Hospital, Jaipur',
    city: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    facilityType: 'Single-specialty hospital',
    overview:
      'GoldenPeak Women & Children Hospital in Jaipur — maternity, orthopaedic and endocrine care for women and children.',
    specialties: ['spec-maternity-neonatal', 'spec-orthopaedics', 'spec-endocrinology'],
    treatments: ['trt-maternity-care', 'trt-knee-replacement'],
    accreditations: [{ name: 'Quality Council Listing', status: 'pending' }],
    verificationStatus: 'pending',
    ratings: {
      per: per({
        score: null,
        status: 'pending',
        basis: 'patient_feedback',
        sampleSize: null,
        lastAssessedAt: null,
        methodologyVersion: 'METH-PER-1.2',
        evidenceSummary: 'Feedback collection underway — no approved score yet.',
      }),
      cer: cer({
        score: 3.7,
        status: 'published',
        basis: 'verified_evidence',
        sampleSize: 25,
        lastAssessedAt: '2026-05-19',
        methodologyVersion: 'METH-CER-1.1',
        evidenceSummary: 'evidence pack (simulated registry excerpt), 25 data points.',
      }),
    },
    doctorIds: ['doc-arjun-khanna', 'doc-nandini-bose'],
    image: HOSPITAL_DEMO_IMAGE,
  },
] satisfies readonly Hospital[];

export const hospitals: readonly Hospital[] = Object.freeze(hospitalList);

/** Fast id → Hospital lookup for selectors and fixtures. */
export const hospitalById: Readonly<Record<string, Hospital>> = Object.freeze(
  Object.fromEntries(hospitals.map((h) => [h.id, h])),
);
