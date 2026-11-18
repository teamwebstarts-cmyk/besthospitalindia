"use client"

import { Building2Icon, MapPinnedIcon, StarIcon, StethoscopeIcon } from "lucide-react"
import Image from "next/image"

import { ContactForm } from "@/features/content/contact-form"
import { homeHero } from "@/features/content/home-content"
import { fullBleedClassName } from "@/lib/full-bleed"
import { cn } from "@/lib/utils"

const HERO_IMAGE_DESKTOP = "/images/hero-find-care-banner.png"
const HERO_IMAGE_MOBILE = "/images/hero-find-care-mobile.png"

export interface HomeHeroSectionProps {
  hospitalCount: number
  doctorCount: number
  stateCount: number
  className?: string
}

/**
 * Home hero: responsive full-bleed imagery (portrait mobile, landscape desktop)
 * with `object-cover` so the photo always fills the section top-to-bottom.
 */
export function HomeHeroSection({
  hospitalCount,
  doctorCount,
  stateCount,
  className,
}: HomeHeroSectionProps) {
  return (
    <section
      aria-label="Welcome"
      className={cn(
        fullBleedClassName,
        "relative isolate flex flex-col justify-center border-b bg-background",
        // Height tracks the real visible viewport (svh) minus the sticky header.
        // Content can push it taller, but it never feels short on tall screens.
        "min-h-[calc(100svh-var(--site-header-offset))]",
        "lg:bg-transparent",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[#e9f4f0] lg:bg-[#e9f4f0]"
      >
        <div className="absolute inset-x-0 top-0 h-[clamp(13rem,42vh,24rem)] overflow-hidden lg:hidden">
          <div className="relative h-full w-full">
            <Image
              src={HERO_IMAGE_MOBILE}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-top"
            />
          </div>
        </div>
        <div className="absolute inset-0 hidden lg:block">
          <div className="relative h-full w-full">
            <Image
              src={HERO_IMAGE_DESKTOP}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-left"
            />
          </div>
        </div>
      </div>

      {/* Desktop: light scrim only behind headline/stats — right side stays clear for the banner negative space + form */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 max-lg:hidden lg:bg-linear-to-r lg:from-background/22 lg:from-0% lg:via-background/6 lg:via-[min(36vw,22rem)] lg:to-transparent lg:to-[min(46vw,30rem)]"
      />

      <div className="relative mx-auto grid w-full max-w-7xl flex-1 items-center gap-8 px-[max(1rem,3vw)] py-[clamp(1.5rem,4vh,3rem)] sm:px-[max(1.5rem,3.5vw)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.92fr)] lg:gap-[min(2.5rem,3vw)] lg:px-[max(2rem,4vw)] lg:py-[clamp(1.25rem,3vh,2.5rem)]">
        <div className="min-w-0 space-y-[clamp(1rem,2.5vh,1.75rem)] pt-[clamp(8rem,34vh,12rem)] lg:pt-0">
          <div className="max-w-[min(100%,38rem)] space-y-3">
            <h1 className="font-extrabold tracking-tight text-foreground">
              <span className="block text-[clamp(1.875rem,3.8vw,2.875rem)] leading-[1.15] lg:whitespace-nowrap">
                {homeHero.headingLineOneLead}
                <span className="text-primary">{homeHero.headingHospital}</span>
                {homeHero.headingLineOneEnd}
              </span>
              <span className="mt-1 block text-[clamp(1.875rem,3.8vw,2.875rem)] leading-[1.15] lg:whitespace-nowrap">
                {homeHero.headingLineTwoLead}
                <span className="text-primary">{homeHero.headingDoctor}</span>
              </span>
            </h1>
            <p className="max-w-md text-pretty text-[clamp(0.9375rem,1.6vw,1.125rem)] leading-relaxed text-muted-foreground">
              {homeHero.subheading}
            </p>
          </div>

          <figure className="mt-[clamp(2rem,6vh,3.5rem)] max-w-md overflow-hidden rounded-xl border border-white/45 bg-card/50 shadow-sm backdrop-blur-md lg:mt-[clamp(2.75rem,8vh,5rem)]">
            <figcaption className="border-b border-border/50 bg-background/25 px-4 py-3 sm:px-5">
              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <span className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                  4.7
                </span>
                <span
                  className="flex items-center gap-px text-chart-4"
                  aria-label="4.7 out of 5 stars"
                >
                  {Array.from({ length: 5 }).map((_, index) => (
                    <StarIcon
                      key={index}
                      className={cn(
                        "size-3.5 fill-current",
                        index === 4 && "opacity-40"
                      )}
                    />
                  ))}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Average patient experience on listed providers
              </p>
            </figcaption>
            <dl
              className="grid grid-cols-3 divide-x divide-border/50 bg-background/15"
              aria-label="Platform coverage"
            >
              <div className="flex min-h-[4.75rem] flex-col items-center justify-center gap-1.5 px-2 py-3 sm:px-3">
                <dd className="text-xl font-semibold tracking-tight text-foreground tabular-nums sm:text-2xl">
                  {hospitalCount.toLocaleString()}
                </dd>
                <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Building2Icon aria-hidden className="size-3.5 shrink-0 text-primary/80" />
                  Hospitals
                </dt>
              </div>
              <div className="flex min-h-[4.75rem] flex-col items-center justify-center gap-1.5 px-2 py-3 sm:px-3">
                <dd className="text-xl font-semibold tracking-tight text-foreground tabular-nums sm:text-2xl">
                  {doctorCount.toLocaleString()}
                </dd>
                <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <StethoscopeIcon aria-hidden className="size-3.5 shrink-0 text-primary/80" />
                  Doctors
                </dt>
              </div>
              <div className="flex min-h-[4.75rem] flex-col items-center justify-center gap-1.5 px-2 py-3 sm:px-3">
                <dd className="text-xl font-semibold tracking-tight text-foreground tabular-nums sm:text-2xl">
                  {stateCount.toLocaleString()}
                </dd>
                <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPinnedIcon aria-hidden className="size-3.5 shrink-0 text-primary/80" />
                  States
                </dt>
              </div>
            </dl>
          </figure>
        </div>

        <div className="min-w-0 w-full lg:max-w-[min(100%,28rem)] lg:justify-self-end xl:max-w-[min(100%,32rem)]">
          <ContactForm variant="hero" className="w-full shadow-lg transition-shadow duration-500 hover:shadow-xl" />
        </div>
      </div>
    </section>
  )
}