/**
 * A02 home-content — copy blocks and home-specific fixtures for the homepage.
 *
 * This is the only content module A02 owns. Structural record arrays
 * (hospitals, doctors, facilities, specialties, treatments, FAQs) always come
 * from @/data; this file supplies the copy/taxonomy glue the docs allow the
 * page layer to own (JourneySteps copy, trust values, benefit bullets, FAQ
 * categories). All testimonials here are clearly-labelled fictional fixtures.
 */

import type { JourneyStep } from "@/features/content/journey-steps"
import type { PartnerBenefit } from "@/features/content/partner-benefits"
import type { RatingKindEntry } from "@/features/content/rating-kind-explainer"
import type { MethodologyCriteriaRow } from "@/features/content/methodology-criteria-table"
import type { AnchorNavItem } from "@/features/content/anchor-nav"
import type { Testimonial } from "@/types"
import { ROUTES } from "@/constants/routes"

/* -------------------------------------------------------------------------
 * Home hero + search
 * ----------------------------------------------------------------------- */

export const homeHero = {
  /** H1 — the page's single top-level heading. */
  heading: "Find the right hospital, doctor or treatment in India",
  subheading:
    "BestHospitalIndia is a healthcare discovery platform: compare demo provider profiles with independent patient-experience and expertise ratings, explore treatments and facilities, and raise an enquiry — all as a clearly-labelled mock build.",
} as const

export interface HomeSearchCategory {
  /** Value routed as the first URL segment. */
  value: "hospitals" | "doctors" | "treatments"
  label: string
}

/** Typed search targets per the home spec (search routes to typed results). */
export const homeSearchCategories: readonly HomeSearchCategory[] = [
  { value: "hospitals", label: "Hospitals" },
  { value: "doctors", label: "Doctors" },
  { value: "treatments", label: "Treatments" },
]

/* -------------------------------------------------------------------------
 * How-it-works journey copy (also reused on /how-it-works)
 * ----------------------------------------------------------------------- */

export const patientJourneySteps: readonly JourneyStep[] = [
  {
    id: "journey-discover",
    title: "Discover providers",
    description:
      "Search hospitals, doctors and treatments, and filter the demo directory by city, specialty or facility type.",
    href: ROUTES.public.hospitals,
    hrefLabel: "Browse hospitals",
  },
  {
    id: "journey-enquire",
    title: "Raise an enquiry",
    description:
      "Send a free-consultation or international-patient enquiry with your concern, reports and preferred date. A demo coordinator workflow picks it up.",
    href: ROUTES.public.freeConsultation,
    hrefLabel: "Free consultation",
  },
  {
    id: "journey-request",
    title: "Request an appointment",
    description:
      "Request a slot with a listed hospital or doctor. A request is a coordination workflow — it is not a confirmed booking until the provider confirms.",
    href: ROUTES.public.doctors,
    hrefLabel: "Find doctors",
  },
  {
    id: "journey-support",
    title: "Travel & ongoing support",
    description:
      "International patients can explore travel-assistance information and track a medical-tourism case through its demo stages.",
    href: ROUTES.public.medicalTourism,
    hrefLabel: "Medical tourism",
  },
]

/* -------------------------------------------------------------------------
 * Trust values / why BestHospitalIndia
 * ----------------------------------------------------------------------- */

export const homeTrustIntro =
  "The platform is built around honest, independent information: verification states are shown as they are, ratings stay separate, and every request workflow states what it does and does not do."

/* -------------------------------------------------------------------------
 * About page content
 * ----------------------------------------------------------------------- */

