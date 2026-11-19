import type { Metadata } from "next"

import {
  LegalDraftNotice,
  PageHeader,
  PageSection,
  ContentLinkGroup,
} from "@/features/content"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Draft privacy policy for BestHospitalIndia covering patient and medical information, consent, access, retention, deletion and sharing. Placeholder copy pending legal approval.",
}

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Privacy Policy" },
]

const LAST_UPDATED = "17 November 2026 (draft)"

export default function PrivacyPage() {
  return (
    <div className="space-y-10 py-8">
      <PageHeader
        title="Privacy Policy"
        description={`Last updated: ${LAST_UPDATED}. This draft explains how the platform intends to handle patient and medical information once approved text is published.`}
        breadcrumbItems={breadcrumbItems}
      >
        <LegalDraftNotice />
      </PageHeader>

      <PageSection
        title="1. Scope of this draft"
        description="Who and what this draft policy would cover."
      >
        <p>
          This draft covers the discovery platform (hospitals, doctors,
          facilities, treatments) and the patient query form. A query is stored
          for admin and the Delhi or Indore desk. This draft is intended to be
          replaced, word for word, by approved legal text before production use.
        </p>
      </PageSection>

      <PageSection
        title="2. Patient and medical information"
        description="What the platform would collect and why."
      >
        <p>
          The platform is expected to process: identity and contact details
          supplied in enquiry and account forms; concern descriptions and
          free-text messages; and the Delhi or Indore choice on a query. Medical
          information would be processed only to operate that query
          (admin and the city desk, not a hospital or doctor) and never to build
          advertising profiles.
        </p>
        <p>
          Information you submit in forms is processed to operate the workflows
          you request (admin and the Delhi or Indore desk, not a hospital or doctor).
          Retention periods and data subject rights are set out in the approved
          policy when published.
        </p>
      </PageSection>

      <PageSection title="3. Consent" description="How consent would work.">
        <p>
          Enquiry, appointment and review flows would each require an explicit,
          separate consent action before submission. Consent would be recorded
          with a timestamp and the exact wording shown at the time. Withdrawing
          consent would be available through the patient portal or by contacting
          the platform team.
        </p>
      </PageSection>

      <PageSection
        title="4. Access and correction"
        description="Your information, your control."
      >
        <p>
          Patients would be able to view and correct their profile details in
          the patient portal. Enquiry and appointment records submitted through
          the platform would remain visible in the portal history so that what
          was sent, and to whom, stays auditable.
        </p>
      </PageSection>

      <PageSection
        title="5. Retention and deletion"
        description="How long information would be kept."
      >
        <p>
          The intended default is to retain enquiry and appointment records only
          as long as needed to operate the workflow plus any legally required
          period, after which they would be deleted or irreversibly anonymised.
          Deletion requests made through the contact channel would be honoured
          subject to applicable law.
        </p>
      </PageSection>

      <PageSection
        title="6. Sharing"
        description="Who information would be shared with."
      >
        <p>
          Information submitted through a query would be shared with the site
          admin and the Delhi or Indore desk for the city on the form. It is
          not shared with a hospital or a doctor. No sale of personal data, and no sharing with
          unrelated third parties, is contemplated by this draft.
        </p>
      </PageSection>

      <PageSection
        title="7. Contact about privacy"
        description="Where privacy questions would go."
      >
        <p>
          Privacy questions and requests would go through the contact page,
          where an approved privacy contact will be published alongside this
          policy once finalised.
        </p>
      </PageSection>

      <ContentLinkGroup
        title="Related documents"
        links={[
          { label: "Terms of Use", href: "/terms" },
          { label: "Medical Disclaimer", href: "/disclaimer" },
          { label: "Contact", href: "/contact" },
        ]}
      />
    </div>
  )
}
