import type { Metadata } from "next"

import {
  PageHeader,
  PageSection,
  ContentLinkGroup,
  DemoNotice,
} from "@/features/content"
import { JourneySteps } from "@/features/content/journey-steps"
import { PartnerBenefits } from "@/features/content/partner-benefits"
import { PartnerInterestForm } from "@/features/content/partner-forms"
import {
  forDoctorsSteps,
  forDoctorsBenefits,
} from "@/features/content/home-content"

export const metadata: Metadata = {
  title: "For Doctors",
  description:
    "How doctors join BestHospitalIndia: profile structure, credential verification states, hospital associations and patient enquiry workflows.",
}

const breadcrumbItems = [{ label: "Home", href: "/" }, { label: "For Doctors" }]

export default function ForDoctorsPage() {
  return (
    <div className="space-y-10 py-8">
      <PageHeader
        title="Join as a doctor"
        description="A readable profile, credential verification with explicit states, two-way hospital associations and structured patient enquiries. Listing neither grants nor promises any rating."
        breadcrumbItems={breadcrumbItems}
      />

      <PageSection
        title="What participation involves"
        description="From interest to day-to-day consultation management."
      >
        <JourneySteps steps={forDoctorsSteps} />
      </PageSection>

      <PageSection
        title="Credential and profile expectations"
        description="What a doctor profile carries, and how verification is presented."
      >
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Qualifications, fellowships and super-specialty records tracked as
            credential entries with verification states — nothing is presented
            as verified before it is.
          </li>
          <li>
            Medical registration shown with authority and a masked registration
            number; the public profile never exposes full registration digits.
          </li>
          <li>
            Hospital associations maintained two-way with hospital records, so
            “where I practise” stays accurate on both sides.
          </li>
          <li>
            Languages and treatment focus listed so patients can filter
            meaningfully.
          </li>
          <li>
            PER and MER remain independent assessments — participation never
            promises a score.
          </li>
        </ul>
      </PageSection>

      <PageSection
        title="Why doctors participate"
        description="The concrete benefits of a structured profile."
      >
        <PartnerBenefits benefits={forDoctorsBenefits} />
      </PageSection>

      <PageSection
        title="Individual interest form"
        description="Tell us about your practice. In this demo, submission produces a local confirmation only."
        id="interest-form"
      >
        <DemoNotice
          title="Demo form — no registration happens"
          message="This interest form is part of the mock build. Nothing is transmitted, stored or reviewed; the confirmation you will see is generated locally in your browser."
        />
        <PartnerInterestForm kind="doctor" />
      </PageSection>

      <ContentLinkGroup
        title="Supporting links"
        links={[
          {
            label: "For Hospitals — institutional participation",
            href: "/for-hospitals",
          },
          {
            label: "Rating Methodology — PER and MER",
            href: "/rating-methodology",
          },
          { label: "How It Works", href: "/how-it-works" },
          { label: "Contact the partnerships team", href: "/contact" },
        ]}
      />
    </div>
  )
}
