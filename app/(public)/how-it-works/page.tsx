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
    "How hospital discovery and a patient query work. A query goes to admin and the Delhi or Indore desk, not to a hospital or doctor.",
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
    body: "Search the hospital directory by city or specialty and open a profile to read it. A query from that page is not sent to the hospital.",
    cta: { label: "Browse hospitals", href: ROUTES.public.hospitals },
  },
  {
    id: "path-doctor",
    title: "Doctor discovery pathway",
    body: "Filter doctors by specialty and city, then read the profile. Choosing a doctor does not send your query to that doctor.",
    cta: { label: "Browse doctors", href: ROUTES.public.doctors },
  },
  {
    id: "path-enquiry",
    title: "Query pathway",
    body: "One short form asks for your name, email, and whether you are in India or writing through the Embassy of Kenya or Nepal. You then choose a free consultation, a free medical camp, or free surgery, and name Delhi or Indore. Admin and that city’s desk both receive it.",
    cta: { label: "Free consultation", href: ROUTES.public.freeConsultation },
  },
  {
    id: "path-appointment",
    title: "No hospital booking",
    body: "The old appointment request is not a booking path. Hospitals and doctors do not get a queue of patients from this site. Follow-up stays with admin and the city desk.",
  },
  {
    id: "path-international",
    title: "International patient pathway",
    body: "International patients use the same query form and choose Embassy of Kenya or Embassy of Nepal. The query still goes to admin and the Delhi or Indore desk, not to a hospital.",
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
        description="Search the catalogue, then send one query. Admin and the Delhi or Indore desk receive it. A hospital or doctor does not."
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
        description="Where a search ends, and where a query goes."
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
