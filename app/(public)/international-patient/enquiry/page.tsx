import type { Metadata } from "next"
import { Suspense } from "react"
import { InfoIcon } from "lucide-react"

import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { LoadingSkeleton } from "@/components/shared/loading-skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { ROUTES } from "@/constants/routes"
import { specialties } from "@/data"
import { InternationalPatientEnquiryForm } from "@/features/medical-tourism"

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

function parseSingle(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? ""
  return value ?? ""
}

export default async function InternationalPatientEnquiryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const specialtyParam = parseSingle(params.specialty)
  const treatmentParam = parseSingle(params.treatment)

  // Only pass preselects that exist in the frozen fixtures.
  const defaultSpecialty = specialties.some((s) => s.id === specialtyParam)
    ? specialtyParam
    : undefined

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
          Share patient details, case context, report labels and travel
          preferences. After you submit, you receive a reference number and our
          coordination team reviews the enquiry. An enquiry is not a confirmed
          appointment until a provider confirms.
        </p>
      </section>

      {/* Scope notice */}
      <Card>
        <CardContent className="gap-2">
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <InfoIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
            <span>
              <strong className="font-medium text-foreground">What happens after submit:</strong>{" "}
              you receive a reference number (for example ENQ-XXXX). A coordinator
              reviews the enquiry, may assign a case worker and shares provider
              responses according to the workflow described on the medical tourism pages.
            </span>
          </p>
        </CardContent>
      </Card>

      {/* Form */}
      <section aria-label="Enquiry form" className="mx-auto w-full max-w-3xl">
        <Suspense fallback={<LoadingSkeleton variant="profile" />}>
          <InternationalPatientEnquiryForm
            defaultSpecialty={defaultSpecialty}
            defaultTreatment={treatmentParam || undefined}
          />
        </Suspense>
      </section>
    </div>
  )
}
