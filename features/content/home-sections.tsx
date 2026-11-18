import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  ActivityIcon,
  ArrowUpRightIcon,
  BabyIcon,
  BanknoteIcon,
  BoneIcon,
  BrainIcon,
  Building2Icon,
  ChevronRightIcon,
  ClipboardCheckIcon,
  ClipboardListIcon,
  DropletsIcon,
  DumbbellIcon,
  EyeIcon,
  FlaskConicalIcon,
  GlobeIcon,
  HeartIcon,
  HeartPulseIcon,
  LeafIcon,
  MapPinnedIcon,
  MessagesSquareIcon,
  PlaneIcon,
  RibbonIcon,
  ScanIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
  StethoscopeIcon,
  WindIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  homeFeaturedTreatments,
  homePatientServices,
  type HomeFeaturedTreatmentItem,
  type HomePatientServiceItem,
} from "@/features/content/home-content"
import { TestimonialCard } from "@/features/content/testimonial-card"
import { FaqList } from "@/features/content/faq-list"
import type { Faq, FacilityCategory, Specialty, Testimonial } from "@/types"
import { ROUTES, treatmentDetailHref } from "@/constants/routes"
import { ScrollReveal, StaggerReveal } from "@/components/motion/scroll-reveal"
import { fullBleedClassName } from "@/lib/full-bleed"
import { homeInteractiveSurfaceClassName, homeInteractiveTileClassName } from "@/lib/home-motion"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------
 * Home layout shells (consistent section → inner → heading → content)
 * ----------------------------------------------------------------------- */

/** Constrained content column inside a full-bleed band (aligns with `main`). */
export const homeSectionInnerClassName =
  "mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8"

export interface HomeBleedBandProps {
  children: ReactNode
  /** Border/background utilities for the band surface. */
  surfaceClassName: string
  "aria-labelledby"?: string
  /** Centers copy inside the inner column (e.g. destinations). */
  align?: "start" | "center"
  className?: string
}

/** Full-bleed home band: section → inner column → children. */
export function HomeBleedBand({
  children,
  surfaceClassName,
  "aria-labelledby": ariaLabelledBy,
  align = "start",
  className,
}: HomeBleedBandProps) {
  return (
    <section
      aria-labelledby={ariaLabelledBy}
      className={cn(
        fullBleedClassName,
        "py-8 sm:py-10",
        surfaceClassName,
        className
      )}
    >
      <div
        className={cn(
          homeSectionInnerClassName,
          align === "center" && "text-center"
        )}
      >
        {children}
      </div>
    </section>
  )
}

export interface HomePageSectionProps {
  children: ReactNode
  "aria-labelledby"?: string
  className?: string
}

/** In-flow block inside main padded column (space-y-8 between heading and body). */
export function HomePageSection({
  children,
  "aria-labelledby": ariaLabelledBy,
  className,
}: HomePageSectionProps) {
  return (
    <section aria-labelledby={ariaLabelledBy} className={cn("space-y-8", className)}>
      {children}
    </section>
  )
}

/* -------------------------------------------------------------------------
 * Shared section heading
 * ----------------------------------------------------------------------- */

export interface HomeSectionHeadingProps {
  title: string
  description?: string
  /** Optional id on the h2 (for `aria-labelledby` on section wrappers). */
  headingId?: string
  /** Optional trailing "View all" link. */
  viewAll?: { label: string; href: string }
  className?: string
}

/**
 * Centered section heading used by every home band: title, optional lead and
 * an optional "View all" link stacked on one centered axis. Keeping every home
 * section on the same centered rhythm is what makes the long page read as
 * aligned rather than stitched together.
 */
export function HomeSectionHeading({
  title,
  description,
  headingId,
  viewAll,
  className,
}: HomeSectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 text-center sm:gap-2.5",
        className
      )}
    >
      <h2
        id={headingId}
        className="text-[1.75rem] leading-[1.2] font-bold tracking-tight text-balance text-foreground sm:text-[2.15rem]"
      >
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      ) : null}
      {viewAll ? (
        <Link
          href={viewAll.href}
          className="mt-0.5 inline-flex items-center gap-1 rounded text-sm font-semibold text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {viewAll.label}
          <span aria-hidden>→</span>
        </Link>
      ) : null}
    </div>
  )
}

