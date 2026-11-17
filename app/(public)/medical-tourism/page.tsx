import type { Metadata } from "next"
import Link from "next/link"
import {
  BanknoteIcon,
  BedDoubleIcon,
  CarIcon,
  FileCheck2Icon,
  LanguagesIcon,
  MessagesSquareIcon,
  PlaneIcon,
  StethoscopeIcon,
} from "lucide-react"

import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionHeading } from "@/components/shared/section-heading"
import { ROUTES } from "@/constants/routes"
import { specialties, treatments } from "@/data"
import {
  EnquiryCta,
  FaqList,
  JourneySteps,
  SupportServiceCards,
  TreatmentCard,
} from "@/features/medical-tourism"
import {
  doctorIdsForTreatment,
  hospitalIdsForTreatment,
  specialtyForTreatment,
} from "@/features/medical-tourism/selectors"

/**
 * /medical-tourism — international patient landing (Agent A06).
 *
 * Spec: implementation/09-medical-tourism.md. Structure: hero → treatments →
 * destination/city choices → support services → journey steps → enquiry CTA →
 * FAQ. All data from typed fixtures; ratings never shown here (none of the
 * fixture entities on this page carry ratings). No clinical claims, no
 * guaranteed prices/outcomes — informational demo copy only.
 */

export const metadata: Metadata = {
  title: "Medical Tourism Support",
  description:
    "Explore demo treatment listings, destination cities and international patient support information on BestHospitalIndia. Demo platform — no real medical services.",
  alternates: { canonical: ROUTES.public.medicalTourism },
}

const JOURNEY_STEPS = [
  {
    title: "Share your case",
    description:
      "Submit the international patient enquiry with your details, specialty and any report labels you want to list.",
  },
  {
    title: "Information review",
    description:
      "In the future backend, a coordinator would review the enquiry. On this demo platform the flow ends at a local confirmation.",
  },
  {
    title: "Provider shortlist",
    description:
      "Browse hospital and doctor profiles yourself — the platform is a discovery directory, not a booking service.",
  },
  {
    title: "Plan your travel",
    description:
      "Read travel-assistance information for accommodation, documents and transport. Nothing is booked or guaranteed.",
  },
] as const

const SUPPORT_SERVICES = [
  {
    icon: LanguagesIcon,
    title: "Language support information",
    description:
      "Doctor fixtures list spoken languages so you can shortlist providers who may communicate in your language.",
    caveat: "Interpretation services are not arranged by the platform.",
  },
  {
    icon: FileCheck2Icon,
    title: "Visa & document pointers",
    description:
      "General guidance on the kinds of documents international patients commonly prepare for treatment travel.",
    caveat: "Informational only — not legal or immigration advice.",
  },
  {
    icon: BedDoubleIcon,
    title: "Accommodation guidance",
    description:
      "Orientation on staying near the demo provider cities listed on this platform.",
    caveat: "No rooms are held, booked or price-quoted.",
  },
  {
    icon: CarIcon,
    title: "Local transport information",
    description:
      "General orientation for moving between airports and the demo hospital cities.",
    caveat: "No pickup or transfer is arranged.",
  },
  {
    icon: BanknoteIcon,
    title: "Cost planning context",
    description:
      "Understand what kinds of costs (consultation, procedure, stay) are typically planned for — no prices are quoted on this platform.",
    caveat: "Estimates come only from providers, never from this site.",
  },
  {
    icon: MessagesSquareIcon,
    title: "Enquiry as the first step",
    description:
      "The demo enquiry records your interest locally and explains what the future backend flow would do next.",
    caveat: "Demo only — nothing is submitted to anyone.",
  },
] as const

const FAQ_ITEMS = [
  {
    question: "Does BestHospitalIndia provide treatment or medical advice?",
    answer:
      "No. The platform is a demo discovery directory: it lists fictional providers and treatments and never offers diagnosis, treatment plans, outcomes or prices.",
  },
  {
    question: "What happens after I submit the international patient enquiry?",
    answer:
      "On this demo platform, nothing leaves your browser. You see a local confirmation with a demo reference number. Admin review, coordinator assignment and provider responses are documented future backend states.",
  },
  {
    question: "Are the hospitals, doctors and ratings real?",
    answer:
      "No — every hospital, doctor, facility, rating and review on the platform is fictional demo data created to exercise the interface.",
  },
  {
    question: "Can the platform book my travel or accommodation?",
    answer:
      "No. Travel-assistance pages are informational only. The platform does not book, arrange or guarantee flights, hotels, transfers or visa services.",
  },
  {
    question: "How do I choose a specialty or treatment?",
    answer:
      "Start from the treatments listing to browse by specialty, or open any treatment page to see which demo providers list it. Always verify real-world care with qualified professionals.",
  },
] as const

/** City metadata is demo copy aligned with the hospital fixture cities. */
const DESTINATIONS = [
  { city: "New Delhi", state: "Delhi", note: "Multispeciality demo providers" },
  { city: "Mumbai", state: "Maharashtra", note: "Multispeciality demo providers" },
  { city: "Chennai", state: "Tamil Nadu", note: "Kidney & transplant demo focus" },
  { city: "Bengaluru", state: "Karnataka", note: "Large demo campus provider" },
  { city: "Kochi", state: "Kerala", note: "Demo institute, strongest demo ratings" },
  { city: "Jaipur", state: "Rajasthan", note: "Women & children demo focus" },
] as const

