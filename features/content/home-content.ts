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
  /** H1 — two lines in `HomeHeroSection` (line 1 → hospital, line 2 → doctor). */
  headingLineOneLead: "Find the right ",
  headingHospital: "hospital",
  headingLineOneEnd: ",",
  headingLineTwoLead: "meeting the right ",
  headingDoctor: "doctor",
  subheading:
    "Compare hospitals and doctors across India with independent ratings and request coordinated support for your care journey.",
  /** One-line hero lead on small screens only (`HomeHeroSection`). */
  subheadingMobile:
    "Compare hospitals and doctors in India - independent ratings and free consultation support.",
} as const

/** Copy for the city-destination pill row on the home page. */
export const homeMedicalDestinations = {
  title: "Top medical destinations",
  description:
    "Explore hospitals and specialists across India’s leading care states — select a destination to open the directory.",
  /** Shorter lead below `lg` (`MedicalDestinationCities`). */
  descriptionMobile: "India’s top care states — tap a destination to browse hospitals.",
} as const

/** Platform capabilities surfaced on the home page (aligned with about scope — demo only). */
export interface HomePatientServiceItem {
  id: string
  title: string
  description: string
}

export const homePatientServices = {
  title: "What you can use on this platform",
  description:
    "A healthcare discovery directory for India — compare independent ratings, browse providers and send enquiries. Not a concierge or confirmed booking service.",
  descriptionMobile:
    "Discover providers in India, compare ratings and send enquiries — not a booking concierge.",
  items: [
    {
      id: "provider-discovery",
      title: "Hospital, doctor & facility discovery",
      description:
        "Browse listings across Indian cities with search, filters, sort and pagination.",
    },
    {
      id: "treatment-pages",
      title: "Treatment & specialty pages",
      description:
        "Open programme profiles to see specialty context and which listed providers offer each programme.",
    },
    {
      id: "independent-ratings",
      title: "PER, CER & MER ratings",
      description:
        "Patient Experience, Clinical Expertise and Medical Expertise scores stay separate, each with visible methodology metadata.",
    },
    {
      id: "verification-states",
      title: "Verification states",
      description:
        "Accreditation and registration records show confirmed vs pending verification states on provider profiles.",
    },
    {
      id: "free-consultation",
      title: "IUF free consultation",
      description:
        "Entry to the IUF-supported consultation initiative with branding and boundaries explained in the flow.",
    },
    {
      id: "patient-enquiry",
      title: "International patient enquiry",
      description:
        "Submit an international patient enquiry; our coordination team routes it to the right hospital or doctor.",
    },
    {
      id: "medical-tourism-info",
      title: "Medical tourism programme",
      description:
        "Orientation on planning care travel in India using the platform’s directories — not live coordination.",
    },
    {
      id: "travel-assistance",
      title: "Travel assistance information",
      description:
        "Practical pointers on visas, stay and local transport for major care destinations across India.",
    },
    {
      id: "cost-context",
      title: "Cost planning context",
      description:
        "Understand what patients typically plan for financially; estimates come only from providers, never from this site.",
    },
  ] satisfies readonly HomePatientServiceItem[],
} as const

/** Home grid of demo treatment profiles (slugs match @/data/treatments). */
export interface HomeFeaturedTreatmentItem {
  slug: string
  title: string
  specialtyLabel: string
}

export const homeFeaturedTreatments = {
  title: "Explore treatments in the directory",
  description:
    "Programme entries from our treatment directory — each links to a treatment profile and listed providers.",
  items: [
    {
      slug: "coronary-angioplasty",
      title: "Coronary angioplasty",
      specialtyLabel: "Cardiology",
    },
    {
      slug: "bypass-surgery",
      title: "Coronary bypass surgery",
      specialtyLabel: "Cardiology",
    },
    {
      slug: "chemotherapy",
      title: "Chemotherapy day care",
      specialtyLabel: "Oncology",
    },
    {
      slug: "knee-replacement",
      title: "Knee replacement",
      specialtyLabel: "Orthopaedics",
    },
    {
      slug: "stroke-rehabilitation",
      title: "Post-stroke rehabilitation",
      specialtyLabel: "Neurology",
    },
    {
      slug: "liver-transplant",
      title: "Liver transplant programme",
      specialtyLabel: "Gastroenterology",
    },
    {
      slug: "dialysis",
      title: "Dialysis care",
      specialtyLabel: "Nephrology & Urology",
    },
    {
      slug: "asthma-airways-care",
      title: "Asthma & airways care",
      specialtyLabel: "Pulmonology",
    },
    {
      slug: "cataract-surgery",
      title: "Cataract surgery",
      specialtyLabel: "Ophthalmology",
    },
    {
      slug: "maternity-care",
      title: "Maternity care package",
      specialtyLabel: "Maternity & Neonatal",
    },
  ] satisfies readonly HomeFeaturedTreatmentItem[],
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
      "Search hospitals, doctors and treatments, and filter the directory by city, specialty or facility type.",
    href: ROUTES.public.hospitals,
    hrefLabel: "Browse hospitals",
  },
  {
    id: "journey-enquire",
    title: "Raise an enquiry",
    description:
      "Send a free-consultation or international-patient enquiry with your concern, reports and preferred date. Our coordination team picks it up.",
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
      "International patients can explore travel-assistance information and track a medical-tourism case through each stage.",
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
      body: "Accreditation and registration records carry explicit verification states, so patients can see what is confirmed and what is still pending.",
    },
    {
      id: "obj-coordination",
      title: "Request-based coordination",
      body: "Enquiries, appointment requests and medical-tourism support operate as coordination workflows with clear scope before you submit.",
    },
  ],
  scope: [
    "Hospital, doctor and facility discovery across major Indian cities",
    "Treatment and specialty pages describing what listed providers offer",
    "Independent PER / CER / MER ratings with methodology metadata",
    "IUF-supported free consultation and international-patient enquiry flows",
    "Medical tourism programme information and travel-assistance pages",
  ],
  trustPrinciples: [
    "No combined or composite rating is ever displayed — PER, CER and MER remain independent.",
    'Missing scores are shown as "Not yet rated" or "Assessment pending", never as zero.',
    "Ratings and verification states are shown as documented — never blended into a single score.",
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
      body: "IUF identity, copy and institutional claims on this page are maintained in coordination with IUF and updated when programme scope changes.",
    },
  ],
  programmeNote:
    "Programme details and IUF branding follow the approved consultation initiative scope published on the consultation page.",
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
  "Governance ownership and formal policy wording are published with each methodology version; this page describes the documented rating behaviour.",
] as const

