import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  ActivityIcon,
  BabyIcon,
  BanknoteIcon,
  BoneIcon,
  BrainIcon,
  Building2Icon,
  CarIcon,
  ClipboardCheckIcon,
  ClipboardListIcon,
  DropletsIcon,
  DumbbellIcon,
  EyeIcon,
  FlaskConicalIcon,
  GlobeIcon,
  HeartHandshakeIcon,
  HeartIcon,
  HeartPulseIcon,
  LanguagesIcon,
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
import { SectionHeading } from "@/components/shared/section-heading"
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
import { fullBleedClassName } from "@/lib/full-bleed"
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
  /** Centered title/description (destinations-style bands). */
  align?: "start" | "center"
  className?: string
}

export function HomeSectionHeading({
  title,
  description,
  headingId,
  viewAll,
  align = "start",
  className,
}: HomeSectionHeadingProps) {
  return (
    <SectionHeading
      as="h2"
      id={headingId}
      title={title}
      description={description}
      className={cn(
        align === "center" &&
          "flex-col items-center text-center sm:flex-col sm:items-center [&_p]:mx-auto [&_p]:max-w-3xl",
        className
      )}
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
 * Medical destination cities (home)
 * ----------------------------------------------------------------------- */

export interface MedicalDestinationCityCard {
  city: string
  imageSrc: string
}

export interface MedicalDestinationCitiesProps {
  destinations: readonly MedicalDestinationCityCard[]
  title: string
  description: string
  /** Full-bleed band (default) or flush block inside a parent white band. */
  layout?: "band" | "embedded"
  className?: string
}

/** City cards → hospital directory filtered by `?city=`. */
export function MedicalDestinationCities({
  destinations,
  title,
  description,
  layout = "band",
  className,
}: MedicalDestinationCitiesProps) {
  const surfaceClassName =
    layout === "band"
      ? "border-y border-border/70 bg-white"
      : "border-b border-border/70 bg-muted/50"

  return (
    <HomeBleedBand
      aria-labelledby="home-destinations-heading"
      align="center"
      surfaceClassName={surfaceClassName}
      className={className}
    >
      <HomeSectionHeading
        headingId="home-destinations-heading"
        align="center"
        title={title}
        description={description}
      />
      <ul className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {destinations.map((destination) => (
          <li key={destination.city}>
            <Link
              href={`${ROUTES.public.hospitals}?city=${encodeURIComponent(destination.city)}`}
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-border/70 bg-white p-4 text-left shadow-sm transition-[box-shadow,colors] outline-none hover:border-primary/25 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className="font-semibold text-foreground group-hover:text-primary">
                {destination.city}
              </span>
              <div className="relative mt-3 aspect-[5/3] w-full overflow-hidden rounded-lg bg-muted">
                <Image
                  src={destination.imageSrc}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
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
    <ul
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {specialties.map((specialty) => (
        <li key={specialty.id}>
          <Link
            href={`${ROUTES.public.treatments}?specialty=${encodeURIComponent(specialty.slug)}`}
            className="group flex h-full items-center gap-3 rounded-xl border border-border/70 bg-card p-3.5 text-left shadow-sm transition-[box-shadow,colors] outline-none hover:border-primary/25 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 sm:gap-4 sm:p-4"
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
    </ul>
  )
}

export interface FacilityCategoryEntry {
  category: FacilityCategory
  label: string
  description: string
  href: string
  count: number
}

type FacilityCategoryHighlight = {
  icon: LucideIcon
  text: string
}

const facilityCategoryCardMeta: Record<
  FacilityCategory,
  { heroIcon: LucideIcon; highlights: (count: number) => readonly FacilityCategoryHighlight[] }
> = {
  hospital: {
    heroIcon: Building2Icon,
    highlights: (count) => [
      {
        icon: ClipboardListIcon,
        text: `${count} ${count === 1 ? "listing" : "listings"}`,
      },
      {
        icon: HeartPulseIcon,
        text: "Independent PER and CER on profiles",
      },
      { icon: MapPinnedIcon, text: "Filter by city in the directory" },
    ],
  },
  specialty_centre: {
    heroIcon: StethoscopeIcon,
    highlights: (count) => [
      {
        icon: ClipboardListIcon,
        text: `${count} ${count === 1 ? "listing" : "listings"}`,
      },
      { icon: ScanIcon, text: "Single-specialty focused centres" },
      { icon: MapPinnedIcon, text: "Linked from facility search" },
    ],
  },
  diagnostic_lab: {
    heroIcon: FlaskConicalIcon,
    highlights: (count) => [
      {
        icon: ClipboardListIcon,
        text: `${count} ${count === 1 ? "listing" : "listings"}`,
      },
      { icon: ActivityIcon, text: "Labs and diagnostic services" },
      { icon: ShieldCheckIcon, text: "Verification state shown on each profile" },
    ],
  },
  rehabilitation: {
    heroIcon: DumbbellIcon,
    highlights: (count) => [
      {
        icon: ClipboardListIcon,
        text: `${count} ${count === 1 ? "listing" : "listings"}`,
      },
      { icon: HeartIcon, text: "Recovery and rehab programmes" },
      { icon: MapPinnedIcon, text: "Browse alongside hospital listings" },
    ],
  },
  wellness: {
    heroIcon: LeafIcon,
    highlights: (count) => [
      {
        icon: ClipboardListIcon,
        text: `${count} ${count === 1 ? "listing" : "listings"}`,
      },
      { icon: SparklesIcon, text: "Preventive and wellness services" },
      { icon: StarIcon, text: "Dedicated wellness directory category" },
    ],
  },
  medical_tourism: {
    heroIcon: PlaneIcon,
    highlights: (count) => [
      {
        icon: ClipboardListIcon,
        text: `${count} ${count === 1 ? "listing" : "listings"}`,
      },
      { icon: GlobeIcon, text: "Facilitator and coordination listings" },
      { icon: MessagesSquareIcon, text: "Pairs with medical-tourism flows" },
    ],
  },
}

function FacilityCategoryCard({ entry }: { entry: FacilityCategoryEntry }) {
  const meta = facilityCategoryCardMeta[entry.category]
  const HeroIcon = meta.heroIcon
  const highlights = meta.highlights(entry.count)

  return (
    <article className="flex h-full flex-col rounded-xl border border-border/70 bg-card p-5 shadow-xs ring-1 ring-foreground/10 transition-[box-shadow,colors] hover:border-primary/25 hover:shadow-md sm:p-6">
      <div className="flex min-h-0 flex-1 flex-col gap-5 text-left sm:gap-6">
        <HeroIcon
          aria-hidden
          className="size-16 shrink-0 text-primary"
          strokeWidth={1.75}
        />
        <header className="space-y-2">
          <h3 className="font-semibold text-foreground">{entry.label}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{entry.description}</p>
        </header>
        <ul className="space-y-3.5 sm:space-y-4" aria-label={`${entry.label} highlights`}>
          {highlights.map((item) => {
            const ItemIcon = item.icon
            return (
              <li key={item.text} className="flex items-center gap-3">
                <ItemIcon
                  aria-hidden
                  className="size-4 shrink-0 text-primary"
                  strokeWidth={1.75}
                />
                <span className="text-sm leading-snug text-foreground">{item.text}</span>
              </li>
            )
          })}
        </ul>
        <Button
          className="mt-auto w-full rounded-lg font-semibold"
          variant="default"
          render={<Link href={entry.href} />}
        >
          View
          <span className="sr-only"> {entry.label.toLowerCase()} listings</span>
        </Button>
      </div>
    </article>
  )
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
        <FacilityCategoryCard key={category.href} entry={category} />
      ))}
    </div>
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
        align="center"
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
        align="center"
        title={homePatientServices.title}
        description={homePatientServices.description}
      />
      <ul className="grid w-full gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
        {homePatientServices.items.map((service) => {
          const Icon = patientServiceIcons[service.id]
          return (
            <li
              key={service.id}
              className="flex gap-3 rounded-xl bg-primary/[0.06] p-4 sm:gap-4 sm:p-5"
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
      </ul>
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
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl bg-cta p-6 text-cta-foreground shadow-md sm:flex-row sm:items-center sm:justify-between sm:p-8",
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