export default function MedicalTourismPage() {
  const featuredTreatments = treatments.slice(0, 6)

  return (
    <div className="space-y-12 py-8 sm:space-y-16">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Medical Tourism" }]}
        className="mb-2"
      />

      {/* Hero */}
      <section aria-labelledby="mt-hero-heading" className="space-y-4">
        <span className="inline-flex items-center gap-1.5 rounded-4xl bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <PlaneIcon aria-hidden className="size-3.5" />
          For international patients — demo platform
        </span>
        <h1 id="mt-hero-heading" className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Explore care options in India and plan your visit — with clear demo
          boundaries
        </h1>
        <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">
          BestHospitalIndia helps you discover treatments, specialties and
          fictional demo providers across Indian cities, and explains what
          international patient support would look like. This is a
          demonstration platform: no medical services, bookings, prices or
          advice are provided, and every provider you see is fictional demo
          data.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button size="lg" render={<Link href={ROUTES.public.internationalPatientEnquiry} />}>
            <MessagesSquareIcon data-icon="inline-start" aria-hidden />
            Start an enquiry
          </Button>
          <Button
            size="lg"
            variant="outline"
            render={<Link href={ROUTES.public.treatments} />}
          >
            Browse treatments
          </Button>
        </div>
      </section>

      {/* Treatments discovery */}
      <section aria-label="Treatment discovery" className="space-y-4">
        <SectionHeading
          as="h2"
          title="Treatments international patients commonly explore"
          description="A sample of the demo treatment taxonomy. Open any treatment to see which demo hospitals and doctors list it — no outcomes, guarantees or prices are shown anywhere."
          action={
            <Button variant="outline" render={<Link href={ROUTES.public.treatments} />}>
              View all treatments
            </Button>
          }
        />
        {featuredTreatments.length === 0 ? (
          <p className="rounded-lg border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
            No treatments are available in the demo fixtures yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTreatments.map((treatment) => (
              <TreatmentCard
                key={treatment.id}
                treatment={treatment}
                specialty={specialtyForTreatment(treatment)}
                hospitalCount={hospitalIdsForTreatment(treatment.id).length}
                doctorCount={doctorIdsForTreatment(treatment.id).length}
              />
            ))}
          </div>
        )}
      </section>

      {/* Specialty quick browse */}
      <section aria-label="Browse by specialty" className="space-y-4">
        <SectionHeading
          as="h2"
          title="Browse by specialty"
          description="Ten demo specialties organise the treatment taxonomy. Selecting one filters the treatments listing."
        />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {specialties.map((specialty) => (
            <li key={specialty.id}>
              <Card size="sm" className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <StethoscopeIcon aria-hidden className="size-4 text-muted-foreground" />
                    {specialty.name}
                  </CardTitle>
                  <CardDescription>{specialty.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    size="sm"
                    render={
                      <Link
                        href={`${ROUTES.public.treatments}?specialty=${encodeURIComponent(specialty.id)}`}
                      />
                    }
                  >
                    View treatments
                    <span className="sr-only"> in {specialty.name}</span>
                  </Button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {/* Destination / city choices */}
      <section aria-label="Demo destination cities" className="space-y-4">
        <SectionHeading
          as="h2"
          title="Demo destination cities"
          description="Fictional demo providers are distributed across Indian cities. This is orientation for the demo taxonomy — not travel or medical advice."
        />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DESTINATIONS.map((destination) => (
            <li
              key={destination.city}
              className="rounded-xl border bg-card p-4 shadow-xs"
            >
              <p className="font-medium text-foreground">
                {destination.city}, {destination.state}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">{destination.note}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Support services */}
      <section aria-label="International patient support" className="space-y-4">
        <SectionHeading
          as="h2"
          title="International patient support — informational only"
          description="What the platform explains, and what it explicitly does not do. Nothing on this platform is booked, arranged or guaranteed."
        />
        <SupportServiceCards services={SUPPORT_SERVICES} />
        <p className="text-sm text-muted-foreground">
          Read the full{" "}
          <Link
            href={ROUTES.public.medicalTourismTravelAssistance}
            className="underline underline-offset-4 hover:text-foreground"
          >
            travel assistance information
          </Link>
          .
        </p>
      </section>

      {/* Journey steps */}
      <section aria-label="International patient journey" className="space-y-4">
        <SectionHeading
          as="h2"
          title="What the international patient journey looks like"
          description="Four steps on this platform, with the future backend stages documented but never simulated."
        />
        <JourneySteps
          steps={JOURNEY_STEPS}
          footnote="Steps 2 onward (admin review, coordinator assignment, provider shortlisting by the platform) are future backend capabilities shown here for orientation only."
        />
      </section>

      {/* Enquiry CTA */}
      <EnquiryCta
        title="Ready to record a demo enquiry?"
        description="Share patient details, specialty and travel preferences in the international patient enquiry form. The demo records your entries locally and shows a reference number — nothing is submitted to any provider."
        secondaryLabel="See travel assistance information"
        secondaryHref={ROUTES.public.medicalTourismTravelAssistance}
      />

      {/* FAQ */}
      <section aria-label="Frequently asked questions" className="space-y-4">
        <SectionHeading as="h2" title="Frequently asked questions" />
        <FaqList items={FAQ_ITEMS} />
      </section>

      {/* Disclaimer */}
      <p className="rounded-lg border bg-muted/30 p-4 text-xs text-muted-foreground">
        Demo notice: BestHospitalIndia is a fictional demonstration platform.
        All providers, ratings and reviews are invented. Content here is
        informational only and is not medical advice — consult qualified
        professionals for real care decisions.
      </p>
    </div>
  )
}
