/**
 * /hospitals/[slug] — Hospital profile (Agent A04).
 *
 * Spec: implementation/pages/05-hospital-profile.md — identity/verified state;
 * location; PER and CER panels; overview; specialties/treatments; doctors;
 * accreditations; reviews; CTA. Section navigation via A05's
 * ProviderSectionNav pattern (consumed, not forked).
 *
 * Data rules (05 spec §6 + 00 trust model):
 * - Only typed fixtures; unknown slug → notFound().
 * - generateStaticParams + dynamicParams false — only fixture slugs render.
 * - PER + CER render via RatingPair as two independent panels — never merged.
 * - Accreditations carry VerificationBadge states straight from mock data;
 *   "verified" is never claimed without a verified record.
 * - Doctors come from getRelatedDoctors (two-way consistent); links point to
 *   /doctors/[slug] — DoctorCard is A05's component and is not duplicated.
 * - CTA links to /free-consultation (primary) and /contact (secondary); this
 *   page performs no mock submission and invents no methodology.
 */

import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Building2Icon,
  CalendarCheckIcon,
  CircleCheckIcon,
  ClipboardListIcon,
  MapPinIcon,
  ShieldCheckIcon,
  StarIcon,
  StethoscopeIcon,
  UsersIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { EmptyState } from "@/components/shared/empty-state"
import { SectionHeading } from "@/components/shared/section-heading"
import { StatusBadge } from "@/components/shared/status-badge"
import { ProviderSectionNav } from "@/features/providers/components/provider-section-nav"
import { RatingPair } from "@/features/ratings/rating-pair"
import { VerificationBadge } from "@/features/providers/components/verification-badge"
import { getHospitalBySlug, getRelatedDoctors, getTreatmentById } from "@/lib/search"
import { hospitals, reviewsForProvider, specialtyById } from "@/data"
import { appointmentRequestHref, doctorProfileHref, hospitalProfileHref, ROUTES } from "@/constants/routes"
import { RATING_LABELS } from "@/constants/rating"

export const dynamicParams = false

export async function generateStaticParams() {
  return hospitals.map((hospital) => ({ slug: hospital.slug }))
}

type HospitalProfilePageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: HospitalProfilePageProps): Promise<Metadata> {
  const { slug } = await params
  const hospital = getHospitalBySlug(slug)
  if (!hospital) {
    return { title: "Hospital not found" }
  }
  return {
    title: hospital.name,
    description: `${hospital.name} — ${hospital.facilityType} in ${hospital.city}, ${hospital.state}. Independent patient experience (PER) and clinical expertise (CER) ratings.`,
    alternates: { canonical: hospitalProfileHref(hospital.slug) },
  }
}

