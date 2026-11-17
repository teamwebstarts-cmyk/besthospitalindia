/**
 * /doctors/[slug] — doctor profile (Agent A05).
 *
 * Spec source: implementation/pages/08-doctor-profile.md:
 * identity/verification; specialization; qualifications; experience;
 * registration; hospitals; treatments; languages; PER + MER (independent);
 * verified reviews; consultation CTA.
 *
 * Next.js 16 conventions: `params` is a Promise; `generateStaticParams`
 * prerenders fixture slugs and `dynamicParams = false` 404s unknown slugs;
 * `generateMetadata` uses only safe factual fields from the mock record —
 * no clinical claims.
 *
 * RATINGS RULE: PER and MER render as separate, visually distinct modules and
 * are never combined. `score: null` renders "Not yet rated" — never 0/5.
 */

import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  BadgeCheckIcon,
  Building2Icon,
  CalendarClockIcon,
  GraduationCapIcon,
  LanguagesIcon,
  MessageSquareQuoteIcon,
  ShieldQuestionIcon,
  StethoscopeIcon,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { EmptyState } from "@/components/shared/empty-state"
import { SectionHeading } from "@/components/shared/section-heading"
import { StatusBadge } from "@/components/shared/status-badge"
import { doctors, reviewsForProvider, specialtyById } from "@/data"
import { hospitalProfileHref, ROUTES } from "@/constants/routes"
import { getDoctorBySlug, getHospitalById, getTreatmentById } from "@/lib/search"
import { RatingPanel } from "@/features/ratings/rating-panel"
import { VerificationBadge } from "@/features/providers/components/verification-badge"
import { ProviderSectionNav } from "@/features/providers/components/provider-section-nav"
import type { Review } from "@/types"

// ---------------------------------------------------------------------------
// Data access
// ---------------------------------------------------------------------------

interface DoctorProfilePageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams(): Array<{ slug: string }> {
  return doctors.map((doctor) => ({ slug: doctor.slug }))
}

/** Only fixture slugs exist at build time (dynamicParams = false). */
export const dynamicParams = false

export async function generateMetadata({ params }: DoctorProfilePageProps): Promise<Metadata> {
  const { slug } = await params
  const doctor = getDoctorBySlug(slug)
  if (!doctor) {
    return { title: "Doctor not found" }
  }

  const specialization = specialtyById[doctor.specialization]?.name
  // Safe factual fields only — no outcome claims, no fabricated credentials.
  const titleParts = [doctor.name]
  if (specialization) titleParts.push(specialization)
  titleParts.push(doctor.city)

  return {
    title: titleParts.join(" — "),
    description: `Demo profile for ${doctor.name}${specialization ? `, ${specialization}` : ""}, in ${doctor.city}, India. Fictional demo data only — no clinical claims.`,
  }
}

// ---------------------------------------------------------------------------
// Presentational helpers
// ---------------------------------------------------------------------------

/** Label lookup tables resolve relational fixture ids to demo display text. */
const VERIFICATION_LABELS: Record<Review["reviewerVerification"], string> = {
  unverified: "Unverified reviewer (demo)",
  email_verified: "Email-verified reviewer (demo)",
  verified_patient: "Verified patient (demo)",
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

function ProfileSection({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string
  icon: typeof StethoscopeIcon
  title: string
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby={`${id}-heading`} id={id} className="scroll-mt-24">
      <div className="mb-3 flex items-center gap-2">
        <Icon aria-hidden className="size-5 text-primary" />
        <h2 id={`${id}-heading`} className="text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
      </div>
      {children}
    </section>
  )
}

function DetailList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Not available in the demo record.</p>
  }
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item}>
          <Badge variant="outline" className="px-2.5 py-1 text-sm">
            {item}
          </Badge>
        </li>
      ))}
    </ul>
  )
}

