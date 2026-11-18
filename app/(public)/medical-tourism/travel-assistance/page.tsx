import type { Metadata } from "next"
import {
  BedDoubleIcon,
  BusFrontIcon,
  CarIcon,
  FileCheck2Icon,
  LanguagesIcon,
  PlaneIcon,
  StampIcon,
  TrainFrontIcon,
} from "lucide-react"

import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { SectionHeading } from "@/components/shared/section-heading"
import { ROUTES } from "@/constants/routes"
import { EnquiryCta, FaqList, JourneySteps, SupportServiceCards } from "@/features/medical-tourism"

/**
 * /medical-tourism/travel-assistance — informational page (Agent A06).
 *
 * Spec: implementation/13-travel-assistance.md. Sections: accommodation,
 * airport pickup, visa/document assistance, local transport, language
 * assistance, enquiry CTA, FAQ. Explicit "no guaranteed service" framing
 * throughout: the platform shares information, it never books, arranges or
 * guarantees anything. Demo contact data only.
 */

export const metadata: Metadata = {
  title: "Travel Assistance Information",
  description:
    "Informational guidance on accommodation, airport pickup, visa and document preparation and local transport for international patients. No services are booked or guaranteed by the platform.",
  alternates: { canonical: ROUTES.public.medicalTourismTravelAssistance },
}

const SERVICES = [
  {
    icon: BedDoubleIcon,
    title: "Accommodation guidance",
    description:
      "General orientation on the kinds of stays international patients commonly look for near major hospital cities — serviced apartments, guest houses and budget hotels.",
    caveat:
      "The platform does not list real properties, hold rooms or quote prices. Availability and tariffs are never guaranteed.",
  },
  {
    icon: PlaneIcon,
    title: "Airport pickup — information only",
    description:
      "How airport transfers are typically organised in major cities: prepaid taxi counters, app-based cabs and hospital-arranged transport where a provider offers it.",
    caveat:
      "No pickup, transfer or driver is ever arranged by this platform. Any such service would come from a real provider directly — never assumed or guaranteed here.",
  },
  {
    icon: StampIcon,
    title: "Visa & document assistance — informational",
    description:
      "General checklists of the documents international patients commonly prepare: passport validity, medical visa categories, invitation letters and report translations.",
    caveat:
      "Informational pointers only — not legal, immigration or consular advice. Requirements vary and change; always confirm with official authorities.",
  },
  {
    icon: CarIcon,
    title: "Local transport information",
    description:
      "Orientation on moving around major cities: metro networks, app-based cabs, auto-rickshaws and intercity trains.",
    caveat:
      "No bookings, schedules or fares are provided; transport services are never guaranteed.",
  },
  {
    icon: LanguagesIcon,
    title: "Language assistance — what to expect",
    description:
      "Doctor profiles list spoken languages, which can help you shortlist providers. Many hospitals employ interpreters; confirm availability directly with your provider.",
    caveat:
      "The platform does not arrange interpreters and cannot guarantee language support.",
  },
  {
    icon: BusFrontIcon,
    title: "Getting around between appointments",
    description:
      "General planning notes: keeping buffer time between hospital appointments and your stay, peak-hour patterns and accessibility considerations to raise with your provider.",
    caveat:
      "Educational information only — the platform performs no scheduling or coordination.",
  },
] as const

const JOURNEY_STEPS = [
  {
    title: "Before you travel",
    description:
      "Prepare documents, understand visa categories and plan an arrival window. The platform shares checklists only — nothing is verified or filed for you.",
  },
  {
    title: "On arrival",
    description:
      "Airport transfers are typically self-arranged or provider-arranged. This platform arranges nothing.",
  },
  {
    title: "During your stay",
    description:
      "Accommodation and daily transport remain your responsibility; these pages explain what patients usually plan for.",
  },
  {
    title: "Follow-up from home",
    description:
      "Post-treatment follow-up is coordinated by your treating provider. Submit an enquiry if you need coordination support from our team.",
  },
] as const

const FAQ_ITEMS = [
  {
    question: "Will someone pick me up from the airport?",
    answer:
      "Not through this platform. Airport pickup is described here so you know what to plan; if a real provider offers transfers, you would arrange it with them directly. No pickup is guaranteed or booked by BestHospitalIndia.",
  },
  {
    question: "Can you help me get a medical visa?",
    answer:
      "The platform shares general document checklists only. It is not an immigration service, does not issue invitation letters and cannot influence visa decisions. Always rely on official consular sources.",
  },
  {
    question: "Do you book hotels or guest houses?",
    answer:
      "No. Accommodation content is general orientation about stay options near hospital cities. No properties are listed, held, negotiated or priced.",
  },
  {
    question: "Is interpreter support available?",
    answer:
      "The platform cannot arrange interpreters. Doctor profiles list spoken languages to help you shortlist providers; confirm language support directly with your provider.",
  },
  {
    question: "Who do I contact about travel plans?",
    answer:
      "There is no dedicated travel desk on the platform. Use the international patient enquiry form and our coordination team will follow up on travel-related questions.",
  },
] as const