/* -------------------------------------------------------------------------
 * Medical destination cities (home)
 * ----------------------------------------------------------------------- */

export interface MedicalDestinationCityCard {
  state: string
  imageSrc: string
  tagline: string
}

export interface MedicalDestinationCitiesProps {
  destinations: readonly MedicalDestinationCityCard[]
  title: string
  description: string
  /** Full-bleed band (default) or flush block inside a parent white band. */
  layout?: "band" | "embedded"
  className?: string
}

/** State destination cards → hospital directory filtered by `?state=`. */
export function MedicalDestinationCities({
  destinations,
  title,
  description,
  layout = "band",
  className,
}: MedicalDestinationCitiesProps) {
  const surfaceClassName =
    layout === "band"
      ? "border-y border-border/70 bg-background"
      : "border-b border-border/70 bg-background"

  return (
    <HomeBleedBand
      aria-labelledby="home-destinations-heading"
      align="center"
      surfaceClassName={surfaceClassName}
      className={className}
    >
      <ScrollReveal className="w-full">
        <HomeSectionHeading
          headingId="home-destinations-heading"
          title={title}
          description={description}
        />
      </ScrollReveal>
      <StaggerReveal
        as="ul"
        className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
        staggerMs={64}
      >
        {destinations.map((destination) => {
          const href = `${ROUTES.public.hospitals}?state=${encodeURIComponent(destination.state)}`
          const hoverHint = `View hospitals in ${destination.state}`

          return (
            <li key={destination.state}>
              <Link
                href={href}
                title={`${hoverHint} — ${href}`}
                aria-label={`Explore hospitals in ${destination.state}`}
                className={cn(
                  "group relative flex h-full overflow-hidden rounded-2xl border border-border/70 bg-card text-left shadow-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  homeInteractiveSurfaceClassName,
                  "hover:border-primary/35 hover:shadow-md"
                )}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  <Image
                    src={destination.imageSrc}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 240px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-linear-to-t from-foreground/80 via-foreground/20 to-foreground/5 transition-opacity duration-300 group-hover:from-foreground/85"
                  />
                  <span
                    aria-hidden
                    className={cn(
                      "absolute right-2.5 top-2.5 inline-flex size-8 items-center justify-center rounded-full border border-white/25 bg-white/15 text-white backdrop-blur-sm transition-all duration-300",
                      "group-hover:border-white/40 group-hover:bg-white/25 group-hover:scale-105"
                    )}
                  >
                    <ArrowUpRightIcon className="size-4" strokeWidth={2.25} />
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-3.5">
                    <p className="pr-10 text-base font-semibold tracking-tight text-white">
                      {destination.state}
                    </p>
                    <p className="mt-0.5 text-xs text-white/85">{destination.tagline}</p>
                    <p
                      aria-hidden
                      className="mt-2 max-h-0 overflow-hidden text-[10px] font-medium leading-snug text-white/70 opacity-0 transition-all duration-300 group-hover:max-h-8 group-hover:opacity-100 sm:text-[11px]"
                    >
                      {hoverHint}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          )
        })}
      </StaggerReveal>
    </HomeBleedBand>
  )
}

/* -------------------------------------------------------------------------
 * Specialty tiles + facility category grid
 * ----------------------------------------------------------------------- */

export interface SpecialtyTileGridProps {
  specialties: readonly Specialty[]
  className?: string
}

const specialtyIcons: Record<string, LucideIcon> = {
  cardiology: HeartPulseIcon,
  oncology: RibbonIcon,
  orthopaedics: BoneIcon,
  neurology: BrainIcon,
  gastroenterology: ScanIcon,
  "nephrology-urology": DropletsIcon,
  pulmonology: WindIcon,
  endocrinology: ActivityIcon,
  ophthalmology: EyeIcon,
  "maternity-neonatal": BabyIcon,
}

function SpecialtyTileIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = specialtyIcons[slug] ?? HeartPulseIcon
  return <Icon aria-hidden className={cn("size-11 text-primary sm:size-12", className)} strokeWidth={1.35} />
}

