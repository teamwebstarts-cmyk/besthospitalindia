import type { ReactNode } from "react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  ArrowUpRightIcon,
  Building2Icon,
  CircleCheckIcon,
  GlobeIcon,
  HeartPulseIcon,
  MessagesSquareIcon,
  PlaneIcon,
  ShieldCheckIcon,
  StarIcon,
  StethoscopeIcon,
} from "lucide-react"

import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { ScrollReveal, StaggerReveal } from "@/components/motion/scroll-reveal"
import { aboutContent } from "@/features/content/home-content"
import {
  HomeBleedBand,
  HomeSectionHeading,
} from "@/features/content/home-sections"
import { homeInteractiveTileClassName } from "@/lib/home-motion"
import { ROUTES } from "@/constants/routes"
import { cn } from "@/lib/utils"

const objectiveIcons: Record<(typeof aboutContent.objectives)[number]["id"], LucideIcon> = {
  "obj-discovery": Building2Icon,
  "obj-ratings": StarIcon,
  "obj-verification": ShieldCheckIcon,
  "obj-coordination": MessagesSquareIcon,
}

const scopeItems: readonly { icon: LucideIcon; text: string }[] = [
  { icon: Building2Icon, text: aboutContent.scope[0] },
  { icon: StethoscopeIcon, text: aboutContent.scope[1] },
  { icon: HeartPulseIcon, text: aboutContent.scope[2] },
  { icon: StarIcon, text: aboutContent.scope[3] },
  { icon: PlaneIcon, text: aboutContent.scope[4] },
]

const supportingLinks = [
  {
    label: "How it works",
    description: "Patient and partner flows from search to follow-up.",
    href: ROUTES.public.howItWorks,
  },
  {
    label: "Rating methodology",
    description: "How PER, CER and MER are produced and shown.",
    href: ROUTES.public.ratingMethodology,
  },
  {
    label: "International Urban Forum",
    description: "IUF-supported consultation initiative.",
    href: ROUTES.public.internationalUrbanForum,
  },
  {
    label: "Contact",
    description: "Reach the coordination and partnership team.",
    href: ROUTES.public.contact,
  },
] as const

function SoftCard({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-border/70 bg-card p-6 shadow-xs sm:p-8",
        className,
      )}
    >
      {children}
    </article>
  )
}

/**
 * About page body — same visual rhythm as the home page (bleed bands, centered
 * headings, icon tiles, soft cards).
 */
