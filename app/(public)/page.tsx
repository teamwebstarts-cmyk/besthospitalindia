import type { Metadata } from "next"
import { JourneyStepsAnimated } from "@/features/content/journey-steps-animated"
import { ScrollReveal } from "@/components/motion/scroll-reveal"
import { TestimonialsMarquee } from "@/features/content/testimonials-marquee"
import { FaqList } from "@/features/content/faq-list"
import {
  HomeBleedBand,
  homeMobileCardRailClassName,
  HomeSectionHeading,
  MedicalDestinationCities,
  SpecialtyTileGrid,
  FacilityCategoryGrid,
  MedicalTourismBlock,
  // HomeLowestQuotesSection, // restore when home treatments grid is required
  HomePatientServicesSection,
  IufConsultationCta,
} from "@/features/content/home-sections"
import { HomeHeroSection } from "@/features/content/home-hero-section"
import {
  homeMedicalDestinations,
  patientJourneySteps,
  homeTestimonials,
} from "@/features/content/home-content"
import { homeMedicalDestinationStates } from "@/features/content/medical-destination-states"
import { FeaturedHospitalsSection } from "@/features/content/featured-hospitals/featured-hospitals-section"
import { FindDoctorsSection } from "@/features/content/find-doctors/find-doctors-section"
import { FACILITY_CATEGORY_LABELS } from "@/features/discovery/facility-meta"
import { doctorById, facilities, hospitals, specialties } from "@/data"
import { publishedHospitals } from "@/lib/catalogue/published"
import { isCataloguePublic } from "@/lib/catalogue/store"
import { searchDoctors, searchHospitals } from "@/lib/search"
import { ROUTES } from "@/constants/routes"

export const metadata: Metadata = {
  title: "Healthcare Discovery With Personal Care in India",
  description:
    "Discover hospitals, doctors and facilities in India, compare independent PER, CER and MER ratings, and send enquiries for coordinated follow-up.",
}

/** Home featured band — six demo cards (3 × 2 grid). */
const FEATURED_HOSPITAL_IDS = [
  "hosp-sunrise-delhi",
  "hosp-tranquilvalley-kochi",
  "hosp-silverlake-bengaluru",
  "hosp-goldenpeak-jaipur",
  "hosp-sunrise-mumbai",
  "hosp-metropulse-ahmedabad",
] as const

/** Demo doctor rotation for the discovery section (fixture ids, stable order). */
const FEATURED_DOCTOR_IDS = [
  "doc-aarav-mehta",
  "doc-meera-joshi",
  "doc-priya-nair",
] as const

const facilityCategoryDescriptions: Record<string, string> = {
  hospital: "Multispeciality and single-specialty hospital listings",
  specialty_centre: "Focused single-specialty centres",
  diagnostic_lab: "Diagnostic and laboratory services",
  rehabilitation: "Rehabilitation and recovery services",
  wellness: "Wellness and preventive-care services",
  medical_tourism: "Medical-tourism facilitator listings",
}