/** Doctor reviews — only the review text is shown; the star value is not a PER/MER module. */
function DoctorReviews({ reviews, doctorName }: { reviews: readonly Review[]; doctorName: string }) {
  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={MessageSquareQuoteIcon}
        title="No published reviews yet"
        description={`There are no published patient reviews for ${doctorName} in the demo dataset.`}
      />
    )
  }

  return (
    <ul className="space-y-3">
      {reviews.map((review) => (
        <li key={review.id}>
          <Card size="sm">
            <CardContent className="gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-foreground">{review.title}</p>
                <StatusBadge
                  status={review.status}
                  label={REVIEW_STATUS_LABELS[review.status]}
                  className="shrink-0"
                />              </div>
              <p className="text-sm text-muted-foreground">{review.body}</p>
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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function DoctorProfilePage({ params }: DoctorProfilePageProps) {
  const { slug } = await params
  const doctor = getDoctorBySlug(slug)
  if (!doctor) {
    notFound()
  }

  const specializationName = specialtyById[doctor.specialization]?.name
  const hospitals = doctor.hospitalIds
    .map((hospitalId) => getHospitalById(hospitalId))
    .filter((hospital): hospital is NonNullable<typeof hospital> => hospital !== undefined)
  const treatments = doctor.treatments
    .map((treatmentId) => getTreatmentById(treatmentId))
    .filter((treatment): treatment is NonNullable<typeof treatment> => treatment !== undefined)
  const doctorReviews = reviewsForProvider("doctor", doctor.id).filter(
    (review) => review.status === "published"
  )

  const sections = [
    { id: "credentials", label: "Credentials" },
    { id: "experience", label: "Experience" },
    { id: "hospitals", label: "Hospitals" },
    { id: "treatments", label: "Treatments" },
    { id: "languages", label: "Languages" },
    { id: "ratings", label: "Ratings" },
    { id: "reviews", label: "Reviews" },
  ]

  return (
    <div className="space-y-6 py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Doctors", href: ROUTES.public.doctors },
          { label: doctor.name },
        ]}
      />

      {/* Identity + verification — profile header */}
      <Card>
        <CardContent className="gap-4 sm:flex-row sm:items-start">
          <Avatar className="size-20 shrink-0">
            {doctor.photo ? (
              <AvatarImage src={doctor.photo} alt={`Portrait of ${doctor.name} (demo)`} />
            ) : null}
            <AvatarFallback aria-hidden>
              {doctor.name
                .replace(/^Dr\.?\s*/i, "")
                .split(/\s+/)
                .map((part) => part.charAt(0))
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {doctor.name}
              </h1>
              <VerificationBadge status={doctor.verificationStatus} />
            </div>
            <p className="text-base text-muted-foreground">
              <span className="font-medium text-foreground">
                {specializationName ?? "Specialist"}
              </span>
              {" · "}
              {doctor.city}, {doctor.state}, {doctor.country}
            </p>
            <p className="text-xs text-muted-foreground">
              Fictional demo profile — all names, registrations and ratings are demo data.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button variant="cta" className="rounded-full px-5 font-semibold shadow-sm" render={<Link href={ROUTES.public.freeConsultation} />}>
                Request free consultation
              </Button>
              <Button variant="outline" render={<Link href="#ratings" />}>
                View ratings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProviderSectionNav sections={sections} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-8">
          <ProfileSection id="credentials" icon={GraduationCapIcon} title="Credentials">
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-sm font-medium text-foreground">Qualifications</h3>
                <DetailList items={doctor.qualifications} />
              </div>
              <div>
                <h3 className="mb-2 text-sm font-medium text-foreground">Medical registration</h3>
                <Card size="sm">
                  <CardContent className="gap-2">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{doctor.registration.authority}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Registration number:{" "}
                      <span className="font-mono">{doctor.registration.numberMasked}</span>{" "}
                      <span className="text-xs">(masked for privacy)</span>
                    </p>
                    <VerificationBadge status={doctor.registration.status} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </ProfileSection>

          <ProfileSection id="experience" icon={StethoscopeIcon} title="Experience">
            {doctor.yearsExperience !== null ? (
              <p className="flex items-center gap-2 text-sm text-foreground">
                <CalendarClockIcon aria-hidden className="size-4 text-muted-foreground" />
                {doctor.yearsExperience} years of experience (demo record)
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Experience details are not available in the demo record.
              </p>
            )}
          </ProfileSection>

          <ProfileSection id="hospitals" icon={Building2Icon} title="Hospital associations">
            {hospitals.length > 0 ? (
              <ul className="space-y-3">
                {hospitals.map((hospital) => (
                  <li key={hospital.id}>
                    <Card size="sm">
                      <CardContent className="gap-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-medium text-foreground">{hospital.name}</p>
                          <VerificationBadge status={hospital.verificationStatus} className="shrink-0" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {hospital.city}, {hospital.state} · {hospital.facilityType}
                        </p>
                        <Button
                          variant="link"
                          size="sm"
                          className="px-0"
                          render={<Link href={hospitalProfileHref(hospital.slug)} />}
                        >
                          View hospital profile
                          <span className="sr-only"> — {hospital.name}</span>
                        </Button>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={Building2Icon}
                title="No hospital associations"
                description="This demo doctor record has no linked hospitals."
              />
            )}
          </ProfileSection>

          <ProfileSection id="treatments" icon={BadgeCheckIcon} title="Treatments">
            <DetailList items={treatments.map((treatment) => treatment.name)} />
          </ProfileSection>

          <ProfileSection id="languages" icon={LanguagesIcon} title="Languages">
            <DetailList items={doctor.languages} />
          </ProfileSection>

          <ProfileSection id="ratings" icon={ShieldQuestionIcon} title="Ratings">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                PER and MER are independent ratings with separate methodologies. They are never
                combined into a single score.
              </p>
              {/* One RatingPanel per kind — never a combined module (08 catalog RatingPair). */}
              <div className="grid gap-3 sm:grid-cols-2" data-slot="doctor-rating-pair">
                <RatingPanel rating={doctor.ratings.per} headingLevel="h3" />
                <RatingPanel rating={doctor.ratings.mer} headingLevel="h3" />
              </div>
            </div>
          </ProfileSection>

          <ProfileSection id="reviews" icon={MessageSquareQuoteIcon} title="Patient reviews">
            <DoctorReviews reviews={doctorReviews} doctorName={doctor.name} />
          </ProfileSection>
        </div>

        {/* CTA panel — consultation/appointment request */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardContent className="gap-3">
              <SectionHeading as="h3" title="Request a consultation" className="block" />
              <p className="text-sm text-muted-foreground">
                Submit a free consultation request and the demo coordination team will follow up.
                No real booking is created — this is a mock flow.
              </p>
              <Button variant="cta" className="w-full rounded-full font-semibold shadow-sm" render={<Link href={ROUTES.public.freeConsultation} />}>
                Request free consultation
              </Button>
            </CardContent>
          </Card>
          <Separator />
          <p className="text-xs text-muted-foreground">
            All profile content is fictional demo data for the BestHospitalIndia demo build. No
            real credentials, outcomes or bookings are represented.
          </p>
        </aside>
      </div>
    </div>
  )
}