export const aboutContent = {
  mission:
    "To make healthcare discovery in India transparent: every provider profile carries its verification state, every rating is independent and evidence-based, and every request flow explains its own boundaries.",
  vision:
    "A discovery platform where patients can weigh patient experience, clinical expertise and medical expertise separately, understand where each number comes from, and decide with confidence.",
  objectives: [
    {
      id: "obj-discovery",
      title: "Structured discovery",
      body: "Typed directories for hospitals, doctors, facilities and treatments, with URL-driven search, filters, sort and pagination.",
    },
    {
      id: "obj-ratings",
      title: "Independent ratings",
      body: "Patient Experience (PER), Clinical Expertise (CER) and Medical Expertise (MER) ratings are maintained as separate assessments with visible methodology metadata.",
    },
    {
      id: "obj-verification",
      title: "Visible verification",
      body: "Accreditation and registration records carry explicit verification states, so demo users can see what is confirmed and what is still pending.",
    },
    {
      id: "obj-coordination",
      title: "Request-based coordination",
      body: "Enquiries, appointment requests and medical-tourism support operate as coordination workflows with clear mock-only boundaries.",
    },
  ],
  scope: [
    "Hospital, doctor and facility discovery across demo Indian cities",
    "Treatment and specialty pages describing what listed providers offer",
    "Independent PER / CER / MER ratings with methodology metadata",
    "IUF-supported free consultation and international-patient enquiry flows",
    "Medical tourism programme information and travel-assistance pages",
  ],
  trustPrinciples: [
    "No combined or composite rating is ever displayed — PER, CER and MER remain independent.",
    'Missing scores are shown as "Not yet rated" or "Assessment pending", never as zero.',
    "All providers, ratings and stories in this build are fictional demo data.",
    "No clinical advice, diagnosis or outcome guarantees are offered anywhere on the platform.",
  ],
} as const

/* -------------------------------------------------------------------------
 * IUF page content
 * ----------------------------------------------------------------------- */

export const iufContent = {
  banner: "International Urban Forum Supported Initiative",
  intro:
    "The International Urban Forum (IUF) is the institution behind the free consultation initiative on BestHospitalIndia. This page summarises the documented background of that relationship.",
  background: [
    "The free consultation flow on the platform is operated as an IUF-supported initiative and carries IUF branding at its entry points.",
    "IUF’s institutional relationship to the platform is limited to this consultation initiative; the provider directories, ratings and partner portals are platform modules.",
    "Detailed institutional information about IUF — governance, legal status and formal statements — must be supplied and approved by IUF before publication.",
  ],
  relationship: [
    {
      id: "rel-consultation",
      title: "Supported consultation initiative",
      body: "IUF branding appears on the free consultation flow: its entry points, scope statement and request form. Scope, eligibility and cost boundaries are shown before any request is submitted.",
      href: ROUTES.public.freeConsultation,
      hrefLabel: "Open the consultation page",
    },
    {
      id: "rel-boundary",
      title: "Platform boundary",
      body: "Hospital, doctor and facility listings, ratings and partner tools belong to BestHospitalIndia and are not presented as IUF services. No endorsement of listed providers by IUF is stated or implied.",
    },
    {
      id: "rel-approval",
      title: "Content approval",
      body: "All IUF identity, copy and claims on this page are placeholder demo content pending written approval from IUF. Nothing here constitutes an institutional statement.",
    },
  ],
  demoNote:
    "Demo build: IUF institutional details, approvals and branding assets are fictional placeholders until the approved profile is supplied.",
} as const

/* -------------------------------------------------------------------------
 * Rating methodology page content
 * ----------------------------------------------------------------------- */

export const methodologyAnchors: readonly AnchorNavItem[] = [
  { id: "per", label: "PER — Patient Experience" },
  { id: "cer", label: "CER — Clinical Expertise" },
  { id: "mer", label: "MER — Medical Expertise" },
  { id: "evidence", label: "Evidence & verification" },
  { id: "governance", label: "Governance & limitations" },
]

export const ratingKindEntries: readonly RatingKindEntry[] = [
  {
    kind: "PER",
    label: "Patient Experience Rating",
    description:
      "The Patient Experience Rating reflects structured patient feedback collected about a provider — for example survey batches about communication, coordination and overall experience of the care journey.",
    basis: "Patient feedback (surveys; sample size shown with the rating)",
    meta: [
      "Displayed on both hospital and doctor profiles, always separate from CER/MER.",
      "Shown with sample size, last assessed date and methodology version.",
      'Missing score renders as "Not yet rated" — never 0/5.',
    ],
    anchorId: "per",
  },
  {
    kind: "CER",
    label: "Clinical Expertise Rating",
    description:
      "The Clinical Expertise Rating is an evidence-based assessment of a hospital’s clinical capability, built from verified evidence such as accreditation records, professional credentials and verified outcome summaries.",
    basis: "Verified evidence (accreditation records, audits, outcome reports)",
    meta: [
      "Hospital-level rating; assessed per methodology version.",
      "Sample sizes and evidence summaries are visible with the score.",
      'Assessments still in review render as "Assessment pending".',
    ],
    anchorId: "cer",
  },
  {
    kind: "MER",
    label: "Medical Expertise Rating",
    description:
      "The Medical Expertise Rating is an evidence-based assessment of an individual doctor’s professional standing, built from credential checks, registration verification and experience records.",
    basis: "Verified evidence (credential and registration checks)",
    meta: [
      "Doctor-level rating; always separate from the doctor’s PER.",
      "Shown with sample size, last assessed date and methodology version.",
      'Missing score renders as "Not yet rated" — never 0/5.',
    ],
    anchorId: "mer",
  },
]