/* -------------------------------------------------------------------------
 * For hospitals / for doctors page content
 * ----------------------------------------------------------------------- */

export const forHospitalsSteps: readonly JourneyStep[] = [
  {
    id: "hosp-step-1",
    title: "Express interest",
    description:
      "Submit the institutional interest form below. Our partnerships team reviews your submission and follows up with next steps.",
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
      "Owner and staff partner roles let multiple team members work the same hospital record in the partner portal.",
    icon: undefined,
  },
]

export const forDoctorsSteps: readonly JourneyStep[] = [
  {
    id: "doc-step-1",
    title: "Express interest",
    description:
      "Submit the individual doctor interest form below. Our team reviews credentials and guides you through profile setup.",
  },
  {
    id: "doc-step-2",
    title: "Profile & credentials",
    description:
      "A doctor profile lists qualifications, registration details, languages and hospital associations.",
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
      "Appointments, consultations, credentials and reviews are manageable from the doctor partner portal.",
    icon: undefined,
  },
]

/* -------------------------------------------------------------------------
 * Homepage testimonials (fictional, clearly labelled in the UI)
 * ----------------------------------------------------------------------- */

export const homeTestimonials: readonly Testimonial[] = [
  {
    id: "test-story-1",
    authorName: "Meera S.",
    authorCountry: "Singapore",
    quote:
      "PER and CER shown separately — I could see patient feedback and clinical evidence without a blended star rating. Made shortlisting hospitals in Kerala much easier.",
    hospitalId: "hosp-tranquilvalley-kochi",
    at: "2026-09-12",
    authorPhoto: "https://i.pravatar.cc/96?img=5",
    rating: 5,
    relativeTime: "2 months ago",
  },
  {
    id: "test-story-2",
    authorName: "Rahul K.",
    authorCountry: "United Arab Emirates",
    quote:
      'Verification badges and honest "assessment pending" labels felt straightforward. No pressure to book — just clear next steps for an enquiry.',
    hospitalId: "hosp-sunrise-delhi",
    at: "2026-10-02",
    authorPhoto: "https://i.pravatar.cc/96?img=12",
    rating: 5,
    relativeTime: "6 weeks ago",
  },
  {
    id: "test-story-3",
    authorName: "Anita P.",
    authorCountry: "India",
    quote:
      "Appointment request wording was clear it was not confirmed until the hospital replied. Small detail, but it matched what I expect from a directory.",
    hospitalId: null,
    at: "2026-10-18",
    authorPhoto: "https://i.pravatar.cc/96?img=25",
    rating: 4,
    relativeTime: "3 weeks ago",
  },
  {
    id: "test-story-4",
    authorName: "James W.",
    authorCountry: "United Kingdom",
    quote:
      "Compared cardiologists in Ahmedabad and Bengaluru using MER on doctor cards. Filters by city saved time before I raised a travel enquiry.",
    hospitalId: "hosp-metropulse-ahmedabad",
    at: "2026-08-04",
    authorPhoto: "https://i.pravatar.cc/96?img=33",
    rating: 5,
    relativeTime: "4 months ago",
  },
  {
    id: "test-story-5",
    authorName: "Fatima A.",
    authorCountry: "Oman",
    quote:
      "Medical tourism page outlined visas and stay pointers without pretending they had booked flights for me. Useful orientation before calling the hospital.",
    hospitalId: "hosp-silverlake-bengaluru",
    at: "2026-07-19",
    authorPhoto: "https://i.pravatar.cc/96?img=9",
    rating: 4,
    relativeTime: "5 months ago",
  },
  {
    id: "test-story-6",
    authorName: "Chen L.",
    authorCountry: "China",
    quote:
      "Facility categories helped me find a diagnostic lab in Mumbai separate from hospital listings. Clean directory layout on mobile too.",
    hospitalId: "hosp-sunrise-mumbai",
    at: "2026-06-11",
    authorPhoto: "https://i.pravatar.cc/96?img=44",
    rating: 5,
    relativeTime: "6 months ago",
  },
]

/* -------------------------------------------------------------------------
 * Contact page content
 * ----------------------------------------------------------------------- */

export const contactContent = {
  intro: "Reach the right team. We usually reply within one business day.",
  channels: [
    {
      id: "channel-support",
      title: "Patients",
      body: "Help with search, enquiries or appointments.",
      label: "support@besthospitalindia.com",
      href: "mailto:support@besthospitalindia.com",
    },
    {
      id: "channel-partnership",
      title: "Partners",
      body: "Hospitals and doctors interested in listing.",
      label: "partnerships@besthospitalindia.com",
      href: "mailto:partnerships@besthospitalindia.com",
    },
    {
      id: "channel-consultation",
      title: "Free consultation",
      body: "IUF-supported — use the dedicated request form.",
      label: "Open consultation form",
      href: ROUTES.public.freeConsultation,
    },
  ],
  note: "Not for medical emergencies — contact local emergency services or your doctor.",
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
