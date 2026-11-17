import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Building2Icon,
  CircleExclamationPointIcon,
  InfoIcon,
  MapPinIcon,
  StethoscopeIcon,
} from "lucide-react"

import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { EmptyState } from "@/components/shared/empty-state"
import { SectionHeading } from "@/components/shared/section-heading"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { doctorProfileHref, hospitalProfileHref, ROUTES, treatmentDetailHref } from "@/constants/routes"
import { treatments } from "@/data"
import { getTreatmentBySlug, getTreatmentsForSpecialty, searchDoctors, searchHospitals } from "@/lib/search"
import { EnquiryCta } from "@/features/medical-tourism"
import { specialtyForTreatment } from "@/features/medical-tourism/selectors"

/**
 * /treatments/[slug] — treatment detail (Agent A06).
 *
 * Spec: implementation/11-treatment-detail.md. Static generation over the
 * frozen fixture slugs with dynamicParams = false; unknown slugs render the
 * shared not-found page. Sections: overview, specialty context, related
 * hospitals/doctors (link lists + provider deep links — provider CARDS are
 * A03/A04/A05 territory and are not duplicated here), enquiry CTA, medical
 * disclaimer. Clinical copy rules: descriptive only — NO diagnosis, outcomes,
 * prices, guarantees or success claims. A visible "Content pending medical
 * review" note is rendered.
 */

interface TreatmentDetailParams {
  slug: string
}

/** Pre-render every fixture treatment; unknown slugs 404 (dynamicParams false). */
export function generateStaticParams(): TreatmentDetailParams[] {
  return treatments.map((treatment) => ({ slug: treatment.slug }))
}

export const dynamicParams = false

type TreatmentPageProps = {
  params: Promise<TreatmentDetailParams>
}

export async function generateMetadata({
  params,
}: TreatmentPageProps): Promise<Metadata> {
  const { slug } = await params
  const treatment = getTreatmentBySlug(slug)

  if (!treatment) {
    return { title: "Treatment not found" }
  }

  // Safe factual fields only: name + neutral fixture description. No claims.
  return {
    title: treatment.name,
    description: `${treatment.description} Demo platform — informational listing only, not medical advice.`,
    alternates: {
      canonical: treatmentDetailHref(treatment.slug),
    },
  }
}