export default function TravelAssistancePage() {
  return (
    <div className="space-y-12 py-8 sm:space-y-16">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Medical Tourism", href: ROUTES.public.medicalTourism },
          { label: "Travel Assistance" },
        ]}
        className="mb-2"
      />

      {/* Hero */}
      <section aria-labelledby="ta-hero-heading" className="space-y-4">
        <span className="inline-flex items-center gap-1.5 rounded-4xl bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <PlaneIcon aria-hidden className="size-3.5" />
          Informational — no services are booked or guaranteed
        </span>
        <h1 id="ta-hero-heading" className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Travel assistance information for international patients
        </h1>
        <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">
          Planning treatment travel involves documents, stays and local
          transport. This page explains what international patients commonly
          prepare. BestHospitalIndia does not book, arrange, verify or guarantee
          any travel, visa, accommodation or transport service. Use the enquiry
          form for coordination questions.
        </p>
      </section>

      {/* Service information cards */}
      <section aria-label="Support service information" className="space-y-4">
        <SectionHeading
          as="h2"
          title="What the platform explains — and explicitly does not do"
          description="Each card pairs general guidance with the exact boundary of what this platform will not do."
        />
        <SupportServiceCards services={SERVICES} />
      </section>

      {/* Journey orientation */}
      <section aria-label="Travel stages" className="space-y-4">
        <SectionHeading
          as="h2"
          title="Travel stages at a glance"
          description="Orientation across the stages of a treatment trip. Every stage remains self-arranged or provider-arranged in the real world."
        />
        <JourneySteps
          steps={JOURNEY_STEPS}
          footnote="All travel stages are described for orientation. Practical arrangements remain self-managed or provider-managed unless our team confirms otherwise after an enquiry."
        />
      </section>

      {/* Language assistance note */}
      <section aria-label="Language assistance" className="space-y-3">
        <SectionHeading
          as="h2"
          title="Language assistance"
          description="Language support depends entirely on individual providers; this platform only surfaces language information from profiles."
        />
        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <li className="flex items-start gap-2">
              <LanguagesIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
              Doctor profiles list spoken languages so you can shortlist providers.
            </li>
            <li className="flex items-start gap-2">
              <FileCheck2Icon aria-hidden className="mt-0.5 size-4 shrink-0" />
              Real providers commonly offer translated documents or
              interpreters — confirm with them directly.
            </li>
            <li className="flex items-start gap-2">
              <TrainFrontIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
              Intercity travel between cities is typically by train or
              domestic flight, self-booked.
            </li>
            <li className="flex items-start gap-2">
              <CarIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
              Keep buffer time between appointments and long transfers; ask a
              real provider for realistic scheduling.
            </li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Nothing above is a commitment: the platform arranges no interpreters,
            transport or scheduling.
          </p>
        </div>
      </section>

      {/* Enquiry CTA */}
      <EnquiryCta
        title="Flag travel-related questions in your enquiry"
        description="The international patient enquiry form lets you tick accommodation, visa and transport information interests. Our coordination team reviews and follows up."
        enquiryParams={{ travel: "assistance" }}
        secondaryLabel="Back to medical tourism"
        secondaryHref={ROUTES.public.medicalTourism}
      />

      {/* FAQ */}
      <section aria-label="Travel assistance FAQ" className="space-y-4">
        <SectionHeading as="h2" title="Travel assistance FAQ" />
        <FaqList items={FAQ_ITEMS} />
      </section>

      <section aria-label="Patient support contact" className="space-y-3">
        <SectionHeading
          as="h2"
          title="Patient support"
          description="Reach our coordination team for travel-related questions linked to your enquiry."
        />
        <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
          <p>
            Patient support: support@example.org · +91 00000 00000,
            Monday–Friday 09:00–17:00 IST. Use the international patient enquiry
            form so we can match your message to a reference number.
          </p>
        </div>
      </section>

      <p className="rounded-lg border bg-muted/30 p-4 text-xs text-muted-foreground">
        Medical disclaimer: travel assistance content is general information, not
        a service offering, and no service availability, price or outcome is
        guaranteed. Not medical, legal or immigration advice.
      </p>
    </div>
  )
}
