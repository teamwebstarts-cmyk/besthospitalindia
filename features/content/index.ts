/**
 * A02 content feature barrel — home sections, FAQ, testimonials, page furniture.
 *
 * Everything here is demo-only composition over frozen shared contracts
 * (@/components/ui/*, @/components/shared/*) and A01 fixtures/selectors.
 * No business rules are invented here; copy follows the implementation specs.
 */
export { PageHeader, PageSection, LegalDraftNotice } from "./page-sections"
export { FaqList, type FaqListProps } from "./faq-list"
export { TestimonialCard, type TestimonialCardProps } from "./testimonial-card"
export {
  JourneySteps,
  type JourneyStep,
  type JourneyStepsProps,
} from "./journey-steps"
export {
  PartnerBenefits,
  type PartnerBenefit,
  type PartnerBenefitsProps,
} from "./partner-benefits"
export {
  DemoNotice,
  DemoFormFeedback,
  type DemoFormFeedbackState,
  type DemoFormFeedbackProps,
} from "./demo-notice"
export {
  ContentLinkGroup,
  type ContentLinkGroupProps,
} from "./content-link-group"
export {
  AnchorNav,
  type AnchorNavItem,
  type AnchorNavProps,
} from "./anchor-nav"
export {
  RatingKindExplainer,
  type RatingKindEntry,
  type RatingKindExplainerProps,
} from "./rating-kind-explainer"
export {
  MethodologyCriteriaTable,
  type MethodologyCriteriaRow,
  type MethodologyCriteriaTableProps,
} from "./methodology-criteria-table"
export {
  EnquiryForm,
  type EnquiryFormProps,
  type EnquiryFormField,
  type EnquiryFormTextField,
  type EnquiryFormSelectField,
  type EnquiryFormTextareaField,
  type EnquiryFormConsentField,
} from "./enquiry-form"
export {
  PartnerInterestForm,
  type PartnerInterestFormProps,
} from "./partner-forms"
export { ContactForm } from "./contact-form"
export { AuthEntryCard, type AuthEntryCardProps } from "./auth-entry-card"
export { HeroSearchPanel, type HeroSearchPanelProps } from "./hero-panel"
export { HomeHeroSection, type HomeHeroSectionProps } from "./home-hero-section"
export {
  HomeBleedBand,
  HomePageSection,
  homeSectionInnerClassName,
  HomeSectionHeading,
  MedicalDestinationCities,
  SpecialtyTileGrid,
  FacilityCategoryGrid,
  MedicalTourismBlock,
  HomeLowestQuotesSection,
  HomePatientServicesSection,
  TrustValuesBlock,
  IufConsultationCta,
  TestimonialsSection,
  HomeFaqSection,
  type HomeBleedBandProps,
  type HomePageSectionProps,
  type HomeSectionHeadingProps,
  type MedicalDestinationCitiesProps,
  type MedicalDestinationCityCard,
  type SpecialtyTileGridProps,
  type FacilityCategoryEntry,
  type FacilityCategoryGridProps,
  type HomeLowestQuotesSectionProps,
  type HomePatientServicesSectionProps,
  type MedicalTourismBlockProps,
  type TrustValuesBlockProps,
  type IufConsultationCtaProps,
  type TestimonialsSectionProps,
  type HomeFaqSectionProps,
} from "./home-sections"
