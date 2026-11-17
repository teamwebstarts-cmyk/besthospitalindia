import type { Metadata } from "next"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  LegalDraftNotice,
  PageHeader,
  PageSection,
  ContentLinkGroup,
} from "@/features/content"

export const metadata: Metadata = {
  title: "Medical Disclaimer",
  description:
    "BestHospitalIndia is a discovery and coordination platform, not a medical service: no diagnosis, treatment or guaranteed outcomes. Draft copy pending legal approval.",
}

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Medical Disclaimer" },
]

const LAST_UPDATED = "17 November 2026 (draft)"

export default function DisclaimerPage() {
  return (
    <div className="space-y-10 py-8">
      <PageHeader
        title="Medical Disclaimer"
        description={`Last updated: ${LAST_UPDATED}. This draft states what the platform is and is not. Replace with approved legal text before production use.`}
        breadcrumbItems={breadcrumbItems}
      >
        <LegalDraftNotice />
      </PageHeader>

      <Alert>
        <AlertTitle>No medical advice</AlertTitle>
        <AlertDescription>
          Nothing on this platform — provider profiles, ratings, treatment
          pages, testimonials or FAQs — is medical advice. Always consult a
          qualified clinician about diagnosis and treatment decisions.
        </AlertDescription>
      </Alert>

      <PageSection
        title="Discovery and coordination, not diagnosis or treatment"
        description="The core boundary of the service."
      >
        <p>
          BestHospitalIndia helps users find, compare and contact hospitals,
          doctors and facilities, and coordinates requests between patients and
          providers. It does not diagnose, treat, prescribe or otherwise
          practise medicine, and no clinician–patient relationship is created by
          using the platform or submitting any request.
        </p>
      </PageSection>

      <PageSection
        title="No guaranteed outcomes"
        description="What ratings and profiles cannot promise."
      >
        <p>
          Provider profiles, independent PER / CER / MER ratings, evidence
          summaries and patient stories describe recorded information, not
          promises. No outcome, cure, success rate, waiting period or cost is
          guaranteed anywhere on the platform, and ratings are never a
          recommendation of a specific provider for a specific condition.
        </p>
      </PageSection>

      <PageSection
        title="Consultation scope and charges"
        description="What the IUF-supported consultation does and does not include."
      >
        <p>
          The free consultation initiative covers an initial coordination
          consultation as described on the consultation page, including what is
          provided at no charge. Consultations do not include treatment,
          procedures, medicines, diagnostics, travel or hospital charges, and
          any subsequent care is arranged directly with providers under their
          own terms and pricing. The consultation page states scope and
          exclusions before any request is made.
        </p>
      </PageSection>

      <PageSection
        title="Emergency care"
        description="What to do instead of using this platform."
      >
        <p>
          This platform is not for emergencies. If you may be experiencing a
          medical emergency, contact your local emergency number or seek
          immediate care at the nearest emergency department instead of
          submitting any request here.
        </p>
      </PageSection>

      <ContentLinkGroup
        title="Related documents"
        links={[
          {
            label: "Rating Methodology — how ratings are produced",
            href: "/rating-methodology",
          },
          {
            label: "Free consultation (scope and exclusions)",
            href: "/free-consultation",
          },
          { label: "Terms of Use", href: "/terms" },
          { label: "Privacy Policy", href: "/privacy" },
        ]}
      />
    </div>
  )
}