/** Specialty tiles → /treatments?specialty=<slug> (A06 route owns the param). */
export function SpecialtyTileGrid({
  specialties,
  className,
}: SpecialtyTileGridProps) {
  return (
    <StaggerReveal
      as="ul"
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
      staggerMs={55}
    >
      {specialties.map((specialty) => (
        <li key={specialty.id}>
          <Link
            href={`${ROUTES.public.treatments}?specialty=${encodeURIComponent(specialty.slug)}`}
            className={cn(
              "group flex h-full items-center gap-3 rounded-xl border border-border/70 bg-card p-3.5 text-left shadow-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:gap-4 sm:p-4",
              homeInteractiveTileClassName,
              "hover:border-primary/25"
            )}
          >
            <span className="flex w-[4.5rem] shrink-0 items-center justify-center sm:w-20">
              <SpecialtyTileIcon slug={specialty.slug} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-semibold text-foreground group-hover:text-primary">
                {specialty.name}
              </span>
              <span className="mt-1 block text-sm leading-snug text-muted-foreground">
                {specialty.description}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </StaggerReveal>
  )
}

export interface FacilityCategoryEntry {
  category: FacilityCategory
  label: string
  description: string
  href: string
  count: number
}

/**
 * Compact icon per facility category. Small, single-colour line icons only —
 * the category name carries the meaning, the icon just anchors the row.
 */
const facilityCategoryIcon: Record<FacilityCategory, LucideIcon> = {
  hospital: Building2Icon,
  specialty_centre: StethoscopeIcon,
  diagnostic_lab: FlaskConicalIcon,
  rehabilitation: DumbbellIcon,
  wellness: LeafIcon,
  medical_tourism: PlaneIcon,
}

/** Facility category tile — compact row, whole card is the link. */
function FacilityCategoryRow({ entry }: { entry: FacilityCategoryEntry }) {
  const Icon = facilityCategoryIcon[entry.category]
  const listingLabel = entry.count === 1 ? "listing" : "listings"

  return (
    <li className="min-w-0">
      <Link
        href={entry.href}
        className={cn(
          "group flex h-full items-center gap-3 rounded-xl border border-border/70 bg-card px-3.5 py-3 text-left shadow-xs outline-none sm:gap-3.5 sm:px-4 sm:py-3.5",
          homeInteractiveTileClassName,
          "hover:border-primary/25 hover:bg-secondary/35"
        )}
      >
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/[0.08] text-primary transition-colors group-hover:bg-primary/[0.12] sm:size-10"
        >
          <Icon className="size-4 sm:size-[1.125rem]" strokeWidth={1.65} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary sm:text-[0.9375rem]">
              {entry.label}
            </span>
            <span className="text-[11px] font-medium text-muted-foreground tabular-nums sm:text-xs">
              · {entry.count} {listingLabel}
            </span>
          </span>
          <span className="mt-0.5 block truncate text-xs leading-snug text-muted-foreground">
            {entry.description}
          </span>
        </span>

        <ChevronRightIcon
          aria-hidden
          className="size-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
          strokeWidth={1.75}
        />
      </Link>
    </li>
  )
}

export interface FacilityCategoryGridProps {
  /** Category entries with counts derived from @/data facilities. */
  categories: readonly FacilityCategoryEntry[]
  className?: string
}

/** Facility directory → /facilities?category=... (A03 route). */
export function FacilityCategoryGrid({
  categories,
  className,
}: FacilityCategoryGridProps) {
  return (
    <StaggerReveal
      as="ul"
      className={cn(
        "grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3",
        className
      )}
      staggerMs={45}
    >
      {categories.map((category) => (
        <FacilityCategoryRow key={category.href} entry={category} />
      ))}
    </StaggerReveal>
  )
}

/* -------------------------------------------------------------------------
 * Featured treatments grid (home)
 * ----------------------------------------------------------------------- */

const featuredTreatmentIcons: Record<HomeFeaturedTreatmentItem["slug"], LucideIcon> = {
  "coronary-angioplasty": HeartPulseIcon,
  "bypass-surgery": HeartPulseIcon,
  chemotherapy: FlaskConicalIcon,
  "knee-replacement": BoneIcon,
  "stroke-rehabilitation": BrainIcon,
  "liver-transplant": ActivityIcon,
  dialysis: DropletsIcon,
  "asthma-airways-care": WindIcon,
  "cataract-surgery": EyeIcon,
  "maternity-care": BabyIcon,
}

export interface HomeLowestQuotesSectionProps {
  className?: string
}

/** Demo treatment profile shortcuts (layout grid — links to /treatments/[slug]). */
export function HomeLowestQuotesSection({ className }: HomeLowestQuotesSectionProps) {
  return (
    <HomeBleedBand
      aria-labelledby="home-featured-treatments-heading"
      align="center"
      surfaceClassName="border-b border-border/70 bg-background"
      className={className}
    >
      <HomeSectionHeading
        headingId="home-featured-treatments-heading"
        title={homeFeaturedTreatments.title}
        description={homeFeaturedTreatments.description}
      />
      <ul className="grid w-full gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
        {homeFeaturedTreatments.items.map((treatment) => {
          const Icon = featuredTreatmentIcons[treatment.slug]
          const profileHref = treatmentDetailHref(treatment.slug)
          return (
            <li
              key={treatment.slug}
              className="flex gap-3 rounded-xl bg-primary/[0.06] p-4 sm:gap-4 sm:p-5"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-xs ring-1 ring-border/60 sm:size-12">
                <Icon aria-hidden className="size-5 sm:size-[1.35rem]" strokeWidth={1.75} />
              </span>
              <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-1.5">
                <h3 className="text-sm font-semibold text-foreground sm:text-base">
                  {treatment.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground/90">
                    Specialty
                  </span>{" "}
                  <span className="font-medium text-foreground">{treatment.specialtyLabel}</span>
                </p>
                <Link
                  href={profileHref}
                  className="text-sm font-semibold text-cta underline-offset-4 hover:underline"
                >
                  View treatment
                  <span className="sr-only">: {treatment.title}</span>
                </Link>
              </div>
            </li>
          )
        })}
      </ul>
    </HomeBleedBand>
  )
}

/* -------------------------------------------------------------------------
 * Platform scope grid (home)
 * ----------------------------------------------------------------------- */

const patientServiceIcons: Record<HomePatientServiceItem["id"], LucideIcon> = {
  "provider-discovery": Building2Icon,
  "treatment-pages": ClipboardListIcon,
  "independent-ratings": StarIcon,
  "verification-states": ShieldCheckIcon,
  "free-consultation": MessagesSquareIcon,
  "patient-enquiry": ClipboardCheckIcon,
  "medical-tourism-info": GlobeIcon,
  "travel-assistance": MapPinnedIcon,
  "cost-context": BanknoteIcon,
}

export interface HomePatientServicesSectionProps {
  className?: string
  surfaceClassName?: string
}

/** Platform scope grid — discovery, ratings, demo flows and informational travel modules. */
export function HomePatientServicesSection({
  className,
  surfaceClassName = "border-b border-border/70 bg-background",
}: HomePatientServicesSectionProps) {
  return (
    <HomeBleedBand
      aria-labelledby="home-patient-services-heading"
      align="center"
      surfaceClassName={surfaceClassName}
      className={className}
    >
      <HomeSectionHeading
        headingId="home-patient-services-heading"
        title={homePatientServices.title}
        description={homePatientServices.description}
      />
      <StaggerReveal
        as="ul"
        className="grid w-full gap-4 text-left sm:grid-cols-2 lg:grid-cols-3"
        staggerMs={60}
      >
        {homePatientServices.items.map((service) => {
          const Icon = patientServiceIcons[service.id]
          return (
            <li
              key={service.id}
              className={cn(
                "flex gap-3 rounded-xl border border-transparent bg-primary/[0.06] p-4 sm:gap-4 sm:p-5",
                homeInteractiveSurfaceClassName,
                "hover:border-primary/15 hover:bg-primary/[0.08]"
              )}
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-xs ring-1 ring-border/60 sm:size-12">
                <Icon aria-hidden className="size-5 sm:size-[1.35rem]" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-foreground sm:text-base">
                  {service.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {service.description}
                </p>
              </div>
            </li>
          )
        })}
      </StaggerReveal>
    </HomeBleedBand>
  )
}

/* -------------------------------------------------------------------------
 * Medical tourism block
 * ----------------------------------------------------------------------- */

export interface MedicalTourismBlockProps {
  className?: string
}

const MEDICAL_TOURISM_DEMO_VIDEO_POSTER = "/images/hero-personal-care.png"

/** Medical-tourism discovery block linking into A06 routes. */
export function MedicalTourismBlock({ className }: MedicalTourismBlockProps) {
  return (
    <ScrollReveal>
      <div
        className={cn(
          "interactive-surface grid gap-6 rounded-2xl bg-card p-6 shadow-xs ring-1 ring-foreground/10 lg:grid-cols-[1.1fr_1fr] lg:p-8",
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
          enquiry coordination and travel-assistance information with support at
          each stage.
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
      <figure className="flex min-h-0 flex-col justify-center gap-2 self-stretch">
        <div className="overflow-hidden rounded-xl border border-border/70 bg-muted shadow-xs ring-1 ring-foreground/10">
          <video
            className="aspect-video w-full bg-muted object-cover"
            controls
            playsInline
            preload="metadata"
            poster={MEDICAL_TOURISM_DEMO_VIDEO_POSTER}
            aria-label="Medical tourism programme overview"
          >
            <p className="p-4 text-sm text-muted-foreground">
              Programme overview video — explore medical tourism using the links
              on this page.
            </p>
          </video>
        </div>
        <figcaption className="text-center text-xs leading-relaxed text-muted-foreground">
          Medical tourism programme overview
        </figcaption>
      </figure>
      </div>
    </ScrollReveal>
  )
}

/* -------------------------------------------------------------------------
 * IUF consultation CTA
 * ----------------------------------------------------------------------- */

export interface IufConsultationCtaProps {
  className?: string
}

/**
 * IUF-branded consultation CTA (FR-019 identity; scope owned by A07).
 * Styled as the reference's full-width conversion strip: strong red surface,
 * white copy, pill CTA — the page's single dominant "money action" band.
 */
export function IufConsultationCta({ className }: IufConsultationCtaProps) {
  return (
    <ScrollReveal delayMs={80}>
      <div
        className={cn(
          "interactive-surface flex flex-col gap-4 rounded-2xl bg-cta p-6 text-cta-foreground shadow-md sm:flex-row sm:items-center sm:justify-between sm:p-8",
          className
        )}
      >
      <div className="space-y-2">
        <p className="flex items-center gap-2 text-sm font-semibold tracking-wide uppercase opacity-90">
          <SparklesIcon aria-hidden className="size-4" />
          International Urban Forum Supported Initiative
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">
          Request a free consultation
        </h2>
        <p className="max-w-xl text-sm leading-relaxed opacity-90">
          The consultation flow is an IUF-supported initiative on the platform.
          Scope, eligibility and cost boundaries are described on the
          consultation page before any request is made.
        </p>
      </div>
      <Button
        size="lg"
        variant="cta-outline"
        className="shrink-0 rounded-full border-cta-foreground/40 bg-cta-foreground px-6 font-semibold text-cta shadow-sm hover:bg-cta-foreground/90 hover:text-cta"
        render={<Link href={ROUTES.public.freeConsultation} />}
      >
        Start free consultation
        <span aria-hidden>→</span>
      </Button>
      </div>
    </ScrollReveal>
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
    body: "Provider profiles carry their verification status — verified, pending or unverified — exactly as recorded.",
  },
  {
    icon: StarIcon,
    title: "Ratings that stay independent",
    body: "Patient experience, clinical expertise and medical expertise are separate ratings with visible methodology metadata — never merged into one score.",
  },
  {
    icon: MessagesSquareIcon,
    title: "Enquiries with clear boundaries",
    body: "Enquiry and appointment flows are request workflows; a request is not a confirmed booking until the provider confirms.",
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
        title="Patient stories"
        description="Experiences from patients who used the platform to plan care in India."
      />
      {testimonials.length === 0 ? (
        <p className="rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
          Patient stories will appear here soon.
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
        description="Short answers about how the platform presents providers, ratings and requests."
      />
      {faqs.length === 0 ? (
        <p className="rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
          FAQs will be published here soon.
        </p>
      ) : (
        <FaqList faqs={faqs} />
      )}
    </div>
  )
}
