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
          facilities, treatments), enquiry and appointment request flows,
          patient accounts and partner portals. It applies to demo usage in this
          build and is intended to be replaced, word for word, by approved legal
          text before any production use.
        </p>
      </PageSection>

      <PageSection
        title="2. Patient and medical information"
        description="What the platform would collect and why."
      >
        <p>
          The platform is expected to process: identity and contact details
          supplied in enquiry and account forms; concern descriptions and
          free-text messages; report file names attached to enquiries;
          appointment request details; and saved-provider preferences. Medical
          information would be processed only to operate the requested workflows
          (for example routing an enquiry to a provider) and never to build
          advertising profiles.
        </p>
        <p>
          In this demo build, no information is actually collected: all forms
          run locally in the browser, and every record shown is fictional demo
          data.
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
          Information submitted through an enquiry or appointment request would
          be shared only with the provider the request names (and its
          coordinating staff), plus platform operations staff where required to
          run the workflow. No sale of personal data, and no sharing with
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