export function AboutPageContent() {
  return (
    <div className="flex flex-col">
      <HomeBleedBand
        surfaceClassName="border-b border-border/70 bg-white"
        align="center"
        aria-labelledby="about-page-heading"
      >
        <ScrollReveal className="w-full space-y-6">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "About Us" }]}
            className="w-full text-left"
          />
          <HomeSectionHeading
            headingId="about-page-heading"
            title="About BestHospitalIndia"
            description="What the platform does, how it presents providers and ratings, and the trust principles behind the service."
          />
        </ScrollReveal>
      </HomeBleedBand>

      <HomeBleedBand
        surfaceClassName="border-b border-border/70 bg-background"
        aria-labelledby="about-mission-vision-heading"
      >
        <ScrollReveal>
          <p
            id="about-mission-vision-heading"
            className="sr-only"
          >
            Mission and vision
          </p>
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <SoftCard className={homeInteractiveTileClassName}>
              <p className="text-[0.6875rem] font-semibold tracking-[0.12em] text-primary uppercase">
                Our mission
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Why this platform exists.</p>
              <p className="mt-4 text-base leading-relaxed text-pretty text-foreground">
                {aboutContent.mission}
              </p>
            </SoftCard>
            <SoftCard className={homeInteractiveTileClassName}>
              <p className="text-[0.6875rem] font-semibold tracking-[0.12em] text-primary uppercase">
                Our vision
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                What transparent healthcare discovery looks like.
              </p>
              <p className="mt-4 text-base leading-relaxed text-pretty text-foreground">
                {aboutContent.vision}
              </p>
            </SoftCard>
          </div>
        </ScrollReveal>
      </HomeBleedBand>

      <HomeBleedBand
        surfaceClassName="border-b border-border/70 bg-white"
        align="center"
        aria-labelledby="about-objectives-heading"
      >
        <ScrollReveal>
          <HomeSectionHeading
            headingId="about-objectives-heading"
            title="Objectives"
            description="The concrete goals that shape every page, workflow and rating surface on the platform."
          />
        </ScrollReveal>
        <StaggerReveal
          as="ul"
          className="grid gap-3 text-left sm:grid-cols-2 lg:grid-cols-4 lg:gap-4"
          staggerMs={60}
        >
          {aboutContent.objectives.map((objective) => {
            const Icon = objectiveIcons[objective.id]
            return (
              <li
                key={objective.id}
                className={cn(
                  "flex gap-3 rounded-xl border border-border/70 bg-card p-4 sm:gap-4 sm:p-5",
                  homeInteractiveTileClassName,
                )}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/[0.08] text-primary ring-1 ring-primary/12 sm:size-11">
                  <Icon aria-hidden className="size-5" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold leading-snug text-foreground sm:text-[0.9375rem]">
                    {objective.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {objective.body}
                  </p>
                </div>
              </li>
            )
          })}
        </StaggerReveal>
      </HomeBleedBand>

      <HomeBleedBand
        surfaceClassName="border-b border-border/70 bg-background"
        align="center"
        aria-labelledby="about-scope-heading"
      >
        <ScrollReveal>
          <HomeSectionHeading
            headingId="about-scope-heading"
            title="Platform scope"
            description="What BestHospitalIndia covers on the platform."
          />
        </ScrollReveal>
        <StaggerReveal
          as="ul"
          className="grid gap-3 sm:grid-cols-2"
          staggerMs={50}
        >
          {scopeItems.map((item) => (
            <li
              key={item.text}
              className="flex items-start gap-3 rounded-xl border border-border/70 bg-card px-4 py-3.5 sm:px-5"
            >
              <item.icon
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-primary"
                strokeWidth={1.75}
              />
              <span className="text-sm leading-relaxed text-foreground">{item.text}</span>
            </li>
          ))}
        </StaggerReveal>
      </HomeBleedBand>

      <HomeBleedBand
        surfaceClassName="border-b border-border/70 bg-white"
        align="center"
        aria-labelledby="about-trust-heading"
      >
        <ScrollReveal>
          <HomeSectionHeading
            headingId="about-trust-heading"
            title="Trust principles"
            description="Non-negotiable presentation rules applied across the platform."
          />
        </ScrollReveal>
        <StaggerReveal
          as="ul"
          className="grid gap-3 sm:grid-cols-2"
          staggerMs={55}
        >
          {aboutContent.trustPrinciples.map((principle) => (
            <li
              key={principle}
              className="flex gap-3 rounded-xl border border-border/70 bg-card p-4 sm:p-5"
            >
              <CircleCheckIcon
                aria-hidden
                className="mt-0.5 size-5 shrink-0 text-primary"
                strokeWidth={1.85}
              />
              <p className="text-sm leading-relaxed text-foreground">{principle}</p>
            </li>
          ))}
        </StaggerReveal>
      </HomeBleedBand>

      <HomeBleedBand
        surfaceClassName="border-t border-border/70 bg-background pb-10 sm:pb-12"
        align="center"
        aria-labelledby="about-links-heading"
      >
        <ScrollReveal>
          <HomeSectionHeading
            headingId="about-links-heading"
            title="Go deeper"
            description="Supporting pages for methodology, flows and contact."
          />
        </ScrollReveal>
        <StaggerReveal
          as="ul"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          staggerMs={45}
        >
          {supportingLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "group flex h-full flex-col gap-2 rounded-xl border border-border/70 bg-card p-4 outline-none sm:p-5",
                  homeInteractiveTileClassName,
                  "focus-visible:ring-3 focus-visible:ring-ring/50",
                )}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground group-hover:text-primary">
                    {link.label}
                  </span>
                  <ArrowUpRightIcon
                    aria-hidden
                    className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
                  />
                </span>
                <span className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {link.description}
                </span>
              </Link>
            </li>
          ))}
        </StaggerReveal>

        <ScrollReveal delayMs={80} className="mt-8">
          <DiscoveryCtaBand />
        </ScrollReveal>
      </HomeBleedBand>
    </div>
  )
}

function DiscoveryCtaBand() {
  return (
    <div className="rounded-2xl border border-primary/15 bg-primary/[0.045] p-5 text-center ring-1 ring-primary/10 sm:p-6">
      <p className="flex items-center justify-center gap-2 text-xs font-semibold tracking-wide text-primary uppercase">
        <GlobeIcon aria-hidden className="size-4" />
        Start exploring
      </p>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
        Browse hospitals, doctors and facilities with independent ratings — then request
        coordination when you are ready.
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
        <Link
          href={ROUTES.public.hospitals}
          className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          Hospitals
        </Link>
        <Link
          href={ROUTES.public.doctors}
          className="inline-flex h-10 items-center rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 hover:text-primary"
        >
          Doctors
        </Link>
        <Link
          href={ROUTES.public.facilities}
          className="inline-flex h-10 items-center rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 hover:text-primary"
        >
          Facilities
        </Link>
      </div>
    </div>
  )
}