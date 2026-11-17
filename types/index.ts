/**
 * Domain type barrel — BestHospitalIndia (A01 data contracts).
 *
 * Everything under types/ is re-exported here; page agents import from
 * `@/types`. RatingSummary/RatingPair are frozen shared contracts
 * (12-dependency-map.md) — do not reshape without orchestrator sign-off.
 */

export type {
  RatingKind,
  RatingStatus,
  RatingBasis,
  RatingSummary,
  RatingPair,
  RatingAssessmentStatus,
  RatingEvidenceKind,
  RatingCriterion,
  RatingEvidence,
  RatingAssessment,
} from './rating';

export type {
  VerificationStatus,
  ProviderRefType,
  Accreditation,
  Registration,
  Hospital,
  Doctor,
  FacilityCategory,
  Facility,
  DocumentStatus,
  HospitalDocumentType,
  HospitalDocument,
  DoctorCredentialKind,
  DoctorCredential,
} from './provider';

export type { PatientEnquiryStatus, PatientEnquiry, Patient } from './patient';

export type {
  AppointmentStatus,
  ConsultationMode,
  AppointmentRequest,
} from './appointment';

export type {
  TourismCaseStage,
  TourismCoordinatorAssignment,
  ConsultationType,
  MedicalTourismCase,
} from './consultation';

export type {
  ReviewStatus,
  ReviewerVerification,
  Review,
  PartnerRole,
  PartnerUser,
  NotificationStatus,
  NotificationAudience,
  NotificationCategory,
  Notification,
  AuditActorRole,
  AuditAction,
  AuditEvent,
  CmsContentStatus,
  CmsContent,
  Faq,
  Testimonial,
} from './portal';

export type { Specialty, Treatment } from './content';
