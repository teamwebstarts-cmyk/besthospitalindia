/**
 * Medical tourism feature barrel — Agent A06.
 *
 * Exports the feature components + selectors built for the five A06 routes
 * (/medical-tourism, /medical-tourism/travel-assistance, /treatments,
 * /treatments/[slug], /international-patient/enquiry). Consumes only frozen
 * shared contracts (@/components/*, @/data, @/lib); owns nothing outside
 * features/medical-tourism and the five page files.
 */

export {
  JourneySteps,
  type JourneyStep,
  type JourneyStepsProps,
} from "./components/journey-steps"
export {
  TreatmentCard,
  type TreatmentCardProps,
} from "./components/treatment-card"
export {
  EnquiryCta,
  type EnquiryCtaProps,
} from "./components/enquiry-cta"
export {
  SupportServiceCards,
  type SupportService,
  type SupportServiceCardsProps,
} from "./components/support-service-cards"
export { FaqList, type FaqItem, type FaqListProps } from "./components/faq-list"
export {
  ReportUploadMock,
  type MockReport,
  type ReportUploadMockProps,
} from "./components/report-upload-mock"
export {
  InternationalPatientEnquiryForm,
  type InternationalPatientEnquiryFormProps,
} from "./components/international-patient-enquiry-form"
export {
  selectTreatments,
  hospitalIdsForTreatment,
  doctorIdsForTreatment,
  specialtyForTreatment,
  type TreatmentQuery,
  type TreatmentSort,
} from "./selectors"
