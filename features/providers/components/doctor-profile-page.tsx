import type { ReactNode } from "react"
import Link from "next/link"
import { Building2Icon, MapPinIcon, MessageSquareQuoteIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { EmptyState } from "@/components/shared/empty-state"
import { SectionHeading } from "@/components/shared/section-heading"
import { StatusBadge } from "@/components/shared/status-badge"
import { doctorProfileHref, hospitalProfileHref, ROUTES } from "@/constants/routes"
import { AppointmentRequestForm } from "@/features/appointments/appointment-request-form"
import { RatingPair } from "@/features/ratings/rating-pair"
import { VerificationBadge } from "@/features/providers/components/verification-badge"
import { ProviderSectionNav } from "@/features/providers/components/provider-section-nav"
import type { Doctor, Hospital, Review, Treatment } from "@/types"

const VERIFICATION_LABELS: Record<Review["reviewerVerification"], string> = {
  unverified: "Unverified reviewer",
  email_verified: "Email-verified reviewer",
  verified_patient: "Verified patient",
}

const REVIEW_STATUS_LABELS = {
  published: "Published",
  pending_moderation: "Pending moderation",
  flagged: "Flagged",
  rejected: "Rejected",
} as const

function formatReviewDate(isoTimestamp: string): string {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(isoTimestamp))
}

function TagList({ items, emptyLabel }: { items: string[]; emptyLabel: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>
  }
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li key={item}>
          <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-medium sm:text-sm">
            {item}
          </Badge>
        </li>
      ))}
    </ul>
  )
}

function ProfileBlock({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24 space-y-3">
      <SectionHeading as="h2" id={`${id}-heading`} title={title} description={description} />
      {children}
    </section>
  )
}