/** Criteria rows derived from the frozen demo assessment fixtures (rass-001/003). */
export const cerCriteriaRows: readonly MethodologyCriteriaRow[] = [
  {
    id: "crit-acc",
    label: "Accreditations",
    weight: 30,
    sampleScore: 4.0,
    scaleMax: 5,
  },
  {
    id: "crit-doc",
    label: "Professional credentials",
    weight: 40,
    sampleScore: 4.5,
    scaleMax: 5,
  },
  {
    id: "crit-out",
    label: "Verified outcomes",
    weight: 30,
    sampleScore: 4.0,
    scaleMax: 5,
  },
]

export const merCriteriaRows: readonly MethodologyCriteriaRow[] = [
  {
    id: "crit-qual",
    label: "Qualifications",
    weight: 40,
    sampleScore: 4.5,
    scaleMax: 5,
  },
  {
    id: "crit-reg",
    label: "Registration checks",
    weight: 30,
    sampleScore: 4.0,
    scaleMax: 5,
  },
  {
    id: "crit-exp",
    label: "Experience record",
    weight: 30,
    sampleScore: 4.5,
    scaleMax: 5,
  },
]

export const methodologyGovernance = [
  "Every assessment is tied to one provider, one rating kind and one methodology version — no blended scores exist in the data model.",
  "Evidence records (accreditation records, clinical audits, credential checks, outcome reports) are summarised with each assessment; the underlying documents stay in the provider record.",
  "Assessments move through review states (in review, changes requested, published); only published assessments produce a visible score.",
  'Unrated providers display "Not yet rated" or "Assessment pending" rather than a zero, so absence of data is never presented as a poor score.',
  "Governance ownership and formal policy wording are pending owner approval; this page describes the documented demo behaviour only.",
] as const

/* -------------------------------------------------------------------------
 * For hospitals / for doctors page content
 * ----------------------------------------------------------------------- */

export const forHospitalsSteps: readonly JourneyStep[] = [
  {
    id: "hosp-step-1",
    title: "Express interest",
    description:
      "Submit the institutional interest form below. In the demo, this creates a local confirmation only — no application is filed.",
  },
  {
    id: "hosp-step-2",
    title: "Profile setup",
    description:
      "A hospital profile carries overview, specialties, treatments, accreditations and linked doctors, mirroring the structure used across the directory.",
  },
  {
    id: "hosp-step-3",
    title: "Document verification",
    description:
      "Registration certificates, accreditation records and licenses are tracked with explicit verification states — verified, pending, rejected or expired.",
  },
  {
    id: "hosp-step-4",
    title: "Enquiry management",
    description:
      "Partner teams handle incoming patient enquiries and appointment requests in the hospital portal, with status workflows for each enquiry.",
  },
]

export const forHospitalsBenefits: readonly PartnerBenefit[] = [
  {
    id: "hosp-ben-visibility",
    title: "Structured visibility",
    description:
      "Your facility appears in typed hospital and facility directories with specialties, treatments and verified credentials clearly represented.",
    icon: undefined,
  },
  {
    id: "hosp-ben-ratings",
    title: "Honest rating presentation",
    description:
      "Patient Experience and Clinical Expertise ratings are shown as separate, evidence-backed assessments with visible methodology metadata.",
    icon: undefined,
  },
  {
    id: "hosp-ben-enquiries",
    title: "Managed patient enquiries",
    description:
      "Enquiries and appointment requests arrive as structured records with status workflows, so nothing is lost in email threads.",
    icon: undefined,
  },
  {
    id: "hosp-ben-team",
    title: "Team access",
    description:
      "Owner and staff partner roles let multiple team members work the same hospital record in the portal demo.",
    icon: undefined,
  },
]

