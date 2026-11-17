/**
 * MOCK ONLY — no real submission, storage, booking or notification occurs.
 *
 * Simulated local "action" helpers for demo forms — BestHospitalIndia (A01).
 * Each helper validates with lib/validation, waits 300–600 ms (simulated
 * latency), then resolves with a typed result union. Nothing is persisted or
 * transmitted anywhere; callers must label all confirmations as demo outcomes.
 */

import {
  consentTrue,
  dateNotInPast,
  email,
  maxLength,
  minLength,
  phone,
  required,
  validate,
  type FieldValidator,
  type FieldValues,
  type ValidationErrors,
} from '@/lib/validation';

/** Simulated network latency bounds (ms), per task contract. */
const LATENCY_MIN_MS = 300;
const LATENCY_MAX_MS = 600;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Random integer in [min, max]. Demo-only jitter; never used for IDs. */
function randomLatency(): number {
  return LATENCY_MIN_MS + Math.floor(Math.random() * (LATENCY_MAX_MS - LATENCY_MIN_MS + 1));
}

/** Uppercase base-36 demo reference suffix (NOT a real ID). */
function demoReference(prefix: string): string {
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${suffix}`;
}

/** Validation failure shape shared by all actions. */
export interface MockActionFailure {
  ok: false;
  errors: ValidationErrors;
}

// ---------------------------------------------------------------------------
// submitEnquiry — FR-007 free consultation / general enquiry
// ---------------------------------------------------------------------------

export interface SubmitEnquiryPayload {
  patientName: string;
  email: string;
  phone: string;
  country: string;
  preferredLanguage: string;
  /** Specialty id (see data/specialties.ts). */
  specialty: string;
  concern: string;
  consent: boolean;
  /** Provider id, when the patient expressed a preference. */
  preferredProviderId?: string;
  /** ISO date string, when the patient expressed a preference. */
  preferredDate?: string;
  /** Demo-only file labels; nothing is uploaded anywhere. */
  reportNames?: string[];
}

export interface SubmitEnquirySuccess {
  ok: true;
  /** Demo reference in the ENQ-XXXX shape (mock only, not stored). */
  reference: string;
}

function enquirySchema(): Record<string, FieldValidator[]> {
  return {
    patientName: [required('Full name'), minLength(2), maxLength(120)],
    email: [required('Email'), email()],
    phone: [required('Phone'), phone()],
    country: [required('Country')],
    preferredLanguage: [required('Preferred language')],
    specialty: [required('Specialty')],
    concern: [required('Concern'), minLength(10), maxLength(2000)],
    consent: [consentTrue()],
  };
}

export async function submitEnquiry(payload: SubmitEnquiryPayload): Promise<SubmitEnquirySuccess | MockActionFailure> {
  const errors = validate(enquirySchema(), payload as unknown as FieldValues);
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  await delay(randomLatency());
  return { ok: true, reference: demoReference('ENQ') };
}

// ---------------------------------------------------------------------------
// requestAppointment — FR-008 request workflow (no live slots)
// ---------------------------------------------------------------------------

export interface RequestAppointmentPayload {
  providerType: 'hospital' | 'doctor';
  providerId: string;
  patientName: string;
  email: string;
  phone: string;
  /** ISO date string. */
  preferredDate: string;
  concern: string;
  consent: boolean;
  /** Demo consultation mode; defaults to in_person. */
  mode?: 'in_person' | 'video' | 'phone';
  treatmentId?: string;
}

export interface RequestAppointmentSuccess {
  ok: true;
  /** Demo reference in the APT-XXXX shape (mock only, not stored). */
  reference: string;
}

export async function requestAppointment(
  payload: RequestAppointmentPayload,
): Promise<RequestAppointmentSuccess | MockActionFailure> {
  const errors = validate(
    {
      providerId: [required('Provider')],
      patientName: [required('Full name'), minLength(2), maxLength(120)],
      email: [required('Email'), email()],
      phone: [required('Phone'), phone()],
      preferredDate: [required('Preferred date'), dateNotInPast()],
      concern: [required('Reason for visit'), minLength(10), maxLength(2000)],
      consent: [consentTrue()],
    } satisfies Record<string, FieldValidator[]>,
    payload as unknown as FieldValues,
  );
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  await delay(randomLatency());
  return { ok: true, reference: demoReference('APT') };
}

// ---------------------------------------------------------------------------
// submitReview — FR-015 posture (demo submission; moderation is mock state)
// ---------------------------------------------------------------------------

export interface SubmitReviewPayload {
  providerType: 'hospital' | 'doctor';
  providerId: string;
  patientName: string;
  email: string;
  /** 1–5 star value for the individual review (NOT a PER/CER/MER score). */
  rating: number;
  title: string;
  body: string;
  consent: boolean;
}

export interface SubmitReviewSuccess {
  ok: true;
  status: 'pending_moderation';
  message: string;
}

export async function submitReview(payload: SubmitReviewPayload): Promise<SubmitReviewSuccess | MockActionFailure> {
  const errors = validate(
    {
      providerId: [required('Provider')],
      patientName: [required('Full name'), minLength(2), maxLength(120)],
      email: [required('Email'), email()],
      title: [required('Review title'), maxLength(120)],
      body: [required('Review'), minLength(20), maxLength(4000)],
      consent: [consentTrue()],
    } satisfies Record<string, FieldValidator[]>,
    payload as unknown as FieldValues,
  );
  if (Object.keys(errors).length === 0) {
    if (!Number.isFinite(payload.rating) || payload.rating < 1 || payload.rating > 5) {
      errors.rating = 'Choose a rating between 1 and 5';
    }
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  await delay(randomLatency());
  return {
    ok: true,
    status: 'pending_moderation',
    message: 'Demo only: your review was not published or stored anywhere.',
  };
}

// ---------------------------------------------------------------------------
// saveProvider — partner profile mock save (hospital-portal / doctor-portal)
// ---------------------------------------------------------------------------

export interface SaveProviderPayload {
  providerType: 'hospital' | 'doctor';
  providerId: string;
  name: string;
  city: string;
  overview: string;
  /** Demo contact email for the partner profile. */
  contactEmail: string;
  consent: boolean;
}

export interface SaveProviderSuccess {
  ok: true;
  savedAt: string;
  message: string;
}

export async function saveProvider(payload: SaveProviderPayload): Promise<SaveProviderSuccess | MockActionFailure> {
  const errors = validate(
    {
      providerId: [required('Provider')],
      name: [required('Name'), minLength(2), maxLength(160)],
      city: [required('City')],
      overview: [maxLength(4000)],
      contactEmail: [required('Contact email'), email()],
      consent: [consentTrue()],
    } satisfies Record<string, FieldValidator[]>,
    payload as unknown as FieldValues,
  );
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  await delay(randomLatency());
  return {
    ok: true,
    savedAt: new Date().toISOString(),
    message: 'Demo only: changes were not saved to any backend.',
  };
}

// ---------------------------------------------------------------------------
// dismissNotification — FR-017 local mock notification state
// ---------------------------------------------------------------------------

export interface DismissNotificationPayload {
  notificationId: string;
}

export interface DismissNotificationSuccess {
  ok: true;
  notificationId: string;
  status: 'dismissed';
  message: string;
}

export async function dismissNotification(
  payload: DismissNotificationPayload,
): Promise<DismissNotificationSuccess | MockActionFailure> {
  const errors = validate(
    { notificationId: [required('Notification')] } satisfies Record<string, FieldValidator[]>,
    payload as unknown as FieldValues,
  );
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  await delay(randomLatency());
  return {
    ok: true,
    notificationId: payload.notificationId,
    status: 'dismissed',
    message: 'Demo only: nothing was changed outside this mock session.',
  };
}
