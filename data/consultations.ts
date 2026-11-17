/**
 * FICTIONAL DEMO DATA — not real providers, ratings or outcomes.
 *
 * IUF consultation / medical-tourism case fixtures (FR-009, FR-019; PROPOSED
 * MedicalTourismCase shape). Every enquiryId/patientId/hospitalId below resolves
 * against data/portal.ts and data/hospitals.ts. No real coordination, travel
 * booking or treatment arrangement exists — demo metadata only.
 */

import type { MedicalTourismCase } from '@/types';

const tourismCaseList = [
  {
    id: 'MTC-1001',
    enquiryId: 'ENQ-9T1M',
    patientId: 'pat-demo-mei',
    patientName: 'Mei Ling (demo)',
    country: 'Singapore',
    specialty: 'spec-ophthalmology',
    treatmentId: 'trt-cataract-surgery',
    type: 'free_consultation',
    stage: 'travel_planned',
    coordinatorAssignment: 'assigned',
    coordinatorName: 'Demo coordinator A (fictional)',
    preferredHospitalId: 'hosp-tranquilvalley-kochi',
    createdAt: '2026-10-06T05:00:00.000Z',
    followUpAt: '2026-11-25T09:00:00.000Z',
  },
  {
    id: 'MTC-1002',
    enquiryId: 'ENQ-2N6P',
    patientId: 'pat-demo-john',
    patientName: 'John Mathew (demo)',
    country: 'United Arab Emirates',
    specialty: 'spec-pulmonology',
    treatmentId: 'trt-asthma-care',
    type: 'second_opinion',
    stage: 'documents_pending',
    coordinatorAssignment: 'unassigned',
    coordinatorName: null,
    preferredHospitalId: 'hosp-silverlake-bengaluru',
    createdAt: '2026-10-12T06:30:00.000Z',
    followUpAt: null,
  },
  {
    id: 'MTC-1003',
    enquiryId: 'ENQ-5Q3L',
    patientId: 'pat-demo-riya',
    patientName: 'Riya Sharma (demo)',
    country: 'India',
    specialty: 'spec-maternity-neonatal',
    treatmentId: 'trt-maternity-care',
    type: 'standard_enquiry',
    stage: 'closed',
    coordinatorAssignment: 'handed_over',
    coordinatorName: 'Demo coordinator B (fictional)',
    preferredHospitalId: null,
    createdAt: '2026-09-21T10:05:00.000Z',
    followUpAt: null,
  },
] satisfies readonly MedicalTourismCase[];

export const tourismCases: readonly MedicalTourismCase[] = Object.freeze(tourismCaseList);

/** Tourism cases for one patient, newest first. */
export function tourismCasesForPatient(patientId: string): readonly MedicalTourismCase[] {
  return tourismCases
    .filter((c) => c.patientId === patientId)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