export default function HomePage() {
  // Featured selections resolve typed fixture records from @/data by id; no
  // record arrays are hardcoded here and ordering stays deterministic.
  const featuredHospitals = FEATURED_HOSPITAL_IDS.map((id) =>
    hospitals.find((h) => h.id === id)
  ).filter((h): h is NonNullable<typeof h> => h !== undefined && isCataloguePublic("hospital", h.id))
  const featuredDoctors = FEATURED_DOCTOR_IDS.map(
    (id) => doctorById[id]
  ).filter((d): d is NonNullable<typeof d> => d !== undefined && isCataloguePublic("doctor", d.id))

  // Category counts from the frozen facility fixtures (per-category filter).
  const facilityCategories = (
    Object.keys(
      FACILITY_CATEGORY_LABELS
    ) as (keyof typeof FACILITY_CATEGORY_LABELS)[]
  ).map((category) => ({
    category,
    label: FACILITY_CATEGORY_LABELS[category],
    description: facilityCategoryDescriptions[category] ?? "",
    href: `${ROUTES.public.facilities}?category=${encodeURIComponent(category)}`,
    count: facilities.filter((facility) => facility.category === category && isCataloguePublic("facility", facility.id))
      .length,
  }))

  // Trust bar figures derived from fixtures (counts only, no invented claims).
  const hospitalCount = searchHospitals(undefined, undefined).length
  const doctorCount = searchDoctors(undefined, undefined).length
  const stateCount = [...new Set(hospitals.filter((hospital) => isCataloguePublic("hospital", hospital.id)).map((hospital) => hospital.state))].length
  const hospitalCities = [...new Set([
    ...hospitals.filter((hospital) => isCataloguePublic("hospital", hospital.id)).map((hospital) => hospital.city),
    ...publishedHospitals().map((hospital) => hospital.city),
  ])].sort((a, b) => a.localeCompare(b))

  const faqItems = [
    {
      id: "faq-home-1",
      question: "Is the information on BestHospitalIndia reliable?",
      answer:
        "Provider profiles, ratings and reviews come from listed hospitals and doctors and our assessment workflows. Ratings without an approved score stay unpublished — they are never shown as zero. Always confirm care decisions with a qualified clinician.",
      category: "general" as const,
      order: 1,
    },
    {
      id: "faq-home-2",
      question: "What do PER, CER and MER mean?",
      answer:
        "They are three independent ratings: the Patient Experience Rating (from patient feedback), the Clinical Expertise Rating for hospitals (from verified evidence) and the Medical Expertise Rating for doctors (from credential and registration checks). They are shown separately and never combined.",
      category: "ratings" as const,
      order: 2,
    },
    {
      id: "faq-home-3",
      question: "What happens when I search or send an enquiry?",
      answer:
        "Search opens the matching directory. A query is stored for our admin team and the Delhi or Indore desk. It is not sent to a hospital or a doctor.",
      category: "patients" as const,
      order: 3,
    },
    {
      id: "faq-home-4",
      question: "Is the free consultation actually free?",
      answer:
        "The consultation initiative is an IUF-supported free consultation. Its scope, what is provided at no charge and what is excluded are listed on the consultation page before you submit a request.",
      category: "patients" as const,
      order: 4,
    },
    {
      id: "faq-home-5",
      question: "Does the platform give medical advice?",
      answer:
        "No. BestHospitalIndia is a discovery and coordination platform. It does not diagnose, treat or recommend treatment — see the medical disclaimer for the full boundary statement.",
      category: "general" as const,
      order: 5,
    },
  ]

  return (
    <div className="flex flex-col">
      <section
        aria-labelledby="home-find-heading"
        className="order-1 border-b border-border/70 bg-white px-4 py-6 lg:order-2"
      >
        <div className="mx-auto w-full max-w-3xl">
          <h2 id="home-find-heading" className="mb-3 text-lg font-semibold tracking-tight lg:text-2xl">
            Find hospitals
          </h2>
          <form action={ROUTES.public.hospitals} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <label className="space-y-1 text-sm">
              <span className="font-medium">City</span>
              <select name="city" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" defaultValue="">
                <option value="">All cities</option>
                {hospitalCities.map((cityName) => (
                  <option key={cityName} value={cityName}>{cityName}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">Specialty</span>
              <select name="specialty" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" defaultValue="">
                <option value="">All specialties</option>
                {specialties.map((specialty) => (
                  <option key={specialty.id} value={specialty.id}>{specialty.name}</option>
                ))}
              </select>
            </label>
            <button type="submit" className="h-10 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground">
              Find hospitals
            </button>
          </form>
        </div>
      </section>
      <div className="order-2 lg:order-1">
      <HomeHeroSection
        hospitalCount={hospitalCount}
        doctorCount={doctorCount}
        stateCount={stateCount}
      />
      </div>

      {/* Full-bleed bands — flush stack (no space-y between surfaces) */}
      <div className="order-3 flex flex-col">
        <HomeBleedBand surfaceClassName="border-b border-border/70 bg-white">
          <ScrollReveal>
            <HomeSectionHeading
              title="Browse by specialty"
              description="Ten specialty tiles link into the treatment directory."
            />
          </ScrollReveal>
          <SpecialtyTileGrid specialties={specialties} />
        </HomeBleedBand>

        <MedicalDestinationCities
          layout="embedded"
          destinations={homeMedicalDestinationStates}
          title={homeMedicalDestinations.title}
          description={homeMedicalDestinations.description}
          descriptionMobile={homeMedicalDestinations.descriptionMobile}
        />

        <HomeBleedBand
          aria-labelledby="home-facility-categories-heading"
          surfaceClassName="border-b border-border/70 bg-white"
        >
          <ScrollReveal>
            <HomeSectionHeading
              headingId="home-facility-categories-heading"
              title="Facility categories"
              description="Beyond hospitals: the kinds of facilities listed in our directory."
              descriptionMobile="Labs, rehab, wellness and more in the directory."
            />
          </ScrollReveal>
          <div className={homeMobileCardRailClassName}>
            <FacilityCategoryGrid categories={facilityCategories} />
          </div>
        </HomeBleedBand>

        <FeaturedHospitalsSection hospitals={featuredHospitals} />

        <FindDoctorsSection doctors={featuredDoctors} />

        {/* <HomeLowestQuotesSection /> — restore when home treatments grid is required */}

        <HomePatientServicesSection />

        <HomeBleedBand
          aria-labelledby="home-how-it-works-heading"
          surfaceClassName="border-b border-border/70 bg-white"
        >
          <ScrollReveal>
            <HomeSectionHeading
              headingId="home-how-it-works-heading"
              title="How it works"
              description="Four steps from first search to supported follow-up."
            />
          </ScrollReveal>
          <ScrollReveal delayMs={60}>
          <div className="rounded-3xl bg-primary/[0.045] p-4 ring-1 ring-primary/10 sm:p-5 lg:p-6">
            <div className="space-y-10 sm:space-y-12">
              <JourneyStepsAnimated steps={patientJourneySteps} />
              <MedicalTourismBlock />
              <div className="max-lg:hidden">
                <IufConsultationCta />
              </div>
            </div>
          </div>
          </ScrollReveal>
        </HomeBleedBand>

        <HomeBleedBand
          aria-labelledby="home-testimonials-heading"
          surfaceClassName="border-b border-border/70 bg-background"
        >
          <ScrollReveal>
            <HomeSectionHeading
              headingId="home-testimonials-heading"
              title="Patient stories"
              description="Reviews-style stories from patients who used the directory - outcomes vary; demo content only."
            />
          </ScrollReveal>
          <ScrollReveal delayMs={60}>
            <TestimonialsMarquee testimonials={homeTestimonials} />
          </ScrollReveal>
          <p className="text-center text-xs text-muted-foreground">
            Demo patient stories — fictional accounts for layout only, not medical advice.
          </p>
        </HomeBleedBand>

        <HomeBleedBand
          aria-labelledby="home-faq-heading"
          surfaceClassName="border-t border-border/70 bg-white"
        >
          <ScrollReveal>
            <HomeSectionHeading
              headingId="home-faq-heading"
              title="Frequently Asked Questions (FAQ's)"
              description="Short answers about how the platform presents providers, ratings and requests."
            />
          </ScrollReveal>
          <ScrollReveal delayMs={80}>
            <FaqList faqs={faqItems} variant="cards" />
          </ScrollReveal>
        </HomeBleedBand>
      </div>
    </div>
  )
}