export const forDoctorsSteps: readonly JourneyStep[] = [
  {
    id: "doc-step-1",
    title: "Express interest",
    description:
      "Submit the individual doctor interest form below. In the demo, this creates a local confirmation only — no registration happens.",
  },
  {
    id: "doc-step-2",
    title: "Profile & credentials",
    description:
      "A doctor profile lists qualifications, registration details (masked in the demo), languages and hospital associations.",
  },
  {
    id: "doc-step-3",
    title: "Credential verification",
    description:
      "Degrees, postgraduate degrees, registrations and fellowships are tracked as credential records with explicit verification states.",
  },
  {
    id: "doc-step-4",
    title: "Patient enquiries & consultations",
    description:
      "Doctors manage appointment requests and consultations from the doctor portal, keeping hospital associations and availability in one place.",
  },
]

export const forDoctorsBenefits: readonly PartnerBenefit[] = [
  {
    id: "doc-ben-profile",
    title: "A profile patients can read",
    description:
      "Qualifications, specialties, languages and hospital associations are presented in a structured, readable profile.",
    icon: undefined,
  },
  {
    id: "doc-ben-ratings",
    title: "Two independent ratings",
    description:
      "Patient Experience (PER) and Medical Expertise (MER) are displayed separately, each with its own evidence and sample metadata.",
    icon: undefined,
  },
  {
    id: "doc-ben-associations",
    title: "Hospital associations",
    description:
      "Your hospital links are maintained two-way with hospital records, so patients can see where you practise.",
    icon: undefined,
  },
  {
    id: "doc-ben-portal",
    title: "Portal workflows",
    description:
      "Appointments, consultations, credentials and reviews are manageable from the doctor portal demo.",
    icon: undefined,
  },
]

/* -------------------------------------------------------------------------
 * Homepage testimonials (fictional, clearly labelled in the UI)
 * ----------------------------------------------------------------------- */

export const homeTestimonials: readonly Testimonial[] = [
  {
    id: "test-story-1",
    authorName: "Meera (fictional)",
    authorCountry: "Singapore",
    quote:
      "The separate experience and expertise ratings helped me ask better questions before choosing a demo hospital. I always knew which number came from patients and which came from evidence.",
    hospitalId: "hosp-tranquilvalley-kochi",
    at: "2026-09-12",
  },
  {
    id: "test-story-2",
    authorName: "Rahul (fictional)",
    authorCountry: "United Arab Emirates",
    quote:
      'Seeing the verification state right on the profile — and an honest "assessment pending" where a rating was missing — made the demo feel trustworthy rather than salesy.',
    hospitalId: "hosp-sunrise-delhi",
    at: "2026-10-02",
  },
  {
    id: "test-story-3",
    authorName: "Anita (fictional)",
    authorCountry: "India",
    quote:
      "The request workflow was clear that nothing was confirmed yet. That honesty is what I would want from a real healthcare discovery platform.",
    hospitalId: null,
    at: "2026-10-18",
  },
]

/* -------------------------------------------------------------------------
 * Contact page content
 * ----------------------------------------------------------------------- */

export const contactContent = {
  intro:
    "Choose the purpose of your message and reach the right team. Contact details shown here are demo placeholders — approved contact values will be supplied by the platform owner.",
  channels: [
    {
      id: "channel-support",
      title: "Patient support",
      body: "Questions about finding providers, enquiries or appointment requests on the platform.",
      label: "support@example.com (demo placeholder)",
    },
    {
      id: "channel-partnership",
      title: "Hospital & doctor partnerships",
      body: "Interest in listing a hospital or joining as an individual doctor — see the partner pages for scope first.",
      label: "partnerships@example.com (demo placeholder)",
    },
    {
      id: "channel-consultation",
      title: "Free consultation initiative",
      body: "The IUF-supported consultation flow has its own request form; use it rather than this general contact form.",
      label: "Use the consultation request form",
      href: ROUTES.public.freeConsultation,
    },
  ],
  note: "No invented contact details are presented as real. Replace all values on this page with approved contact information before any production use.",
} as const

/* -------------------------------------------------------------------------
 * Partner form option sets (form-owned taxonomy, not provider records)
 * ----------------------------------------------------------------------- */

export const hospitalSizeOptions = [
  { value: "under-50", label: "Under 50 beds" },
  { value: "50-200", label: "50–200 beds" },
  { value: "200-500", label: "200–500 beds" },
  { value: "over-500", label: "Over 500 beds" },
] as const

export const doctorExperienceOptions = [
  { value: "0-5", label: "0–5 years" },
  { value: "5-10", label: "5–10 years" },
  { value: "10-20", label: "10–20 years" },
  { value: "20+", label: "Over 20 years" },
] as const
