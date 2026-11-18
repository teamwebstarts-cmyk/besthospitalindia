/**
 * Typed route registry — BestHospitalIndia (A01).
 *
 * Sources: implementation/02-page-inventory.md (public + portal routes) and
 * implementation/14-admin-module-contracts.md (18 admin paths). Companion to
 * constants/navigation.ts (A00-owned) — this file only registers route paths.
 * All routes are path strings; the `as const` shape gives literal types so page
 * agents get autocomplete and typo checks via the RoutePath union.
 */

// ---------------------------------------------------------------------------
// Public website (02-page-inventory.md)
// ---------------------------------------------------------------------------

export const PUBLIC_ROUTES = {
  home: '/',
  facilities: '/facilities',
  facilityDetail: '/facilities/[slug]',
  hospitals: '/hospitals',
  hospitalProfile: '/hospitals/[slug]',
  hospitalComparison: '/hospitals/compare',
  doctors: '/doctors',
  doctorProfile: '/doctors/[slug]',
  medicalTourism: '/medical-tourism',
  medicalTourismTravelAssistance: '/medical-tourism/travel-assistance',
  treatments: '/treatments',
  treatmentDetail: '/treatments/[slug]',
  internationalPatientEnquiry: '/international-patient/enquiry',
  freeConsultation: '/free-consultation',
  appointmentRequest: '/appointment-request',
  about: '/about',
  internationalUrbanForum: '/international-urban-forum',
  ratingMethodology: '/rating-methodology',
  howItWorks: '/how-it-works',
  forHospitals: '/for-hospitals',
  forDoctors: '/for-doctors',
  contact: '/contact',
  privacy: '/privacy',
  terms: '/terms',
  disclaimer: '/disclaimer',
} as const;

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const AUTH_ROUTES = {
  auth: '/auth',
} as const;

// ---------------------------------------------------------------------------
// Patient portal (10 paths, 02-page-inventory.md)
// ---------------------------------------------------------------------------

export const PATIENT_ROUTES = {
  dashboard: '/patient',
  profile: '/patient/profile',
  appointments: '/patient/appointments',
  enquiries: '/patient/enquiries',
  reports: '/patient/reports',
  savedProviders: '/patient/saved',
  reviews: '/patient/reviews',
  notifications: '/patient/notifications',
  settings: '/patient/settings',
} as const;

// ---------------------------------------------------------------------------
// Hospital partner portal (11 paths, 02-page-inventory.md)
// ---------------------------------------------------------------------------

export const HOSPITAL_PORTAL_ROUTES = {
  dashboard: '/hospital-portal',
  profile: '/hospital-portal/profile',
  specialities: '/hospital-portal/specialities',
  doctors: '/hospital-portal/doctors',
  appointments: '/hospital-portal/appointments',
  enquiries: '/hospital-portal/enquiries',
  reviews: '/hospital-portal/reviews',
  documents: '/hospital-portal/documents',
  ratings: '/hospital-portal/ratings',
  team: '/hospital-portal/team',
  settings: '/hospital-portal/settings',
} as const;

// ---------------------------------------------------------------------------
// Doctor portal (9 paths, 02-page-inventory.md)
// ---------------------------------------------------------------------------

export const DOCTOR_PORTAL_ROUTES = {
  dashboard: '/doctor-portal',
  profile: '/doctor-portal/profile',
  hospitals: '/doctor-portal/hospitals',
  availability: '/doctor-portal/availability',
  appointments: '/doctor-portal/appointments',
  consultations: '/doctor-portal/consultations',
  credentials: '/doctor-portal/credentials',
  reviews: '/doctor-portal/reviews',
  settings: '/doctor-portal/settings',
} as const;

// ---------------------------------------------------------------------------
// Admin portal (18 paths, 14-admin-module-contracts.md)
// ---------------------------------------------------------------------------

