/**
 * FICTIONAL DEMO DATA — not real providers, ratings or outcomes.
 *
 * Portal record fixtures per implementation/09-data-models-and-mock-data.md
 * ("representative portal records") and FR-007/FR-010/FR-017: patients, patient
 * enquiries, partner users and notifications. All names, emails (+example.com)
 * and phone numbers are fake demo values. Appointment requests live in
 * data/appointments.ts; tourism cases live in data/consultations.ts. No
 * submission, booking, storage or notification has actually occurred — static
 * display fixtures only.
 */

import type {
  Notification,
  Patient,
  PartnerUser,
  PatientEnquiry,
} from '@/types';

// ---------------------------------------------------------------------------
// Patients (PROPOSED entity shape)
// ---------------------------------------------------------------------------

const patientList = [
  {
    id: 'pat-demo-riya',
    name: 'Riya Sharma (demo)',
    email: 'riya.demo@example.com',
    phone: '+91 90000 00001',
    country: 'India',
    city: 'New Delhi',
    preferredLanguage: 'English',
    dateOfBirth: '1992-04-18',
    gender: 'female',
    savedProviderIds: ['hosp-sunrise-delhi', 'doc-sanjay-pillai'],
    createdAt: '2026-06-02T09:00:00.000Z',
  },
  {
    id: 'pat-demo-arif',
    name: 'Arif Khan (demo)',
    email: 'arif.demo@example.com',
    phone: '+91 90000 00002',
    country: 'India',
    city: 'Lucknow',
    preferredLanguage: 'Hindi',
    dateOfBirth: '1985-11-02',
    gender: 'male',
    savedProviderIds: ['hosp-silverlake-bengaluru'],
    createdAt: '2026-06-15T10:30:00.000Z',
  },
  {
    id: 'pat-demo-mei',
    name: 'Mei Ling (demo)',
    email: 'mei.demo@example.com',
    phone: '+65 9000 0003',
    country: 'Singapore',
    preferredLanguage: 'English',
    dateOfBirth: '1978-02-27',
    gender: 'female',
    savedProviderIds: ['hosp-tranquilvalley-kochi', 'tour-healingbridge-kochi'],
    createdAt: '2026-07-01T06:45:00.000Z',
  },
  {
    id: 'pat-demo-john',
    name: 'John Mathew (demo)',
    email: 'john.demo@example.com',
    phone: '+971 50 000 0004',
    country: 'United Arab Emirates',
    preferredLanguage: 'English',
    dateOfBirth: '1969-09-12',
    gender: 'male',
    savedProviderIds: ['doc-meera-joshi'],
    createdAt: '2026-07-20T05:15:00.000Z',
  },
] satisfies readonly Patient[];

// ---------------------------------------------------------------------------
// Patient enquiries (contract shape from the 09 doc)
// ---------------------------------------------------------------------------

const enquiryList = [
  {
    id: 'ENQ-4F2K',
    patientName: 'Riya Sharma (demo)',
    email: 'riya.demo@example.com',
    phone: '+91 90000 00001',
    country: 'India',
    preferredLanguage: 'English',
    specialty: 'spec-cardiology',
    preferredProviderId: 'hosp-sunrise-delhi',
    concern: 'Fictional demo concern: second opinion about a heart check-up plan.',
    reportNames: ['demo-echo-report-jun.pdf', 'demo-prescription.pdf'],
    preferredDate: '2026-12-01',
    consentAt: '2026-10-02T08:12:00.000Z',
    status: 'responded',
  },
  {
    id: 'ENQ-9T1M',
    patientName: 'Mei Ling (demo)',
    email: 'mei.demo@example.com',
    phone: '+65 9000 0003',
    country: 'Singapore',
    preferredLanguage: 'English',
    specialty: 'spec-ophthalmology',
    preferredProviderId: 'hosp-tranquilvalley-kochi',
    concern: 'Fictional demo concern: cataract evaluation and travel planning request.',
    reportNames: ['demo-eye-report.pdf'],
    preferredDate: '2026-12-15',
    consentAt: '2026-10-05T04:40:00.000Z',
    status: 'assigned',
  },
  {
    id: 'ENQ-7C8D',
    patientName: 'Arif Khan (demo)',
    email: 'arif.demo@example.com',
    phone: '+91 90000 00002',
    country: 'India',
    preferredLanguage: 'Hindi',
    specialty: 'spec-orthopaedics',
    concern: 'Fictional demo concern: knee pain affecting daily walking.',
    reportNames: [],
    consentAt: '2026-10-09T13:05:00.000Z',
    status: 'under_review',
  },
  {
    id: 'ENQ-2N6P',
    patientName: 'John Mathew (demo)',
    email: 'john.demo@example.com',
    phone: '+971 50 000 0004',
    country: 'United Arab Emirates',
    preferredLanguage: 'English',
    specialty: 'spec-pulmonology',
    preferredProviderId: 'doc-meera-joshi',
    concern: 'Fictional demo concern: breathing-care consultation while visiting Bengaluru.',
    reportNames: ['demo-spirometry.pdf'],
    preferredDate: '2026-11-28',
    consentAt: '2026-10-12T06:20:00.000Z',
    status: 'submitted',
  },
  {
    id: 'ENQ-5Q3L',
    patientName: 'Riya Sharma (demo)',
    email: 'riya.demo@example.com',
    phone: '+91 90000 00001',
    country: 'India',
    preferredLanguage: 'English',
    specialty: 'spec-maternity-neonatal',
    preferredProviderId: 'hosp-tranquilvalley-kochi',
    concern: 'Fictional demo concern: maternity care package comparison request.',
    reportNames: [],
    preferredDate: '2027-01-10',
    consentAt: '2026-09-20T10:00:00.000Z',
    status: 'closed',
  },
] satisfies readonly PatientEnquiry[];