export default async function HospitalProfilePage({ params }: HospitalProfilePageProps) {
  const { slug } = await params
  const hospital = getHospitalBySlug(slug)
  if (!hospital) {
    notFound()
  }

  const doctors = getRelatedDoctors(hospital.id)
  const reviews = reviewsForProvider("hospital", hospital.id)
  const publishedReviews = reviews.filter((review) => review.status === "published")
  const specialtyNames = hospital.specialties
    .map((id) => specialtyById[id]?.name)
    .filter((name): name is string => name !== undefined)
  const treatmentNames = hospital.treatments
    .map((id) => getTreatmentById(id)?.name)
    .filter((name): name is string => name !== undefined)

  const consultationHref = appointmentRequestHref("hospital", hospital.id)
  const contactHref = ROUTES.public.contact

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "ratings", label: "Ratings" },
    { id: "specialties", label: "Specialties & treatments" },
    { id: "doctors", label: "Doctors" },
    { id: "accreditations", label: "Accreditations" },
    { id: "reviews", label: "Patient reviews" },
  ]

  return (
    <div className="space-y-8 py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: ROUTES.public.home },
          { label: "Hospitals", href: ROUTES.public.hospitals },
          { label: hospital.name },
        ]}
      />

      {/* Identity + verified state */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">{hospital.name}</h1>
              <VerificationBadge status={hospital.verificationStatus} />
            </div>
            <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPinIcon aria-hidden className="size-4" />
                {hospital.city}, {hospital.state}, {hospital.country}
              </span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <Building2Icon aria-hidden className="size-4" />
                {hospital.facilityType}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="cta" className="rounded-full px-5 font-semibold shadow-sm" render={<Link href={consultationHref} />}>
              <CalendarCheckIcon data-icon="inline-start" />
              Request appointment
              <span className="sr-only"> at {hospital.name}</span>
            </Button>
            <Button variant="outline" render={<Link href={contactHref} />}>
              Contact
            </Button>
          </div>
        </div>
        {hospital.image ? (
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl bg-muted">
            <Image
              src={hospital.image}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 1280px"
              className="object-cover"
              priority
              unoptimized
            />
          </div>
        ) : null}
        <ProviderSectionNav sections={sections} />
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-10">
          {/* Overview */}
          <section id="overview" className="space-y-3 scroll-mt-24">
            <SectionHeading as="h2" title="Overview" />
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{hospital.overview}</p>
            <p className="max-w-3xl text-xs text-muted-foreground">
              Profile information is supplied by the hospital and updated through our verification workflows.
            </p>
          </section>

          {/* Ratings — PER and CER side by side, never combined */}
          <section id="ratings" className="space-y-3 scroll-mt-24">
            <SectionHeading
              as="h2"
              title="Independent ratings"
              description="Patient experience and clinical expertise are assessed separately. There is no overall or combined hospital score."
            />
            <RatingPair per={hospital.ratings.per} cer={hospital.ratings.cer} headingLevel="h3" />
          </section>

          {/* Specialties & treatments — names resolved from the fixture lookup maps */}
          <section id="specialties" className="space-y-3 scroll-mt-24">
            <SectionHeading as="h2" title="Specialties & treatments" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="pb-0">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <StethoscopeIcon aria-hidden className="size-4 text-primary" />
                    Specialties
                  </p>
                </CardHeader>
                <CardContent>
                  {specialtyNames.length > 0 ? (
                    <ul className="flex flex-wrap gap-1.5">
                      {specialtyNames.map((name) => (
                        <li key={name}>
                          <Badge variant="outline">{name}</Badge>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No specialties listed.</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-0">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <ClipboardListIcon aria-hidden className="size-4 text-primary" />
                    Treatments
                  </p>
                </CardHeader>
                <CardContent>
                  {treatmentNames.length > 0 ? (
                    <ul className="flex flex-wrap gap-1.5">
                      {treatmentNames.map((name) => (
                        <li key={name}>
                          <Badge variant="outline">{name}</Badge>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No treatments listed.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Doctors — plain link list; DoctorCard belongs to A05 and is not duplicated */}
          <section id="doctors" className="space-y-3 scroll-mt-24">
            <SectionHeading
              as="h2"
              title="Doctors at this hospital"
              description="Doctors associated with this hospital."
            />
            {doctors.length > 0 ? (
              <ul className="grid gap-2 sm:grid-cols-2">
                {doctors.map((doctor) => (
                  <li key={doctor.id}>
                    <Link
                      href={doctorProfileHref(doctor.slug)}
                      className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-foreground">{doctor.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {specialtyById[doctor.specialization]?.name ?? "Specialist"} · {doctor.city}
                        </span>
                      </span>
                      <StatusBadge status={doctor.verificationStatus} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={UsersIcon}
                title="No associated doctors listed"
                description="This hospital has no associated doctors listed yet."
              />
            )}
          </section>

          {/* Accreditations — statuses rendered exactly as recorded in the mock data */}
          <section id="accreditations" className="space-y-3 scroll-mt-24">
            <SectionHeading
              as="h2"
              title="Accreditations"
              description="Verification states are shown exactly as recorded — nothing is shown as verified without a verified record."
            />
            {hospital.accreditations.length > 0 ? (
              <ul className="space-y-2">
                {hospital.accreditations.map((accreditation, index) => (
                  <li key={`${hospital.id}-accreditation-${index}`}>
                    <Card size="sm">
                      <CardContent className="flex flex-wrap items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">{accreditation.name}</p>
                          {accreditation.validUntil ? (
                            <p className="text-xs text-muted-foreground">Valid until {accreditation.validUntil}</p>
                          ) : null}
                        </div>
                        <VerificationBadge status={accreditation.status} />
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={ShieldCheckIcon}
                title="No accreditations listed"
                description="This hospital has no accreditation records listed yet."
              />
            )}
          </section>

          {/* Reviews — individual patient opinions, distinct from PER/CER */}
          <section id="reviews" className="space-y-3 scroll-mt-24">
            <SectionHeading
              as="h2"
              title="Patient reviews"
              description="Individual patient feedback. Review stars are personal opinions — they are separate from the independent PER/CER assessments above."
            />
            {publishedReviews.length > 0 ? (
              <ul className="space-y-3">
                {publishedReviews.map((review) => (
                  <li key={review.id}>
                    <Card size="sm">
                      <CardContent className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">{review.title}</p>
                          <p
                            className="flex items-center gap-1 text-sm font-semibold text-foreground"
                            aria-label={`Rated ${review.rating} out of ${review.scaleMax}`}
                          >
                            <StarIcon aria-hidden className="size-4 text-warning" />
                            {review.rating}/{review.scaleMax}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.body}</p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <StatusBadge status={review.reviewerVerification} />
                          <span aria-hidden>·</span>
                          <time dateTime={review.createdAt}>
                            {new Date(review.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                          </time>
                        </div>
                        {review.reply ? (
                          <div className="rounded-md bg-muted/50 p-3">
                            <p className="text-xs font-medium text-foreground">Reply from {review.reply.repliedBy}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{review.reply.body}</p>
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={StarIcon}
                title="No published reviews yet"
                description="Patient reviews appear here once published."
              />
            )}
          </section>
        </div>

        {/* Sticky side CTA (desktop two-column per 05 spec) */}
        <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Enquiry and contact">
          <Card>
            <CardHeader className="pb-0">
              <p className="text-base font-semibold text-foreground">Request a free consultation</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Submit an enquiry and our coordination team will respond. An enquiry is not a confirmed appointment until the hospital confirms.
              </p>
              <Button variant="cta" className="w-full rounded-full font-semibold shadow-sm" render={<Link href={consultationHref} />}>
                <CalendarCheckIcon data-icon="inline-start" />
                Start free consultation request
              </Button>
              <Button variant="outline" className="w-full" render={<Link href={contactHref} />}>
                Contact the team
              </Button>
              <Separator />
              <dl className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-start gap-1.5">
                  <dt className="sr-only">Ratings model</dt>
                  <CircleCheckIcon aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                  <dd>
                    {RATING_LABELS.PER} and {RATING_LABELS.CER} are independent — never combined.
                  </dd>
                </div>
                <div className="flex items-start gap-1.5">
                  <dt className="sr-only">Data provenance</dt>
                  <ShieldCheckIcon aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                  <dd>Ratings and reviews reflect recorded assessments and published patient feedback — never a combined score.</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
