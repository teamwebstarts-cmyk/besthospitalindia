/**
 * Facility detail route — /facilities/[slug] (A03 Facility Discovery).
 *
 * Server Component, SSG. generateStaticParams covers the 12 fixture
 * facilities; `dynamicParams = false` sends unknown slugs straight to
 * not-found. generateMetadata uses safe factual fields from the mock record
 * only (no clinical claims). Enquiry CTAs route to /contact and
 * /free-consultation — no form, no fake submission.
 *
 * Deliberately omitted (no fixture support — not fabricated):
 * - associated doctors (getRelatedDoctors is hospital-scoped; Facility
 *   fixtures define no doctor links)
 * - ratings (Facility carries no RatingSummary per 09 contract)
 * - phone/address/related facilities (not in the Facility type)
 *
 * Spec: docs/implementation/pages/03-facility-detail.md.
 */

import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { MapPinIcon } from "lucide-react"

import { facilities, specialtyById } from "@/data"
import { getFacilityBySlug } from "@/lib/search"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { SectionHeading } from "@/components/shared/section-heading"
import { StatusBadge } from "@/components/shared/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { FACILITY_CATEGORY_LABELS } from "@/features/discovery/facility-meta"
import type { Facility } from "@/types"

interface FacilityPageProps {
  params: Promise<{ slug: string }>
}

/** Pre-render the 12 fixture facilities at build time; unknown → not-found. */
export function generateStaticParams(): { slug: string }[] {
  return facilities.map((facility) => ({ slug: facility.slug }))
}

export const dynamicParams = false

/** Safe factual fields only — name, category, city, demo-data notice. */
export async function generateMetadata({
  params,
}: FacilityPageProps): Promise<Metadata> {
  const { slug } = await params
  const facility = getFacilityBySlug(slug)
  if (!facility) return {}

  const categoryLabel = FACILITY_CATEGORY_LABELS[facility.category].toLowerCase()
  return {
    title: facility.name,
    description: `${facility.name} — ${categoryLabel} facility in ${facility.city}, ${facility.state}. View category, services, specialties and verification status on BestHospitalIndia.`,
    alternates: { canonical: `/facilities/${facility.slug}` },
  }
}

/** Specialty records resolved from the facility's specialty ids (fixture order). */
function getFacilitySpecialties(facility: Facility) {
  return facility.specialties
    .map((specialtyId) => specialtyById[specialtyId])
    .filter((specialty) => specialty !== undefined)
}

export default async function FacilityDetailPage({ params }: FacilityPageProps) {
  const { slug } = await params
  const facility = getFacilityBySlug(slug)
  if (!facility) notFound()

  const facilitySpecialties = getFacilitySpecialties(facility)

  return (
    <div className="space-y-8 py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Facilities", href: "/facilities" },
          { label: facility.name },
        ]}
      />

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            {FACILITY_CATEGORY_LABELS[facility.category]}
          </Badge>
          <StatusBadge status={facility.verificationStatus} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {facility.name}
        </h1>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPinIcon aria-hidden className="size-4 shrink-0" />
          {facility.city}, {facility.state}, {facility.country}
        </p>
        <p className="max-w-3xl text-sm text-balance text-muted-foreground">
          Facility profile with verification status, listed specialties and
          services. Use the enquiry options to request information or a free
          consultation — an enquiry is not a confirmed booking.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button render={<Link href="/contact" />}>
            Request information
          </Button>
          <Button variant="outline" render={<Link href="/free-consultation" />}>
            Get a free consultation
          </Button>
        </div>
      </header>

      <Separator />

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-10">
          <section aria-labelledby="overview-heading" className="space-y-3">
            <SectionHeading as="h2" title="Overview" />
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                {facility.name} is listed as a{" "}
                {FACILITY_CATEGORY_LABELS[facility.category].toLowerCase()} in{" "}
                {facility.city}, {facility.state}. This profile lists category,
                location, associated specialties and services, and verification
                status as recorded on the platform.
              </p>
              <p>
                Verification status on this record is{" "}
                <strong className="font-medium text-foreground">
                  {facility.verificationStatus}
                </strong>{" "}
                — updated as our team completes registry and accreditation checks.
              </p>
            </div>
          </section>

          <section aria-labelledby="specialties-heading" className="space-y-3">
            <SectionHeading
              as="h2"
              title="Specialties"
              description="Specialties associated with this facility."
            />
            {facilitySpecialties.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No specialties are associated with this facility yet.
              </p>
            ) : (
              <ul aria-label="Specialties" className="flex flex-wrap gap-2">
                {facilitySpecialties.map((specialty) => (
                  <li key={specialty.id}>
                    <Badge variant="outline">{specialty.name}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="services-heading" className="space-y-3">
            <SectionHeading
              as="h2"
              title="Services"
              description="Services offered at this facility."
            />
            <ul className="grid gap-2 sm:grid-cols-2">
              {facility.services.map((service) => (
                <li
                  key={service}
                  className="flex items-start rounded-md border bg-card px-3 py-2 text-sm"
                >
                  {service}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside aria-label="Location and enquiry" className="space-y-4">
          <Card size="sm">
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription>City and region for this listing.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="flex items-start gap-2">
                <MapPinIcon
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                />
                <span>
                  {facility.city}, {facility.state}
                  <br />
                  {facility.country}
                </span>
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Full address and direct contact details may be shared after an enquiry is reviewed.
              </p>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Interested in this facility?</CardTitle>
              <CardDescription>
                Enquiries route to the contact and consultation flows for follow-up by our team.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button render={<Link href="/contact" />}>
                Request information
              </Button>
              <Button variant="outline" render={<Link href="/free-consultation" />}>
                Free consultation
              </Button>
              <p className="text-xs text-muted-foreground">
                Links open the enquiry flows with this facility in context where supported.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
