/**
 * Doctor Portal shared exports (A10).
 *
 * Local doctor-portal compositions only — nothing here duplicates a shared
 * component; they wrap or compose A00/A01/A04 primitives.
 */

export { DoctorKpi, type DoctorKpiProps } from "./components/doctor-kpi"
export {
  PortalPageHeader,
  type PortalPageHeaderProps,
} from "./components/portal-page-header"
export { DEMO_DOCTOR_ID, getSessionDoctor } from "./session"
export { formatDate, formatDateTime } from "./format"
export {
  appointmentsForDoctor,
  consultationQueueForDoctor,
  doctorDisplayName,
  getDoctor,
  hospitalDisplayName,
  patientDisplayName,
  reviewsForDoctor,
  specialtyLabel,
  treatmentLabel,
} from "./selectors"