function DoctorReviews({ reviews, doctorName }: { reviews: readonly Review[]; doctorName: string }) {
  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={MessageSquareQuoteIcon}
        title="No published reviews yet"
        description={`There are no published patient reviews for ${doctorName} yet.`}
      />
    )
  }

  return (
    <ul className="space-y-3">
      {reviews.map((review) => (
        <li key={review.id}>
          <Card size="sm">
            <CardContent className="gap-2 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-foreground">{review.title}</p>
                <StatusBadge
                  status={review.status}
                  label={REVIEW_STATUS_LABELS[review.status]}
                  className="shrink-0"
                />
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{review.body}</p>
              <p className="text-xs text-muted-foreground">
                {VERIFICATION_LABELS[review.reviewerVerification]} · {formatReviewDate(review.createdAt)}
              </p>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  )
}

export interface DoctorProfilePageViewProps {
  doctor: Doctor
  specializationName: string | undefined
  hospitals: readonly Hospital[]
  treatments: readonly Treatment[]
  doctorReviews: readonly Review[]
}

/**
 * Public doctor profile layout — scannable sections, minimal prose, sticky CTA.
 * Used by `/doctors/[slug]` for every fixture doctor.
 */
export function DoctorProfilePageView({
  doctor,
  specializationName,
  hospitals,
  treatments,
  doctorReviews,
}: DoctorProfilePageViewProps) {
  const treatmentNames = treatments.map((treatment) => treatment.name)
  const profileHref = doctorProfileHref(doctor.slug)
  const appointmentProvider = {
    type: "doctor" as const,
    id: doctor.id,
    name: doctor.name,
    specialty: specializationName ?? "Doctor",
    location: `${doctor.city}, ${doctor.state}`,
  }
  const treatmentOptions = treatments.map((treatment) => ({
    id: treatment.id,
    name: treatment.name,
  }))

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "hospitals", label: "Hospitals" },
    { id: "practice", label: "Treatments" },
    { id: "ratings", label: "Ratings" },
    { id: "reviews", label: "Reviews" },
  ]

  const initials = doctor.name
    .replace(/^Dr\.?\s*/i, "")
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div className="space-y-6 py-6 sm:py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: ROUTES.public.home },
          { label: "Doctors", href: ROUTES.public.doctors },
          { label: doctor.name },
        ]}
      />

      <header className="overflow-hidden rounded-xl border border-border/70 bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <Avatar className="size-20 shrink-0 ring-2 ring-primary/10 sm:size-24">
            {doctor.photo ? (
              <AvatarImage src={doctor.photo} alt="" />
            ) : null}
            <AvatarFallback className="text-base font-semibold">{initials}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{doctor.name}</h1>
              <VerificationBadge status={doctor.verificationStatus} />
            </div>

            <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{specializationName ?? "Specialist"}</span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <MapPinIcon aria-hidden className="size-3.5 shrink-0 text-primary/80" />
                {doctor.city}, {doctor.state}
              </span>
            </p>

            <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3 sm:gap-3">
              {doctor.yearsExperience !== null ? (
                <div className="rounded-lg bg-muted/50 px-3 py-2">
                  <dt className="text-[0.6875rem] font-medium tracking-wide text-muted-foreground uppercase">
                    Experience
                  </dt>
                  <dd className="mt-0.5 font-semibold text-foreground tabular-nums">
                    {doctor.yearsExperience} years
                  </dd>
                </div>
              ) : null}
              <div className="rounded-lg bg-muted/50 px-3 py-2">
                <dt className="text-[0.6875rem] font-medium tracking-wide text-muted-foreground uppercase">
                  Hospitals
                </dt>
                <dd className="mt-0.5 font-semibold text-foreground tabular-nums">{hospitals.length}</dd>
              </div>
              <div className="rounded-lg bg-muted/50 px-3 py-2">
                <dt className="text-[0.6875rem] font-medium tracking-wide text-muted-foreground uppercase">
                  Languages
                </dt>
                <dd className="mt-0.5 truncate font-semibold text-foreground">{doctor.languages.join(", ")}</dd>
              </div>
            </dl>

            <div className="flex flex-wrap gap-2 lg:hidden">
              <Button
                variant="cta"
                className="h-11 flex-1 rounded-full px-5 font-semibold shadow-sm sm:flex-none"
                render={<a href="#appointment">Request appointment</a>}
              >
                Request appointment
              </Button>
              <Button variant="outline" className="h-11" render={<Link href="#ratings" />}>
                Ratings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <ProviderSectionNav sections={sections} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_min(20rem,34vw)] lg:items-start lg:gap-8">
        <aside
          id="appointment"
          className="order-1 space-y-2 lg:sticky lg:top-[calc(var(--site-header-offset,7.75rem)+0.5rem)] lg:order-2 lg:max-h-[calc(100svh-var(--site-header-offset,7.75rem)-1rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain"
        >
          <AppointmentRequestForm
            variant="sidebar"
            provider={appointmentProvider}
            treatments={treatmentOptions}
            backHref={profileHref}
          />
          <p className="hidden px-1 text-[0.6875rem] leading-relaxed text-muted-foreground lg:block">
            Informational only — not medical advice.
          </p>
        </aside>

        <div className="order-2 min-w-0 space-y-10 lg:order-1">
          <ProfileBlock id="overview" title="Overview">
            <Card className="border-border/70 shadow-none">
              <CardContent className="gap-5 p-4 sm:p-5">
                <div className="space-y-2">
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Qualifications
                  </p>
                  <TagList items={doctor.qualifications} emptyLabel="Not listed." />
                </div>

                <div className="flex flex-wrap items-start justify-between gap-3 border-t border-border/60 pt-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Registration
                    </p>
                    <p className="text-sm font-medium text-foreground">{doctor.registration.authority}</p>
                    <p className="font-mono text-xs text-muted-foreground">{doctor.registration.numberMasked}</p>
                  </div>
                  <VerificationBadge status={doctor.registration.status} />
                </div>
              </CardContent>
            </Card>
          </ProfileBlock>

          <ProfileBlock id="hospitals" title="Hospital associations">
            {hospitals.length > 0 ? (
              <ul className="divide-y divide-border/70 overflow-hidden rounded-xl border border-border/70 bg-card">
                {hospitals.map((hospital) => (
                  <li key={hospital.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 space-y-0.5">
                      <p className="flex items-center gap-1.5 font-medium text-foreground">
                        <Building2Icon aria-hidden className="size-4 shrink-0 text-primary/80" />
                        <span className="truncate">{hospital.name}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {hospital.city}, {hospital.state} · {hospital.facilityType}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
                      <VerificationBadge status={hospital.verificationStatus} />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-full px-3 text-xs"
                        render={<Link href={hospitalProfileHref(hospital.slug)} />}
                      >
                        View profile
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={Building2Icon}
                title="No hospital associations"
                description="This doctor has no linked hospitals listed yet."
              />
            )}
          </ProfileBlock>

          <ProfileBlock id="practice" title="Treatments & languages">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-border/70 shadow-none">
                <CardContent className="gap-2 p-4">
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Treatments
                  </p>
                  <TagList items={treatmentNames} emptyLabel="No treatments listed." />
                </CardContent>
              </Card>
              <Card className="border-border/70 shadow-none">
                <CardContent className="gap-2 p-4">
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Languages
                  </p>
                  <TagList items={doctor.languages} emptyLabel="Not listed." />
                </CardContent>
              </Card>
            </div>
          </ProfileBlock>

          <ProfileBlock
            id="ratings"
            title="Independent ratings"
            description="PER and MER are separate scores — never combined."
          >
            <RatingPair per={doctor.ratings.per} mer={doctor.ratings.mer} headingLevel="h3" />
          </ProfileBlock>

          <ProfileBlock id="reviews" title="Patient reviews">
            <DoctorReviews reviews={doctorReviews} doctorName={doctor.name} />
          </ProfileBlock>
        </div>
      </div>
    </div>
  )
}