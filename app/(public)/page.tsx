import type { Metadata } from "next"
import Link from "next/link"
import {
  CircleCheckIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { ContentLinkGroup } from "@/features/content/content-link-group"
import { JourneySteps } from "@/features/content/journey-steps"
import { TestimonialCard } from "@/features/content/testimonial-card"
import { FaqList } from "@/features/content/faq-list"
import {
  HomeSectionHeading,
  SpecialtyTileGrid,
  FacilityCategoryGrid,
  MedicalTourismBlock,
  TrustValuesBlock,
  IufConsultationCta,
} from "@/features/content/home-sections"
import { HeroSearchPanel } from "@/features/content/hero-panel"
import {
  homeHero,
  homeSearchCategories,
  patientJourneySteps,
  homeTestimonials,
  homeTrustIntro,
} from "@/features/content/home-content"
import { DoctorCard } from "@/features/providers/components/doctor-card"
import { HospitalCard } from "@/features/providers/components/hospital-card"
import { GlobalSearch } from "@/features/discovery/global-search"
import { FACILITY_CATEGORY_LABELS } from "@/features/discovery/facility-meta"
import { Button } from "@/components/ui/button"
import { doctorById, facilities, hospitals, specialties } from "@/data"
import { searchDoctors, searchHospitals } from "@/lib/search"
import { ROUTES } from "@/constants/routes"

export const metadata: Metadata = {
  title: "Find the Right Hospital, Doctor or Treatment in India",
  description:
    "Search demo hospitals, doctors and treatments across India; compare independent PER, CER and MER ratings with visible methodology metadata; explore medical tourism support and request a free consultation. Fictional demo data throughout.",
}

/** Demo hospital rotation for the featured section (fixture ids, stable order). */
const FEATURED_HOSPITAL_IDS = [
  "hosp-sunrise-delhi",
  "hosp-tranquilvalley-kochi",
  "hosp-goldenpeak-jaipur",
] as const

/** Demo doctor rotation for the discovery section (fixture ids, stable order). */
const FEATURED_DOCTOR_IDS = [
  "doc-aarav-mehta",
  "doc-meera-joshi",
  "doc-priya-nair",
] as const

const globalSearchRoutes: Record<
  "hospitals" | "doctors" | "treatments" | "facilities",
  string
> = {
  hospitals: ROUTES.public.hospitals,
  doctors: ROUTES.public.doctors,
  treatments: ROUTES.public.treatments,
  facilities: ROUTES.public.facilities,
}

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
    label: FACILITY_CATEGORY_LABELS[category],
    description: facilityCategoryDescriptions[category] ?? "",
    href: `${ROUTES.public.facilities}?category=${encodeURIComponent(category)}`,
    count: facilities.filter((facility) => facility.category === category)
      .length,
  }))

  // Trust bar figures derived from fixtures (counts only, no invented claims).
  const hospitalCount = searchHospitals(undefined, undefined).length
  const doctorCount = searchDoctors(undefined, undefined).length
  const cityCount = new Set(hospitals.map((h) => h.city)).size

  const faqItems = [
    {
      id: "faq-home-1",
      question: "Is the information on BestHospitalIndia real?",
      answer:
        "No. This is a demo build: every hospital, doctor, facility, rating, review and story is fictional demo data created to exercise the platform design. Nothing here describes real providers or outcomes.",
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
        "Search routes you to the matching demo directory with your query applied. Enquiry and appointment forms simulate a submission locally and show a demo confirmation — nothing is sent, stored or followed up on.",
      category: "patients" as const,
      order: 3,
    },
    {
      id: "faq-home-4",
      question: "Is the free consultation actually free?",
      answer:
        "The consultation initiative is described as an IUF-supported free consultation. Its scope, what is provided at no charge and what is excluded are listed on the consultation page before any request is made. In this demo, no request is actually submitted.",
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
    <div className="pb-16">
      {/* ------------------------------------------------ hero + search */}
      <section
        className="border-b bg-gradient-to-br from-primary/[0.08] via-background to-cta/[0.05] py-10 sm:py-14 lg:py-16"
        aria-label="Search the platform"
      >
        <div className="grid min-w-0 items-start gap-8 md:gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-8">
          <HeroSearchPanel
            heading={homeHero.heading}
            subheading={homeHero.subheading}
            searchSlot={
              <GlobalSearch
                defaultEntityType="hospitals"
                routes={globalSearchRoutes}
                queryLabel="Search hospitals, doctors or treatments"
                className="flex w-full flex-col gap-2 sm:flex-row"
              />
            }
            quickLinks={homeSearchCategories.map((category) => ({
              label: `Browse ${category.label.toLowerCase()}`,
              href: globalSearchRoutes[category.value],
            }))}
            trustLine={`${hospitalCount} demo hospitals · ${doctorCount} demo doctors · ${cityCount} demo cities`}
          />
          <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <div className="flex h-full flex-col justify-center gap-4 rounded-xl border bg-card p-5 shadow-lg ring-1 ring-foreground/5 sm:p-6 lg:p-8">
              <p className="flex items-center gap-2 text-sm font-semibold tracking-wide text-primary uppercase">
                <ShieldCheckIcon aria-hidden className="size-4" />
                Independent ratings, honestly shown
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Hospital cards carry separate Patient Experience and Clinical
                Expertise modules; doctor cards separate experience from medical
                expertise. Where no approved score exists, you will see “Not yet
                rated” — never a zero.
              </p>
              <ul className="grid gap-2.5 text-sm">
                {[
                  `${hospitalCount} demo hospitals across ${cityCount} demo cities`,
                  `${doctorCount} demo doctors with independent PER + MER modules`,
                ].map((line) => (
                  <li key={line} className="flex items-center gap-2 text-foreground/90">
                    <CircleCheckIcon aria-hidden className="size-4 shrink-0 text-primary" />
                    {line}
                  </li>
                ))}
              </ul>
              <Button
                variant="cta"
                className="mt-1 w-full rounded-full px-6 text-base font-semibold shadow-md"
                render={<Link href={ROUTES.public.freeConsultation} />}
              >
                Get a FREE Consultation
                <span aria-hidden>→</span>
              </Button>
              <p className="text-xs text-muted-foreground">
                All figures on this page are fictional demo values.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <div className="mt-16 space-y-20">
        {/* ------------------------------------------------ specialty tiles */}
        <HomeSectionHeading
          title="Browse by specialty"
          description="Ten demo specialty tiles link into the treatment directory."
          viewAll={{ label: "All treatments", href: ROUTES.public.treatments }}
        />
        <SpecialtyTileGrid specialties={specialties} />

        {/* ------------------------------------------------ facility categories */}
        <HomeSectionHeading
          title="Facility categories"
          description="Beyond hospitals: the kinds of facilities listed in the demo directory."
          viewAll={{ label: "All facilities", href: ROUTES.public.facilities }}
        />
        <FacilityCategoryGrid categories={facilityCategories} />

        {/* ------------------------------------------------ featured hospitals */}
        <HomeSectionHeading
          title="Featured hospitals"
          description="Each card shows independent Patient Experience (PER) and Clinical Expertise (CER) ratings — never a combined score."
          viewAll={{ label: "All hospitals", href: ROUTES.public.hospitals }}
        />
        {featuredHospitals.length === 0 ? (
          <p className="rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
            No featured hospitals are configured in the demo data yet.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featuredHospitals.map((hospital) => (
              <HospitalCard key={hospital.id} hospital={hospital} />
            ))}
          </div>
        )}

        {/* ------------------------------------------------ doctor discovery */}
        <HomeSectionHeading
          title="Find the right doctor"
          description="Doctor cards show Patient Experience (PER) and Medical Expertise (MER) as two separate ratings with their own evidence metadata."
          viewAll={{ label: "All doctors", href: ROUTES.public.doctors }}
        />
        {featuredDoctors.length === 0 ? (
          <p className="rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
            No featured doctors are configured in the demo data yet.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featuredDoctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        )}

        {/* ------------------------------------------------ journey steps */}
        <HomeSectionHeading
          title="How it works"
          description="Four steps from first search to supported follow-up."
          viewAll={{
            label: "How it works in detail",
            href: ROUTES.public.howItWorks,
          }}
        />
        {/* Reference-matched light-blue process zone: the how-it-works,
            medical-tourism and consultation cluster sits on a soft primary
            tint with white cards inside (presentational wrapper only). */}
        <div className="rounded-3xl bg-primary/[0.045] p-4 ring-1 ring-primary/10 sm:p-6 lg:p-8">
          <div className="space-y-16">
            <JourneySteps steps={patientJourneySteps} />

            {/* ------------------------------------------------ medical tourism */}
            <MedicalTourismBlock />

            {/* ------------------------------------------------ IUF CTA */}
            <IufConsultationCta />
          </div>
        </div>

        {/* ------------------------------------------------ trust values */}
        <HomeSectionHeading
          title="Why BestHospitalIndia"
          description={homeTrustIntro}
        />
        <TrustValuesBlock />

        {/* ------------------------------------------------ testimonials */}
        <HomeSectionHeading
          title="Patient stories (fictional)"
          description="The stories below are fictional demo fixtures created to illustrate the testimonial layout. They do not describe real patients, providers or outcomes."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {homeTestimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>

        {/* ------------------------------------------------ FAQ */}
        <HomeSectionHeading
          title="Frequently asked questions"
          description="Short answers about how the demo platform presents providers, ratings and requests."
        />
        <FaqList faqs={faqItems} />

        {/* ------------------------------------------------ related links */}
        <ContentLinkGroup
          title="Explore the platform"
          description="The main public areas of the demo build."
          links={[
            { label: "Hospitals directory", href: "/hospitals" },
            { label: "Doctors directory", href: "/doctors" },
            { label: "Facilities directory", href: "/facilities" },
            { label: "Treatments directory", href: "/treatments" },
            { label: "Medical tourism programme", href: "/medical-tourism" },
            { label: "Rating methodology", href: "/rating-methodology" },
          ]}
        />
      </div>
    </div>
  )
}
