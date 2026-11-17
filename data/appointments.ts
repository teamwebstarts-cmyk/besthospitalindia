/**
 * FICTIONAL DEMO DATA — not real providers, ratings or outcomes.
 *
 * Appointment-request fixtures (FR-008 request workflow; PROPOSED
 * AppointmentRequest shape). Every patientId resolves against data/portal.ts;
 * every providerId resolves against data/hospitals.ts / data/doctors.ts. No
 * real booking occurred — these are static demo records.
 */

import type { AppointmentRequest } from '@/types';

const appointmentList = [
  {
    id: 'APT-1A2B',
    patientId: 'pat-demo-riya',
    providerType: 'doctor',
    providerId: 'doc-aarav-mehta',
    treatmentId: 'trt-coronary-angioplasty',
    mode: 'in_person',
    preferredDate: '2026-12-01',
    preferredTimeNote: 'morning preferred (demo)',
    concern: 'Fictional demo reason: cardiology follow-up consult.',
    status: 'scheduled',
    note: 'Demo schedule entry created by the hospital-portal demo user.',
    createdAt: '2026-10-03T09:30:00.000Z',
    updatedAt: '2026-10-04T11:00:00.000Z',
  },
  {
    id: 'APT-3C4D',
    patientId: 'pat-demo-john',
    providerType: 'doctor',
    providerId: 'doc-meera-joshi',
    treatmentId: 'trt-asthma-care',
    mode: 'video',
    preferredDate: '2026-11-28',
    concern: 'Fictional demo reason: breathing-care teleconsultation.',
    status: 'confirmed',
    createdAt: '2026-10-12T06:25:00.000Z',
    updatedAt: '2026-10-12T15:10:00.000Z',
  },
  {
    id: 'APT-5E6F',
    patientId: 'pat-demo-arif',
    providerType: 'hospital',
    providerId: 'hosp-silverlake-bengaluru',
    treatmentId: 'trt-liver-transplant',
    mode: 'in_person',
    preferredDate: '2026-12-20',
    preferredTimeNote: 'afternoon preferred (demo)',
    concern: 'Fictional demo reason: transplant work-up enquiry visit.',
    status: 'under_review',
    createdAt: '2026-10-14T12:00:00.000Z',
    updatedAt: null,
  },
  {
    id: 'APT-7G8H',
    patientId: 'pat-demo-mei',
    providerType: 'hospital',
    providerId: 'hosp-tranquilvalley-kochi',
    treatmentId: 'trt-cataract-surgery',
    mode: 'in_person',
    preferredDate: '2026-12-15',
    concern: 'Fictional demo reason: cataract evaluation during planned travel.',
    status: 'requested',
    createdAt: '2026-10-15T05:45:00.000Z',
    updatedAt: null,
  },
  {
    id: 'APT-9J0K',
    patientId: 'pat-demo-riya',
    providerType: 'doctor',
    providerId: 'doc-isha-kapoor',
    mode: 'phone',
    preferredDate: '2026-11-05',
    concern: 'Fictional demo reason: second-opinion phone consult (demo cancellation case).',
    status: 'cancelled',
    note: 'Cancelled in demo workflow at patient request.',
    createdAt: '2026-10-01T08:10:00.000Z',
    updatedAt: '2026-10-02T09:00:00.000Z',
  },
] satisfies readonly AppointmentRequest[];

export const appointments: readonly AppointmentRequest[] = Object.freeze(appointmentList);

/** Appointments for one patient, newest first. */
export function appointmentsForPatient(patientId: string): readonly AppointmentRequest[] {
  return appointments
    .filter((a) => a.patientId === patientId)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
