import type { Metadata } from "next"

import {
  LegalDraftNotice,
  PageHeader,
  PageSection,
  ContentLinkGroup,
} from "@/features/content"

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Draft platform terms for BestHospitalIndia covering acceptable use, provider participation, request workflows and responsibilities. Placeholder copy pending legal approval.",
}

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Terms of Use" },
]

const LAST_UPDATED = "17 November 2026 (draft)"

export default function TermsPage() {
  return (
    <div className="space-y-10 py-8">
      <PageHeader
        title="Terms of Use"
        description={`Last updated: ${LAST_UPDATED}. This draft describes the intended ground rules for using the platform. It is not approved terms and creates no obligations.`}
        breadcrumbItems={breadcrumbItems}
      >
        <LegalDraftNotice />
      </PageHeader>

      <PageSection
        title="1. Using the platform"
        description="What the service is."
      >
        <p>
          BestHospitalIndia is a healthcare discovery and coordination platform.
          It lists provider profiles, presents independent ratings and evidence
          metadata, and operates request workflows (enquiries, appointment
          requests, consultations and medical-tourism support). It is not a
          medical service and does not practise medicine.
        </p>
      </PageSection>

      <PageSection
        title="2. Requests are not bookings"
        description="The workflow boundary."
      >
        <p>
          Submitting an enquiry or appointment request starts a coordination
          workflow with an explicit status. Only a provider-side confirmation
          changes a request into a confirmed appointment; nothing on the
          platform should be read as instant confirmation until a provider
          confirms the appointment.
        </p>
      </PageSection>

      <PageSection
        title="3. Provider participation"
        description="Rules intended for listed providers."
      >
        <p>
          Providers would be expected to keep profile, accreditation and
          credential information accurate; to keep verification records current;
          and to respond to enquiries through the platform workflows.
          Participation would never guarantee a rating, a ranking position or
          patient volume, and rating assessments stay independent of
          participation.
        </p>
      </PageSection>

      <PageSection
        title="4. Acceptable use"
        description="What users may not do."
      >
        <p>
          Intended restrictions include: submitting false contact information;
          impersonating patients or providers; scraping or republishing provider
          data without permission; attempting to manipulate ratings, reviews or
          verification states; and using the platform to send unlawful or
          unsolicited communications.
        </p>
      </PageSection>

      <PageSection
        title="5. User responsibilities"
        description="Your part of the deal."
      >
        <p>
          Users would be responsible for the accuracy of the details they
          submit, for verifying provider credentials and accreditation directly
          with providers before making care decisions, and for seeking
          professional medical advice from a qualified clinician rather than
          relying on platform content.
        </p>
      </PageSection>

      <PageSection
        title="6. Changes to these terms"
        description="How updates would work."
      >
        <p>
          When approved terms are published, material changes would be announced
          on the platform with a new “last updated” date. Continued use after
          that date would constitute acceptance of the updated terms.
        </p>
      </PageSection>

      <ContentLinkGroup
        title="Related documents"
        links={[
          { label: "Privacy Policy", href: "/privacy" },
          { label: "Medical Disclaimer", href: "/disclaimer" },
          { label: "Contact", href: "/contact" },
        ]}
      />
    </div>
  )
}
