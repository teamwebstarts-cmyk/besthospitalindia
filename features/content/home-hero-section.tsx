"use client"

import { Building2Icon, MapPinnedIcon, StarIcon, StethoscopeIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes"
import { ContactForm } from "@/features/content/contact-form"
import { GlobalSearch } from "@/features/discovery/global-search"
import { homeHero } from "@/features/content/home-content"
import { fullBleedClassName } from "@/lib/full-bleed"
import { cn } from "@/lib/utils"

const heroSearchRoutes = {
  hospitals: ROUTES.public.hospitals,
  doctors: ROUTES.public.doctors,
  treatments: ROUTES.public.hospitals,
  facilities: ROUTES.public.facilities,
} as const

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
        // Height follows the real visible viewport (svh) minus the sticky header,
        // so the hero always fills the screen without being cut off.
        "max-md:min-h-0 max-md:justify-start",
        "md:max-lg:min-h-[min(36rem,calc(100svh-var(--site-header-offset)-3.25rem))] md:max-lg:justify-center",
        "lg:min-h-[calc(100svh-var(--site-header-offset))] lg:justify-center",
        "lg:bg-transparent",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[#e9f4f0] lg:bg-[#e9f4f0]"
      >
        <div className="absolute inset-x-0 top-0 h-[clamp(12.5rem,38vh,22rem)] overflow-hidden md:hidden">
          <div className="relative h-full w-full">
            <Image
              src={HERO_IMAGE_MOBILE}
              alt=""
              fill
              priority
              sizes="(max-width: 767px) 100vw, 0px"
              className="object-cover object-top"
            />
          </div>
        </div>
        <div className="absolute inset-0 hidden md:block">
          <div className="relative h-full w-full">
            <Image
              src={HERO_IMAGE_DESKTOP}
              alt=""
              fill
              priority
              sizes="(min-width: 768px) 100vw, 0px"
              className="object-cover object-left"
            />
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 max-md:hidden",
          "md:bg-linear-to-r md:from-[#e9f4f0]/94 md:from-0% md:via-[#e9f4f0]/52 md:via-[min(44vw,22rem)] md:to-transparent md:to-[min(58vw,34rem)]",
          "lg:from-background/22 lg:via-background/6 lg:via-[min(36vw,22rem)] lg:to-transparent lg:to-[min(46vw,30rem)]",
        )}
      />

      <div className="relative mx-auto grid w-full max-w-7xl gap-3 px-[max(1rem,3vw)] py-[clamp(1rem,2.5vh,3rem)] max-lg:flex-none max-lg:content-start max-lg:items-stretch max-lg:gap-2.5 md:max-lg:items-center sm:px-[max(1.5rem,3.5vw)] lg:flex-1 lg:items-center lg:gap-[min(2.5rem,3vw)] lg:gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.92fr)] lg:px-[max(2rem,4vw)] lg:py-[clamp(1.25rem,3vh,2.5rem)]">
        <div className="min-w-0 space-y-2.5 max-md:pt-[clamp(5rem,20vh,8.5rem)] md:max-lg:w-full md:max-lg:space-y-3 md:max-lg:pt-0 max-lg:w-full max-lg:space-y-2.5 lg:space-y-[clamp(1rem,2.5vh,1.75rem)] lg:pt-0">
          <div className="max-w-[min(100%,38rem)] space-y-3">
            <h1 className="font-extrabold tracking-tight text-foreground">
              <span className="block text-[clamp(1.875rem,3.8vw,2.875rem)] leading-[1.15] lg:whitespace-nowrap">
                {homeHero.headingLineOneLead}
                <span className="font-extrabold text-primary">{homeHero.headingHospital}</span>
                {homeHero.headingLineOneEnd}
              </span>
              <span className="mt-1 block text-[clamp(1.875rem,3.8vw,2.875rem)] leading-[1.15] lg:whitespace-nowrap">
                {homeHero.headingLineTwoLead}
                <span className="font-extrabold text-primary">{homeHero.headingDoctor}</span>
              </span>
            </h1>
            <p className="max-w-md text-pretty text-[clamp(0.9375rem,1.6vw,1.125rem)] leading-relaxed text-muted-foreground">
              <span className="lg:hidden">{homeHero.subheadingMobile}</span>
              <span className="hidden lg:inline">{homeHero.subheading}</span>
            </p>
          </div>

          <div className="w-full max-w-md max-lg:mx-auto max-lg:mt-1 lg:hidden">
            <GlobalSearch
              layout="header"
              defaultEntityType="hospitals"
              entityTypes={["hospitals", "doctors", "facilities"]}
              routes={heroSearchRoutes}
              queryLabel="Search hospitals, doctors or facilities"
              className="h-10 shadow-sm"
            />
          </div>

          <figure className="mt-2 hidden w-full max-w-md overflow-hidden rounded-lg border border-white/45 bg-card/50 shadow-sm backdrop-blur-md lg:mt-[clamp(5.5rem,13vh,9rem)] lg:block lg:rounded-xl">
            <figcaption className="border-b border-border/50 bg-background/25 px-3 py-2 sm:px-5 lg:px-4 lg:py-3">
              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <span className="text-xl font-semibold tracking-tight text-foreground tabular-nums max-lg:text-lg lg:text-2xl">
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
                        index === 4 && "opacity-40",
                      )}
                    />
                  ))}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground max-lg:leading-snug lg:mt-1 lg:text-sm">
                Average patient experience on listed providers
              </p>
            </figcaption>
            <dl
              className="grid grid-cols-3 divide-x divide-border/50 bg-background/15"
              aria-label="Platform coverage"
            >
              <div className="flex min-h-[3.25rem] flex-col items-center justify-center gap-1 px-2 py-2 max-lg:min-h-[3.25rem] max-lg:py-2 sm:px-3 lg:min-h-[4.75rem] lg:gap-1.5 lg:py-3">
                <dd className="text-base font-semibold tracking-tight text-foreground tabular-nums max-lg:text-base lg:text-2xl">
                  {hospitalCount.toLocaleString()}
                </dd>
                <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Building2Icon aria-hidden className="size-3.5 shrink-0 text-primary/80" />
                  Hospitals
                </dt>
              </div>
              <div className="flex min-h-[3.25rem] flex-col items-center justify-center gap-1 px-2 py-2 max-lg:min-h-[3.25rem] max-lg:py-2 sm:px-3 lg:min-h-[4.75rem] lg:gap-1.5 lg:py-3">
                <dd className="text-base font-semibold tracking-tight text-foreground tabular-nums max-lg:text-base lg:text-2xl">
                  {doctorCount.toLocaleString()}
                </dd>
                <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <StethoscopeIcon aria-hidden className="size-3.5 shrink-0 text-primary/80" />
                  Doctors
                </dt>
              </div>
              <div className="flex min-h-[3.25rem] flex-col items-center justify-center gap-1 px-2 py-2 max-lg:min-h-[3.25rem] max-lg:py-2 sm:px-3 lg:min-h-[4.75rem] lg:gap-1.5 lg:py-3">
                <dd className="text-base font-semibold tracking-tight text-foreground tabular-nums max-lg:text-base lg:text-2xl">
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

        <div className="min-w-0 w-full shrink-0 max-lg:mx-auto max-lg:max-w-md max-lg:pt-0 lg:max-w-[min(100%,28rem)] lg:justify-self-end xl:max-w-[min(100%,32rem)]">
          {/* The short query form is the first block on a phone, so this column does not add a second button. */}
          <div className="hidden lg:block">
            <ContactForm
              variant="hero"
              className="w-full shadow-lg transition-shadow duration-500 hover:shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  )
}