export default async function TreatmentDetailPage({ params }: TreatmentPageProps) {
  const { slug } = await params
  const treatment = getTreatmentBySlug(slug)

  if (!treatment) {
    notFound()
  }

  const specialty = specialtyForTreatment(treatment)
  const relatedTreatments = specialty
    ? getTreatmentsForSpecialty(specialty.id).filter((item) => item.id !== treatment.id)
    : []

  // Providers listing this treatment, straight from lib/search contracts.
  const hospitals = searchHospitals({ treatments: [treatment.id] })
  const doctors = searchDoctors({ treatments: [treatment.id] })

  return (
    <div className="space-y-10 py-8 sm:space-y-14">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Treatments", href: ROUTES.public.treatments },
          ...(specialty
            ? [
                {
                  label: specialty.name,
                  href: `${ROUTES.public.treatments}?specialty=${encodeURIComponent(specialty.id)}`,
                },
              ]
            : []),
          { label: treatment.name },
        ]}
        className="mb-2"
      />

      {/* Overview */}
      <section aria-label="Treatment overview" className="space-y-4">
        <Badge variant="outline" className="text-muted-foreground">
          Demo taxonomy entry — fictional data
        </Badge>
        <h1
          id="treatment-overview-heading"
          className="text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          {treatment.name}
        </h1>
        <p className="max-w-3xl text-base text-muted-foreground">
          {treatment.description}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {specialty ? (
            <span className="inline-flex items-center gap-1.5 rounded-4xl bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              <StethoscopeIcon aria-hidden className="size-3.5" />
              Specialty: {specialty.name}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5 rounded-4xl bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            <Building2Icon aria-hidden className="size-3.5" />
            {hospitals.length} demo {hospitals.length === 1 ? "hospital" : "hospitals"} list
            this
          </span>
        </div>
      </section>

      {/* Content pending medical review — visible note per spec */}
      <aside
        aria-label="Content review status"
        className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/5 p-4 text-sm text-foreground"
      >
        <CircleExclamationPointIcon
          aria-hidden
          className="mt-0.5 size-4 shrink-0 text-warning"
        />
        <p>
          <span className="font-medium">Content pending medical review.</span>{" "}
          This page is demo taxonomy copy. Descriptions have not been reviewed
          by medical professionals and are not guidance of any kind.
        </p>
      </aside>

      {/* What this page is / is not */}
      <section aria-label="How to read this page" className="space-y-4">
        <SectionHeading
          as="h2"
          title="How to read this page"
          description="Scope boundaries for the treatment listing on this platform."
        />
        <Card>
          <CardContent className="gap-3">
            <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              <li className="flex items-start gap-2">
                <InfoIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
                Lists which demo providers include this treatment in their
                fictional programme data.
              </li>
              <li className="flex items-start gap-2">
                <InfoIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
                Links to hospital and doctor profile pages where you can read
                their independent PER/CER/MER demo ratings.
              </li>
              <li className="flex items-start gap-2">
                <InfoIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
                Does NOT describe procedures, suitability, risks, results,
                recovery or prices — those require qualified professionals.
              </li>
              <li className="flex items-start gap-2">
                <InfoIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
                The enquiry CTA records a demo entry locally; nothing is sent
                to any provider.
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Related hospitals */}
      <section aria-label="Related demo hospitals" className="space-y-4">
        <SectionHeading
          as="h2"
          title={`Demo hospitals listing ${treatment.name}`}
          description="Link list only — full provider cards live on the hospital directory and profiles."
        />
        {hospitals.length === 0 ? (
          <EmptyState
            title="No demo hospitals list this treatment yet"
            description="The fixture set has no hospital offering this treatment. Browse the full directory instead."
            action={{ label: "Browse hospitals", href: ROUTES.public.hospitals }}
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {hospitals.map((hospital) => (
              <li key={hospital.id}>
                <Card size="sm" className="h-full">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">
                      <Link
                        href={hospitalProfileHref(hospital.slug)}
                        className="underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        {hospital.name}
                      </Link>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1.5">
                      <MapPinIcon aria-hidden className="size-3.5" />
                      {hospital.city}, {hospital.state} · {hospital.facilityType}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      size="sm"
                      render={
                        <Link
                          href={hospitalProfileHref(hospital.slug)}
                        />
                      }
                    >
                      View hospital profile
                      <span className="sr-only"> for {hospital.name}</span>
                    </Button>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Related doctors */}
      <section aria-label="Related demo doctors" className="space-y-4">
        <SectionHeading
          as="h2"
          title="Demo doctors listing this treatment"
          description="Link list only — doctor cards with independent PER/MER live on the doctor directory and profiles."
        />
        {doctors.length === 0 ? (
          <EmptyState
            title="No demo doctors list this treatment yet"
            description="The fixture set has no doctor offering this treatment. Browse the full directory instead."
            action={{ label: "Browse doctors", href: ROUTES.public.doctors }}
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {doctors.map((doctor) => (
              <li key={doctor.id}>
                <Card size="sm" className="h-full">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">
                      <Link
                        href={doctorProfileHref(doctor.slug)}
                        className="underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        {doctor.name}
                      </Link>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1.5">
                      <MapPinIcon aria-hidden className="size-3.5" />
                      {doctor.city} · {doctor.yearsExperience ?? "—"} yrs experience (demo)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      size="sm"
                      render={<Link href={doctorProfileHref(doctor.slug)} />}
                    >
                      View doctor profile
                      <span className="sr-only"> for {doctor.name}</span>
                    </Button>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Related treatments in the same specialty */}
      {relatedTreatments.length > 0 ? (
        <section aria-label="Related treatments in this specialty" className="space-y-4">
          <SectionHeading
            as="h2"
            title={`More in ${specialty?.name ?? "this specialty"}`}
            description="Other demo taxonomy entries under the same specialty."
          />
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {relatedTreatments.map((item) => (
              <li key={item.id}>
                <Link
                  href={treatmentDetailHref(item.slug)}
                  className="block rounded-xl border bg-card p-4 shadow-xs transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Enquiry CTA — preselects specialty + treatment */}
      <EnquiryCta
        title={`Interested in ${treatment.name}?`}
        description="Start the international patient enquiry with this treatment preselected. The demo records entries locally and shows a reference number — no provider is contacted."
        enquiryParams={{
          specialty: treatment.specialtyId,
          treatment: treatment.id,
        }}
      />

      {/* Medical disclaimer */}
      <aside
        aria-label="Medical disclaimer"
        className="rounded-lg border bg-muted/30 p-4 text-xs text-muted-foreground"
      >
        Medical disclaimer: this page describes fictional demo data on a
        demonstration platform. It is not medical advice, diagnosis or a
        treatment recommendation, and no outcome, price or availability is
        represented. Consult qualified professionals for real care.
      </aside>
    </div>
  )
}
