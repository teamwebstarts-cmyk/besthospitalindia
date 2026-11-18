import type { Metadata } from "next"
import Link from "next/link"

import { JourneySteps } from "@/features/content/journey-steps"
import { TestimonialCard } from "@/features/content/testimonial-card"
import { FaqList } from "@/features/content/faq-list"
import {
  HomeBleedBand,
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
import { DoctorCard } from "@/features/providers/components/doctor-card"
import { HospitalCard } from "@/features/providers/components/hospital-card"
import { FACILITY_CATEGORY_LABELS } from "@/features/discovery/facility-meta"
import { Button } from "@/components/ui/button"
import { doctorById, facilities, hospitals, specialties } from "@/data"
import { searchDoctors, searchHospitals } from "@/lib/search"
import { ROUTES } from "@/constants/routes"

export const metadata: Metadata = {
  title: "Healthcare Discovery With Personal Care in India",
  description:
    "Discover hospitals, doctors and treatments in India, compare independent PER, CER and MER ratings, and send enquiries for coordinated follow-up.",
}

/** Demo hospital rotation for the featured section (fixture ids, stable order). */
const FEATURED_HOSPITAL_IDS = [
  "hosp-sunrise-delhi",
  "hosp-tranquilvalley-kochi",
  "hosp-goldenpeak-jaipur",
  "hosp-silverlake-bengaluru",
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
  ).filter((h): h is NonNullable<typeof h> => h !== undefined)
  const featuredDoctors = FEATURED_DOCTOR_IDS.map(
    (id) => doctorById[id]
  ).filter((d): d is NonNullable<typeof d> => d !== undefined)

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
    count: facilities.filter((facility) => facility.category === category)
      .length,
  }))

  // Trust bar figures derived from fixtures (counts only, no invented claims).
  const hospitalCount = searchHospitals(undefined, undefined).length
  const doctorCount = searchDoctors(undefined, undefined).length
  const destinationCities = [...new Set(hospitals.map((hospital) => hospital.city))].sort(
    (a, b) => a.localeCompare(b)
  )
  const cityCount = destinationCities.length
  const destinationCityImage = "/images/destinations/city-destination-demo.png"
  const destinationCards = destinationCities.map((city) => ({
    city,
    imageSrc: destinationCityImage,
  }))

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
        "Search takes you to the matching directory with your query applied. Enquiry and appointment forms create a tracked request; our coordination team reviews it and follows up using the contact details you provide.",
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
    <div>
      <HomeHeroSection
        hospitalCount={hospitalCount}
        doctorCount={doctorCount}
        cityCount={cityCount}
      />

      {/* Full-bleed bands — flush stack (no space-y between surfaces) */}
      <div className="flex flex-col">
        <HomeBleedBand surfaceClassName="border-b border-border/70 bg-white">
          <HomeSectionHeading
            title="Browse by specialty"
            description="Ten specialty tiles link into the treatment directory."
            viewAll={{ label: "All treatments", href: ROUTES.public.treatments }}
          />
          <SpecialtyTileGrid specialties={specialties} />
        </HomeBleedBand>

        <MedicalDestinationCities
          layout="embedded"
          destinations={destinationCards}
          title={homeMedicalDestinations.title}
          description={homeMedicalDestinations.description}
        />

        <HomeBleedBand
          aria-labelledby="home-facility-categories-heading"
          surfaceClassName="border-b border-border/70 bg-white"
        >
          <HomeSectionHeading
            headingId="home-facility-categories-heading"
            title="Facility categories"
            description="Beyond hospitals: the kinds of facilities listed in our directory."
            viewAll={{ label: "All facilities", href: ROUTES.public.facilities }}
          />
          <FacilityCategoryGrid categories={facilityCategories} />
        </HomeBleedBand>

        <HomeBleedBand
          aria-labelledby="home-featured-hospitals-heading"
          surfaceClassName="border-b border-border/70 bg-background"
        >
          <HomeSectionHeading
            headingId="home-featured-hospitals-heading"
            title="Featured hospitals"
            description="Each card shows independent Patient Experience (PER) and Clinical Expertise (CER) ratings — never a combined score."
            viewAll={{ label: "All hospitals", href: ROUTES.public.hospitals }}
          />
          {featuredHospitals.length === 0 ? (
            <p className="rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
              No featured hospitals are available to show right now.
            </p>
          ) : (
            <div className="grid items-stretch gap-4 sm:grid-cols-2">
              {featuredHospitals.map((hospital) => (
                <HospitalCard key={hospital.id} hospital={hospital} layout="stacked" className="h-full" />
              ))}
            </div>
          )}
        </HomeBleedBand>

        <HomeBleedBand
          aria-labelledby="home-featured-doctors-heading"
          surfaceClassName="border-b border-border/70 bg-white"
        >
          <HomeSectionHeading
            headingId="home-featured-doctors-heading"
            title="Find the right doctor"
            description="Doctor cards show Patient Experience (PER) and Medical Expertise (MER) as two separate ratings with their own evidence metadata."
            viewAll={{ label: "All doctors", href: ROUTES.public.doctors }}
          />
          {featuredDoctors.length === 0 ? (
            <p className="rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
              No featured doctors are available to show right now.
            </p>
          ) : (
            <div className="grid items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
              {featuredDoctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} className="h-full" />
              ))}
            </div>
          )}
        </HomeBleedBand>

        {/* <HomeLowestQuotesSection /> — restore when home treatments grid is required */}

        <HomePatientServicesSection />

        <HomeBleedBand
          aria-labelledby="home-how-it-works-heading"
          surfaceClassName="border-b border-border/70 bg-white"
        >
          <HomeSectionHeading
            headingId="home-how-it-works-heading"
            title="How it works"
            description="Four steps from first search to supported follow-up."
            viewAll={{
              label: "How it works in detail",
              href: ROUTES.public.howItWorks,
            }}
          />
          <div className="rounded-3xl bg-primary/[0.045] p-4 ring-1 ring-primary/10 sm:p-5 lg:p-6">
            <div className="space-y-10 sm:space-y-12">
              <JourneySteps steps={patientJourneySteps} />
              <MedicalTourismBlock />
              <IufConsultationCta />
            </div>
          </div>
        </HomeBleedBand>

        <HomeBleedBand
          aria-labelledby="home-testimonials-heading"
          surfaceClassName="border-b border-border/70 bg-background"
        >
          <HomeSectionHeading
            headingId="home-testimonials-heading"
            title="Patient stories"
            description="Experiences shared by patients who used the platform to find care. Individual outcomes vary — stories are not medical advice."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {homeTestimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </HomeBleedBand>

        <HomeBleedBand
          aria-labelledby="home-faq-heading"
          surfaceClassName="border-t border-border/70 bg-white"
        >
          <HomeSectionHeading
            headingId="home-faq-heading"
            title="Frequently Asked Questions (FAQ's)"
            description="Short answers about how the platform presents providers, ratings and requests."
          />
          <FaqList faqs={faqItems} variant="cards" />
        </HomeBleedBand>
      </div>
    </div>
  )
}
