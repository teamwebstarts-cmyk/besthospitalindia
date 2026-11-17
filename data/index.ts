/**
 * Mock data barrel — BestHospitalIndia (A01 data contracts).
 *
 * Page agents import fixtures from `@/data`. Everything here is FICTIONAL DEMO
 * DATA — not real providers, ratings or outcomes. Ratings on Hospital/Doctor are
 * independent PER/CER/MER RatingSummary objects; never combine them.
 */

export { hospitals, hospitalById } from './hospitals';
export { doctors, doctorById } from './doctors';
export { facilities, facilityById } from './facilities';
export {
  specialties,
  specialtyById,
  specialtyBySlug,
} from './specialties';
export {
  treatments,
  treatmentById,
  treatmentBySlug,
} from './treatments';
export {
  reviews,
  reviewsForProvider,
  ratingAssessments,
  assessmentsForProvider,
} from './reviews';
export {
  patients,
  patientEnquiries,
  partnerUsers,
  notifications,
  patientById,
} from './portal';
export { appointments, appointmentsForPatient } from './appointments';
export { tourismCases, tourismCasesForPatient } from './consultations';