// ---------------------------------------------------------------------------
// Partner users (PROPOSED shape; portal-team demo records)
// ---------------------------------------------------------------------------

const partnerUserList = [
  {
    id: 'pu-sunrise-owner',
    name: 'Demo Owner, Sunrise chain (fictional)',
    email: 'owner.demo@example.com',
    role: 'owner',
    hospitalId: 'hosp-sunrise-delhi',
    mockLoginHint: 'demo sign-in: hospital partner (owner)',
    createdAt: '2026-05-11T08:00:00.000Z',
  },
  {
    id: 'pu-sunrise-staff',
    name: 'Demo Staff, Sunrise Mumbai (fictional)',
    email: 'staff.demo@example.com',
    role: 'staff',
    hospitalId: 'hosp-sunrise-mumbai',
    mockLoginHint: 'demo sign-in: hospital partner (staff)',
    createdAt: '2026-05-18T08:00:00.000Z',
  },
  {
    id: 'pu-doctor-coordinator',
    name: 'Demo Coordinator, doctor desk (fictional)',
    email: 'doctor.desk.demo@example.com',
    role: 'coordinator',
    hospitalId: null,
    mockLoginHint: 'demo sign-in: doctor partner',
    createdAt: '2026-05-25T08:00:00.000Z',
  },
] satisfies readonly PartnerUser[];

// ---------------------------------------------------------------------------
// Notifications (PROPOSED shape; FR-017 — local mock states only)
// ---------------------------------------------------------------------------

const notificationList = [
  {
    id: 'ntf-001',
    audience: 'patient',
    recipientId: 'pat-demo-riya',
    category: 'appointment',
    title: 'Appointment scheduled (demo)',
    body: 'Demo notification: your cardiology follow-up request was scheduled. No real appointment was booked.',
    status: 'unread',
    createdAt: '2026-10-04T11:00:00.000Z',
    readAt: null,
    linkHref: '/patient/appointments',
  },
  {
    id: 'ntf-002',
    audience: 'patient',
    recipientId: 'pat-demo-mei',
    category: 'enquiry',
    title: 'Enquiry assigned (demo)',
    body: 'Demo notification: your ophthalmology enquiry was assigned to the demo coordination desk.',
    status: 'unread',
    createdAt: '2026-10-07T07:20:00.000Z',
    readAt: null,
    linkHref: '/patient/enquiries',
  },
  {
    id: 'ntf-003',
    audience: 'hospital_partner',
    recipientId: 'pu-sunrise-owner',
    category: 'review',
    title: 'New review awaiting reply (demo)',
    body: 'Demo notification: a new published review mentions your hospital profile.',
    status: 'read',
    createdAt: '2026-09-11T09:00:00.000Z',
    readAt: '2026-09-11T18:30:00.000Z',
    linkHref: '/hospital-portal/reviews',
  },
  {
    id: 'ntf-004',
    audience: 'hospital_partner',
    recipientId: 'pu-sunrise-owner',
    category: 'verification',
    title: 'Accreditation expiring (demo)',
    body: 'Demo notification: a demo accreditation record is shown as expiring in your documents list.',
    status: 'dismissed',
    createdAt: '2026-08-28T10:00:00.000Z',
    readAt: '2026-08-29T08:00:00.000Z',
    linkHref: '/hospital-portal/documents',
  },
  {
    id: 'ntf-005',
    audience: 'admin',
    recipientId: null,
    category: 'rating',
    title: 'Rating assessment ready for approval (demo)',
    body: 'Demo notification: one clinical rating assessment is ready for approval in the admin queue.',
    status: 'unread',
    createdAt: '2026-10-10T08:30:00.000Z',
    readAt: null,
    linkHref: '/admin/ratings',
  },
  {
    id: 'ntf-006',
    audience: 'doctor_partner',
    recipientId: 'pu-doctor-coordinator',
    category: 'system',
    title: 'Methodology update (demo)',
    body: 'Demo notification: a methodology version was published in the demo environment.',
    status: 'read',
    createdAt: '2026-09-30T12:00:00.000Z',
    readAt: '2026-10-01T07:45:00.000Z',
  },
] satisfies readonly Notification[];

export const patients: readonly Patient[] = Object.freeze(patientList);
export const patientEnquiries: readonly PatientEnquiry[] = Object.freeze(enquiryList);
export const partnerUsers: readonly PartnerUser[] = Object.freeze(partnerUserList);
export const notifications: readonly Notification[] = Object.freeze(notificationList);

export const patientById: Readonly<Record<string, Patient>> = Object.freeze(
  Object.fromEntries(patients.map((p) => [p.id, p])),
);
