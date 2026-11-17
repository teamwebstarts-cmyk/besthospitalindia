/**
 * FICTIONAL DEMO DATA — not real providers, ratings or outcomes.
 *
 * Hospital fixtures per implementation/09-data-models-and-mock-data.md.
 * - All names, locations, contacts, accreditations and scores are fictional demo data.
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
      'Fictional demo multispeciality hospital serving the demo South Delhi catchment. Profile exists to exercise listing, profile, comparison and enquiry flows.',
    specialties: ['spec-cardiology', 'spec-oncology', 'spec-orthopaedics'],
    treatments: ['trt-coronary-angioplasty', 'trt-bypass-surgery', 'trt-chemotherapy', 'trt-knee-replacement'],
    accreditations: [
      { name: 'Demo National Accreditation Board (fictional)', status: 'verified', validUntil: '2027-03-31' },
      { name: 'Demo Quality Council Listing (fictional)', status: 'pending' },
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
        evidenceSummary: 'Demo metadata: simulated batch of 128 fictional patient-feedback surveys.',
      }),
      cer: cer({
        score: 4.2,
        status: 'published',
        basis: 'verified_evidence',
        sampleSize: 42,
        lastAssessedAt: '2026-09-30',
        methodologyVersion: 'METH-CER-1.1',
        evidenceSummary:
          'Demo metadata: fictional evidence pack (simulated accreditation record + audit excerpt), 42 data points.',
      }),
    },
    doctorIds: ['doc-aarav-mehta', 'doc-isha-kapoor', 'doc-rohan-sharma'],
    image: '/images/hospitals/sunrise-multispeciality-delhi.svg',
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
      'Fictional demo sister unit of the Sunrise demo chain. Exercises profile states where the experience rating exists but the clinical assessment is still pending.',
    specialties: ['spec-neurology', 'spec-maternity-neonatal', 'spec-orthopaedics'],
    treatments: ['trt-maternity-care', 'trt-stroke-rehab', 'trt-knee-replacement'],
    accreditations: [{ name: 'Demo National Accreditation Board (fictional)', status: 'verified', validUntil: '2027-08-31' }],
    verificationStatus: 'verified',
    ratings: {
      per: per({
        score: 4.1,
        status: 'published',
        basis: 'patient_feedback',
        sampleSize: 86,
        lastAssessedAt: '2026-08-21',
        methodologyVersion: 'METH-PER-1.2',
        evidenceSummary: 'Demo metadata: simulated batch of 86 fictional patient-feedback surveys.',
      }),
      cer: cer({
        score: null,
        status: 'pending',
        basis: 'verified_evidence',
        sampleSize: null,
        lastAssessedAt: null,
        methodologyVersion: 'METH-CER-1.1',
        evidenceSummary: 'Clinical assessment in progress in the demo workflow — no approved score yet.',
      }),
    },
    doctorIds: ['doc-rohan-sharma', 'doc-priya-nair', 'doc-vikram-rao'],
    image: '/images/hospitals/sunrise-multispeciality-mumbai.svg',
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
      'Fictional demo kidney and transplant-focused unit. Demonstrates the "assessment pending / not yet rated" states on both rating kinds.',
    specialties: ['spec-nephrology-urology', 'spec-gastroenterology'],
    treatments: ['trt-dialysis', 'trt-liver-transplant'],
    accreditations: [{ name: 'Demo Quality Council Listing (fictional)', status: 'unverified' }],
    verificationStatus: 'pending',
    ratings: {
      per: per({
        score: null,
        status: 'pending',
        basis: 'patient_feedback',
        sampleSize: null,
        lastAssessedAt: null,
        methodologyVersion: 'METH-PER-1.2',
        evidenceSummary: 'Feedback collection underway in the demo workflow — no approved score yet.',
      }),
      cer: cer({
        score: null,
        status: 'not_assessed',
        basis: 'verified_evidence',
        sampleSize: null,
        lastAssessedAt: null,
        methodologyVersion: null,
        evidenceSummary: 'No clinical assessment has been scheduled in the demo workflow yet.',
      }),
    },
    doctorIds: ['doc-ananya-desai', 'doc-karan-malhotra'],
    image: '/images/hospitals/azurecoast-speciality-chennai.svg',
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
      'Fictional demo large campus provider. Exercises the "review due" clinical-assessment state alongside a published experience rating.',
    specialties: ['spec-cardiology', 'spec-gastroenterology', 'spec-pulmonology'],
    treatments: ['trt-bypass-surgery', 'trt-liver-transplant', 'trt-asthma-care'],
    accreditations: [
      { name: 'Demo National Accreditation Board (fictional)', status: 'verified', validUntil: '2027-01-31' },
      { name: 'Demo Radiation Safety Registration (fictional)', status: 'expired' },
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
        evidenceSummary: 'Demo metadata: simulated batch of 57 fictional patient-feedback surveys.',
      }),
      cer: cer({
        score: 4.6,
        status: 'review_due',
        basis: 'verified_evidence',
        sampleSize: 38,
        lastAssessedAt: '2026-06-28',
        methodologyVersion: 'METH-CER-1.1',
        evidenceSummary:
          'Demo metadata: fictional evidence pack last reviewed 2026-06-28; periodic re-review is due.',
      }),
    },
    doctorIds: ['doc-karan-malhotra', 'doc-meera-joshi'],
    image: '/images/hospitals/silverlake-medical-city-bengaluru.svg',
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
      'Fictional demo institute used for the strongest demo rating pair and international-patient demo journeys. All values are fictional.',
    specialties: ['spec-maternity-neonatal', 'spec-ophthalmology', 'spec-pulmonology'],
    treatments: ['trt-maternity-care', 'trt-cataract-surgery', 'trt-asthma-care'],
    accreditations: [
      { name: 'Demo National Accreditation Board (fictional)', status: 'verified', validUntil: '2028-02-29' },
      { name: 'Demo Green Facility Listing (fictional)', status: 'verified', validUntil: '2027-12-31' },
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
        evidenceSummary: 'Demo metadata: simulated batch of 212 fictional patient-feedback surveys.',
      }),
      cer: cer({
        score: 4.8,
        status: 'published',
        basis: 'verified_evidence',
        sampleSize: 96,
        lastAssessedAt: '2026-10-05',
        methodologyVersion: 'METH-CER-1.1',
        evidenceSummary:
          'Demo metadata: fictional evidence pack (simulated accreditation + outcome excerpts), 96 data points.',
      }),
    },
    doctorIds: ['doc-priya-nair', 'doc-sanjay-pillai', 'doc-leena-fernandes'],
    image: '/images/hospitals/tranquilvalley-institute-kochi.svg',
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
      'Fictional demo trust hospital. Deliberately unrated on both kinds to exercise "Not yet rated" empty states end to end.',
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
        evidenceSummary: 'No feedback assessment has been scheduled in the demo workflow yet.',
      }),
      cer: cer({
        score: null,
        status: 'not_assessed',
        basis: 'verified_evidence',
        sampleSize: null,
        lastAssessedAt: null,
        methodologyVersion: null,
        evidenceSummary: 'No clinical assessment has been scheduled in the demo workflow yet.',
      }),
    },
    doctorIds: ['doc-arjun-khanna', 'doc-nandini-bose'],
    image: '/images/hospitals/northganga-charitable-varanasi.svg',
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
      'Fictional demo cardiac unit. Exercises a published experience rating beside a rejected clinical assessment (no approved score — never shown as 0).',
    specialties: ['spec-cardiology'],
    treatments: ['trt-coronary-angioplasty', 'trt-bypass-surgery'],
    accreditations: [{ name: 'Demo National Accreditation Board (fictional)', status: 'verified', validUntil: '2027-06-30' }],
    verificationStatus: 'verified',
    ratings: {
      per: per({
        score: 4.0,
        status: 'published',
        basis: 'patient_feedback',
        sampleSize: 44,
        lastAssessedAt: '2026-09-18',
        methodologyVersion: 'METH-PER-1.2',
        evidenceSummary: 'Demo metadata: simulated batch of 44 fictional patient-feedback surveys.',
      }),
      cer: cer({
        score: null,
        status: 'not_assessed',
        basis: 'verified_evidence',
        sampleSize: null,
        lastAssessedAt: '2026-08-30',
        methodologyVersion: 'METH-CER-1.1',
        evidenceSummary:
          'Demo metadata: a clinical assessment was submitted 2026-08-30 and returned for changes in the demo review workflow; no approved score exists, so the status is not_assessed.',
      }),
    },
    doctorIds: ['doc-aarav-mehta', 'doc-meera-joshi'],
    image: '/images/hospitals/metropulse-heart-ahmedabad.svg',
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
      'Fictional demo women-and-children unit. Mixes a pending experience assessment with a published clinical score to exercise both card layouts.',
    specialties: ['spec-maternity-neonatal', 'spec-orthopaedics', 'spec-endocrinology'],
    treatments: ['trt-maternity-care', 'trt-knee-replacement'],
    accreditations: [{ name: 'Demo Quality Council Listing (fictional)', status: 'pending' }],
    verificationStatus: 'pending',
    ratings: {
      per: per({
        score: null,
        status: 'pending',
        basis: 'patient_feedback',
        sampleSize: null,
        lastAssessedAt: null,
        methodologyVersion: 'METH-PER-1.2',
        evidenceSummary: 'Feedback collection underway in the demo workflow — no approved score yet.',
      }),
      cer: cer({
        score: 3.7,
        status: 'published',
        basis: 'verified_evidence',
        sampleSize: 25,
        lastAssessedAt: '2026-05-19',
        methodologyVersion: 'METH-CER-1.1',
        evidenceSummary: 'Demo metadata: fictional evidence pack (simulated registry excerpt), 25 data points.',
      }),
    },
    doctorIds: ['doc-arjun-khanna', 'doc-nandini-bose'],
    image: '/images/hospitals/goldenpeak-women-children-jaipur.svg',
  },
] satisfies readonly Hospital[];

export const hospitals: readonly Hospital[] = Object.freeze(hospitalList);

/** Fast id → Hospital lookup for selectors and fixtures. */
export const hospitalById: Readonly<Record<string, Hospital>> = Object.freeze(
  Object.fromEntries(hospitals.map((h) => [h.id, h])),
);