export const ADMIN_ROUTES = {
  dashboard: '/admin',
  hospitals: '/admin/hospitals',
  doctors: '/admin/doctors',
  facilities: '/admin/facilities',
  patients: '/admin/patients',
  appointments: '/admin/appointments',
  consultations: '/admin/consultations',
  medicalTourism: '/admin/medical-tourism',
  reviews: '/admin/reviews',
  ratings: '/admin/ratings',
  ratingMethodology: '/admin/rating-methodology',
  partners: '/admin/partners',
  cms: '/admin/cms',
  iuf: '/admin/iuf',
  notifications: '/admin/notifications',
  analytics: '/admin/analytics',
  roles: '/admin/roles',
  settings: '/admin/settings',
} as const;

// ---------------------------------------------------------------------------
// Aggregated registry + derived types
// ---------------------------------------------------------------------------

export const ROUTES = {
  public: PUBLIC_ROUTES,
  auth: AUTH_ROUTES,
  patient: PATIENT_ROUTES,
  hospitalPortal: HOSPITAL_PORTAL_ROUTES,
  doctorPortal: DOCTOR_PORTAL_ROUTES,
  admin: ADMIN_ROUTES,
} as const;

/** Any registered route literal. */
export type RoutePath =
  | (typeof PUBLIC_ROUTES)[keyof typeof PUBLIC_ROUTES]
  | (typeof AUTH_ROUTES)[keyof typeof AUTH_ROUTES]
  | (typeof PATIENT_ROUTES)[keyof typeof PATIENT_ROUTES]
  | (typeof HOSPITAL_PORTAL_ROUTES)[keyof typeof HOSPITAL_PORTAL_ROUTES]
  | (typeof DOCTOR_PORTAL_ROUTES)[keyof typeof DOCTOR_PORTAL_ROUTES]
  | (typeof ADMIN_ROUTES)[keyof typeof ADMIN_ROUTES];

/** Group keys of the aggregated ROUTES registry. */
export type RouteGroup = keyof typeof ROUTES;

/** Type of one group's record, e.g. RouteGroupValues<'admin'> → admin paths. */
export type RouteGroupValues<TGroup extends RouteGroup> = (typeof ROUTES)[TGroup][keyof (typeof ROUTES)[TGroup]];

// ---------------------------------------------------------------------------
// Dynamic route builders (A15 / BUG-002 family)
//
// The registry above intentionally stores template paths (e.g. '/hospitals/[slug]')
// so the full route surface stays greppable in one place. Template strings must
// never reach a <Link href>, a router.push, or a metadata canonical URL —
// Next.js App Router throws on dynamic hrefs like '/hospitals/[slug]/x'.
// These builders are the single sanctioned way to materialize a dynamic path.
// ---------------------------------------------------------------------------

function buildDynamicRoute(template: string, slug: string): string {
  return template.replace('[slug]', encodeURIComponent(slug));
}

/** Materialize a hospital profile path, e.g. hospitalProfileHref('sunrise-…') → '/hospitals/sunrise-…'. */
export function hospitalProfileHref(hospitalSlug: string): string {
  return buildDynamicRoute(ROUTES.public.hospitalProfile, hospitalSlug);
}

/** Materialize a doctor profile path. */
export function doctorProfileHref(doctorSlug: string): string {
  return buildDynamicRoute(ROUTES.public.doctorProfile, doctorSlug);
}

/** Materialize a treatment detail path. */
export function treatmentDetailHref(treatmentSlug: string): string {
  return buildDynamicRoute(ROUTES.public.treatmentDetail, treatmentSlug);
}

/** Materialize a facility detail path. */
export function facilityDetailHref(facilitySlug: string): string {
  return buildDynamicRoute(ROUTES.public.facilityDetail, facilitySlug);
}

/** Build a provider-specific booking URL without creating a patient portal. */
export function appointmentRequestHref(
  providerType: "hospital" | "doctor",
  providerId: string,
): string {
  const query = new URLSearchParams({ providerType, providerId });
  return `${ROUTES.public.appointmentRequest}?${query.toString()}`;
}
