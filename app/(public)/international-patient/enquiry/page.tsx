import type { Metadata } from "next"
import { InfoIcon } from "lucide-react"

import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { Card, CardContent } from "@/components/ui/card"
import { ROUTES } from "@/constants/routes"
import { LeadIntakeForm } from "@/features/leads/intake-form"

/**
 * /international-patient/enquiry — FR-009 international case enquiry (Agent A06).
 *
 * Spec: implementation/12-international-enquiry.md. Server page resolves
 * searchParams (specialty/treatment preselects from legacy deep links), validates
 * them against fixtures, and mounts
 * the client form. The journey STOPS at the mock confirmation — admin review
 * and provider response are documented future states and are never simulated.
 */

export const metadata: Metadata = {
  title: "International Patient Enquiry",
  description:
    "Submit an international patient enquiry with case details, report labels and travel preferences. Our coordination team reviews and follows up.",
  alternates: { canonical: ROUTES.public.internationalPatientEnquiry },
}

export default function InternationalPatientEnquiryPage() {
  return (
    <div className="space-y-8 py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Hospitals", href: ROUTES.public.hospitals },
          { label: "International Patient Enquiry" },
        ]}
        className="mb-2"
      />

      {/* Header */}
      <section aria-labelledby="enquiry-heading" className="space-y-3">
        <h1 id="enquiry-heading" className="text-3xl font-semibold tracking-tight sm:text-4xl">
          International patient enquiry
        </h1>
        <p className="max-w-3xl text-base text-muted-foreground">
          Leave your name and email, then choose free consultation, a medical camp, or free surgery.
          The request goes to our admin team and the Delhi or Indore desk. It is not sent to a hospital or a doctor.
        </p>
      </section>

      {/* Scope notice */}
      <Card>
        <CardContent className="gap-2">
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <InfoIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
            <span>
              <strong className="font-medium text-foreground">What happens after submit:</strong>{" "}
              you see a unique id on this page. Admin and the city desk for Delhi or Indore receive the request.
            </span>
          </p>
        </CardContent>
      </Card>

      {/* Form */}
      <section aria-label="Enquiry form" className="mx-auto w-full max-w-3xl">
        <LeadIntakeForm />
      </section>
    </div>
  )
}
