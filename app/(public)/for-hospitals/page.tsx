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
import { SubmissionStatus } from "@/features/catalogue/submission-status"
import {
  forHospitalsSteps,
  forHospitalsBenefits,
} from "@/features/content/home-content"

export const metadata: Metadata = {
  title: "For Hospitals",
  description:
    "How hospitals join BestHospitalIndia: profile setup, document verification with explicit states, enquiry management and independent rating presentation.",
}

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "For Hospitals" },
]

export default function ForHospitalsPage() {
  return (
    <div className="space-y-10 py-8">
      <PageHeader
        title="Partner with BestHospitalIndia — for hospitals"
        description="Submit the hospital for admin approval. Patient queries are not sent to the hospital. A listing appears on the public site only after admin approves it."
        breadcrumbItems={breadcrumbItems}
      />

      <PageSection
        title="What participation involves"
        description="From first interest to day-to-day enquiry management."
      >
        <JourneySteps steps={forHospitalsSteps} />
      </PageSection>

      <PageSection
        title="Verification expectations"
        description="What the platform tracks for every hospital record — states are shown to patients exactly as they are."
      >
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Registration and establishment licences, tracked with statuses such
            as verified, pending, rejected or expired.
          </li>
          <li>
            Accreditation records with validity periods, displayed alongside
            their verification state on the public profile.
          </li>
          <li>
            Doctor rosters linked two-way, so hospital and doctor profiles stay
            consistent.
          </li>
          <li>
            Ratings remain independent assessments: joining the platform neither
            grants nor promises any PER or CER score.
          </li>
        </ul>
      </PageSection>

      <PageSection
        title="Why hospitals participate"
        description="The concrete benefits of a structured listing."
      >
        <PartnerBenefits benefits={forHospitalsBenefits} />
      </PageSection>

      <PageSection
        title="Institutional interest form"
        description="Use an official email. After you submit, check the same email here to see whether admin has approved the listing."
        id="interest-form"
      >
        <DemoNotice
          title="Interest form — application review"
          message="Submitting this form starts an institutional review workflow. You receive a reference number on screen; our team contacts you about onboarding next steps."
        />
        <PartnerInterestForm kind="hospital" />
        <SubmissionStatus />
      </PageSection>

      <ContentLinkGroup
        title="Supporting links"
        links={[
          {
            label: "For Doctors — individual participation",
            href: "/for-doctors",
          },
          { label: "Rating Methodology", href: "/rating-methodology" },
          { label: "How It Works", href: "/how-it-works" },
          { label: "Contact the partnerships team", href: "/contact" },
        ]}
      />
    </div>
  )
}
