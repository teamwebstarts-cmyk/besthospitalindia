import type { Metadata } from "next"
import { StethoscopeIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader, PageSection, ContentLinkGroup } from "@/features/content"
import { JourneySteps } from "@/features/content/journey-steps"
import { patientJourneySteps } from "@/features/content/home-content"
import { ROUTES } from "@/constants/routes"

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "How discovery, enquiry, appointment requests, the IUF-supported consultation and international patient pathways work on BestHospitalIndia.",
}

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "How It Works" },
]

const pathways: readonly {
  id: string
  title: string
  body: string
  cta?: { label: string; href: string }
}[] = [
  {
    id: "path-hospital",
    title: "Hospital discovery pathway",
    body: "Search the hospital directory by keyword, city, specialty or facility type, open a hospital profile, review its independent PER and CER ratings with their evidence metadata, then request an appointment or raise an enquiry.",
    cta: { label: "Browse hospitals", href: ROUTES.public.hospitals },
  },
  {
    id: "path-doctor",
    title: "Doctor discovery pathway",
    body: "Filter doctors by specialty, city, language or hospital association. Doctor profiles show qualifications, registration state, hospital links and separate PER and MER ratings before you request an appointment or consultation.",
    cta: { label: "Browse doctors", href: ROUTES.public.doctors },
  },
  {
    id: "path-enquiry",
    title: "Enquiry pathway (free consultation)",
    body: "The free consultation and international-patient enquiry forms collect your concern, specialty, reports and preferred date. Submission creates a tracked enquiry with a status — responded, assigned or under review. An enquiry is not a booking and carries no charge in the IUF-supported initiative.",
    cta: { label: "Free consultation", href: ROUTES.public.freeConsultation },
  },
  {
    id: "path-appointment",
    title: "Appointment request pathway",
    body: "Appointment requests name a provider, a preferred date and the reason for the visit. The provider confirms or reschedules from their portal; until then the request stays in “requested” state. A frontend request is never presented as a confirmed appointment.",
  },
  {
    id: "path-international",
    title: "International patient pathway",
    body: "International patients can raise a dedicated enquiry with country, language and report details, follow the medical-tourism case stages (enquiry through follow-up) and read travel-assistance information before travelling.",
    cta: {
      label: "International patient enquiry",
      href: ROUTES.public.internationalPatientEnquiry,
    },
  },
]

export default function HowItWorksPage() {
  return (
    <div className="space-y-10 py-8">
      <PageHeader
        title="How BestHospitalIndia works"
        description="From first search to follow-up: the discovery, enquiry, appointment request and international patient pathways on the platform."
        breadcrumbItems={breadcrumbItems}
      />

      <PageSection
        title="The journey at a glance"
        description="Four steps take a patient from discovery to supported follow-up. Every step links to the matching directory or form."
      >
        <JourneySteps steps={patientJourneySteps} />
      </PageSection>

      <PageSection
        title="Pathways in detail"
        description="What happens in each flow, and where requests end and confirmations begin."
      >
        <div className="space-y-4">
          {pathways.map((pathway, index) => (
            <article
              key={pathway.id}
              className="flex flex-col gap-3 rounded-xl bg-card p-5 shadow-xs ring-1 ring-foreground/10 sm:flex-row sm:items-start sm:gap-5"
            >
              <span
                aria-hidden
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
              >
                {index + 1}
              </span>
              <div className="flex-1 space-y-2">
                <h3 className="flex items-center gap-2 font-semibold text-foreground">
                  {pathway.id === "path-doctor" ? (
                    <StethoscopeIcon
                      aria-hidden
                      className="size-4 text-primary"
                    />
                  ) : null}
                  {pathway.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {pathway.body}
                </p>
                {pathway.cta ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-1"
                    render={<a href={pathway.cta.href} />}
                  >
                    {pathway.cta.label}
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </PageSection>

      <ContentLinkGroup
        title="Supporting links"
        description="Jump straight into the flow you need."
        links={[
          { label: "Hospitals directory", href: "/hospitals" },
          { label: "Doctors directory", href: "/doctors" },
          { label: "Facilities directory", href: "/facilities" },
          { label: "Free consultation", href: "/free-consultation" },
          { label: "About the platform", href: "/about" },
        ]}
      />
    </div>
  )
}
