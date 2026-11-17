import Link from "next/link"
import {
  GlobeIcon,
  HeartIcon,
  MessagesSquareIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/shared/section-heading"
import { TestimonialCard } from "@/features/content/testimonial-card"
import { FaqList } from "@/features/content/faq-list"
import type { Faq, Specialty, Testimonial } from "@/types"
import { ROUTES } from "@/constants/routes"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------
 * Shared section heading
 * ----------------------------------------------------------------------- */

export interface HomeSectionHeadingProps {
  title: string
  description?: string
  /** Optional trailing "View all" link. */
  viewAll?: { label: string; href: string }
  className?: string
}

export function HomeSectionHeading({
  title,
  description,
  viewAll,
  className,
}: HomeSectionHeadingProps) {
  return (
    <SectionHeading
      as="h2"
      title={title}
      description={description}
      className={className}
      action={
        viewAll ? (
          <Link
            href={viewAll.href}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {viewAll.label}
            <span aria-hidden>→</span>
          </Link>
        ) : undefined
      }
    />
  )
}

/* -------------------------------------------------------------------------
 * Specialty tiles + facility category grid
 * ----------------------------------------------------------------------- */

export interface SpecialtyTileGridProps {
  specialties: readonly Specialty[]
  className?: string
}

/** Specialty tiles → /treatments?specialty=<slug> (A06 route owns the param). */
export function SpecialtyTileGrid({
  specialties,
  className,
}: SpecialtyTileGridProps) {
  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5",
        className
      )}
    >
      {specialties.map((specialty) => (
        <li key={specialty.id}>
          <Link
            href={`${ROUTES.public.treatments}?specialty=${encodeURIComponent(specialty.slug)}`}
            className="group flex h-full flex-col gap-1 rounded-xl bg-card p-4 text-center shadow-xs ring-1 ring-foreground/10 transition-colors outline-none hover:ring-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary/10">
              <HeartPulseGlyph />
            </span>
            <span className="mt-1 text-sm font-medium text-foreground group-hover:text-primary">
              {specialty.name}
            </span>
            <span className="line-clamp-2 text-xs text-muted-foreground">
              {specialty.description}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

function HeartPulseGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="size-5 text-primary"
    >
      <path d="M19 14c1.49-1.55 3-3.29 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.21 1.51 3.95 3 5.5l7 7Z" />
      <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
    </svg>
  )
}

export interface FacilityCategoryEntry {
  label: string
  description: string
  href: string
  count: number
}

export interface FacilityCategoryGridProps {
  /** Category entries with counts derived from @/data facilities. */
  categories: readonly FacilityCategoryEntry[]
  className?: string
}

/** Facility category cards → /facilities?category=... (A03 route). */
export function FacilityCategoryGrid({
  categories,
  className,
}: FacilityCategoryGridProps) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {categories.map((category) => (
        <Link
          key={category.href}
          href={category.href}
          className="group flex flex-col gap-1 rounded-xl bg-card p-5 shadow-xs ring-1 ring-foreground/10 transition-colors outline-none hover:ring-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="font-semibold text-foreground group-hover:text-primary">
            {category.label}
          </span>
          <span className="text-sm text-muted-foreground">
            {category.description}
          </span>
          <span className="mt-2 text-xs font-medium text-primary">
            {category.count} demo{" "}
            {category.count === 1 ? "listing" : "listings"}
          </span>
        </Link>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------
 * Medical tourism block
 * ----------------------------------------------------------------------- */

export interface MedicalTourismBlockProps {
  className?: string
}

/** Medical-tourism discovery block linking into A06 routes. */
export function MedicalTourismBlock({ className }: MedicalTourismBlockProps) {
  const points: readonly { title: string; body: string }[] = [
    {
      title: "Treatment discovery",
      body: "Browse demo treatment pages to understand what different listed providers offer.",
    },
    {
      title: "Enquiry and coordination",
      body: "Raise an international-patient enquiry; a demo coordinator workflow tracks its status.",
    },
    {
      title: "Travel assistance information",
      body: "See what travel-assistance support the demo programme describes for visiting patients.",
    },
  ]

  return (
    <div
      className={cn(
        "grid gap-6 rounded-2xl bg-card p-6 shadow-xs ring-1 ring-foreground/10 lg:grid-cols-[1.1fr_1fr] lg:p-8",
        className
      )}
    >
      <div className="space-y-4">
        <p className="flex items-center gap-2 text-sm font-semibold tracking-wide text-primary uppercase">
          <GlobeIcon aria-hidden className="size-4" />
          Medical tourism support
        </p>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Planning care away from home
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
          The platform includes a dedicated medical-tourism module for patients
          considering travel to India for care — from treatment discovery to
          enquiry coordination and travel-assistance information. All workflows
          in this demo are simulated.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button render={<Link href={ROUTES.public.medicalTourism} />}>
            Explore medical tourism
          </Button>
          <Button
            variant="outline"
            render={<Link href={ROUTES.public.internationalPatientEnquiry} />}
          >
            International patient enquiry
          </Button>
        </div>
      </div>
      <ul className="grid content-start gap-3">
        {points.map((point) => (
          <li key={point.title} className="rounded-lg border bg-background p-4">
            <h3 className="text-sm font-semibold text-foreground">
              {point.title}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {point.body}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* -------------------------------------------------------------------------
 * IUF consultation CTA
 * ----------------------------------------------------------------------- */

export interface IufConsultationCtaProps {
  className?: string
}

/** IUF-branded consultation CTA (FR-019 identity; scope owned by A07). */
export function IufConsultationCta({ className }: IufConsultationCtaProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-primary/25 bg-primary/5 p-6 sm:flex-row sm:items-center sm:justify-between lg:p-8",
        className
      )}
    >
      <div className="space-y-2">
        <p className="flex items-center gap-2 text-sm font-semibold tracking-wide text-primary uppercase">
          <SparklesIcon aria-hidden className="size-4" />
          International Urban Forum Supported Initiative
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">
          Request a free consultation (demo)
        </h2>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          The consultation flow is an IUF-supported initiative on the platform.
          Scope, eligibility and cost boundaries are described on the
          consultation page before any request is made. This demo does not
          submit anything.
        </p>
      </div>
      <Button
        size="lg"
        render={<Link href={ROUTES.public.freeConsultation} />}
        className="shrink-0"
      >
        Start free consultation
      </Button>
    </div>
  )
}

/* -------------------------------------------------------------------------
 * Trust values block
 * ----------------------------------------------------------------------- */

export interface TrustValuesBlockProps {
  className?: string
}

const trustValues: readonly {
  icon: typeof ShieldCheckIcon
  title: string
  body: string
}[] = [
  {
    icon: ShieldCheckIcon,
    title: "Verification states, shown honestly",
    body: "Provider profiles carry their actual verification status from the demo data — verified, pending or unverified.",
  },
  {
    icon: StarIcon,
    title: "Ratings that stay independent",
    body: "Patient experience, clinical expertise and medical expertise are separate ratings with visible methodology metadata — never merged into one score.",
  },
  {
    icon: MessagesSquareIcon,
    title: "Enquiries with clear boundaries",
    body: "Enquiry and appointment flows are request workflows; a request is not a confirmed booking in the demo.",
  },
  {
    icon: HeartIcon,
    title: "Patient-first information design",
    body: "Discovery pages lead with plain language, readable ratings and clear next steps — not clinical claims.",
  },
]

export function TrustValuesBlock({ className }: TrustValuesBlockProps) {
  return (
    <ul className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {trustValues.map((value) => (
        <li
          key={value.title}
          className="flex h-full flex-col gap-2 rounded-xl bg-card p-5 shadow-xs ring-1 ring-foreground/10"
        >
          <value.icon aria-hidden className="size-6 text-primary" />
          <h3 className="font-semibold text-foreground">{value.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {value.body}
          </p>
        </li>
      ))}
    </ul>
  )
}

/* -------------------------------------------------------------------------
 * Testimonials + FAQ sections (shared by home; FAQ also reused on methodology)
 * ----------------------------------------------------------------------- */

export interface TestimonialsSectionProps {
  testimonials: readonly Testimonial[]
  className?: string
}

/** Fictional patient stories, explicitly labelled. */
export function TestimonialsSection({
  testimonials,
  className,
}: TestimonialsSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <HomeSectionHeading
        title="Patient stories (fictional)"
        description="The stories below are fictional demo fixtures created to illustrate the testimonial layout. They do not describe real patients, providers or outcomes."
      />
      {testimonials.length === 0 ? (
        <p className="rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
          No demo testimonials are configured yet.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      )}
    </div>
  )
}

export interface HomeFaqSectionProps {
  faqs: readonly Faq[]
  className?: string
}

/** FAQ accordion section wired to the shared FaqList. */
export function HomeFaqSection({ faqs, className }: HomeFaqSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <HomeSectionHeading
        title="Frequently asked questions"
        description="Short answers about how the demo platform presents providers, ratings and requests."
      />
      {faqs.length === 0 ? (
        <p className="rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
          No FAQs are configured in the demo data yet.
        </p>
      ) : (
        <FaqList faqs={faqs} />
      )}
    </div>
  )
}
