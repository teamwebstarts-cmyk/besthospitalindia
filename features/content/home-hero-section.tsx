"use client"

import { StarIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ContactForm } from "@/features/content/contact-form"
import { homeHero } from "@/features/content/home-content"
import { fullBleedClassName } from "@/lib/full-bleed"
import { cn } from "@/lib/utils"

const HERO_IMAGE_URL = "/images/hero-personal-care.png"

const heroAvatars = [
  { initials: "AP", className: "bg-primary text-primary-foreground" },
  { initials: "RK", className: "bg-cta text-cta-foreground" },
  { initials: "SM", className: "bg-success text-white" },
  { initials: "LN", className: "bg-muted-foreground text-background" },
  { initials: "DJ", className: "bg-primary/80 text-primary-foreground" },
] as const

export interface HomeHeroSectionProps {
  hospitalCount: number
  doctorCount: number
  cityCount: number
  className?: string
}

/**
 * Vaidam-style home hero: photographic background, short value prop + social
 * proof left, contact enquiry form right (same fields as /contact).
 */
export function HomeHeroSection({
  hospitalCount,
  doctorCount,
  cityCount,
  className,
}: HomeHeroSectionProps) {
  return (
    <section
      aria-label="Welcome"
      className={cn(fullBleedClassName, "border-b", className)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-cover bg-[center_30%] bg-no-repeat"
        style={{ backgroundImage: `url("${HERO_IMAGE_URL}")` }}
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8 lg:py-14">
        <div className="min-w-0 space-y-6">
          <div className="space-y-3">
            <h1 className="max-w-xl text-3xl leading-[1.15] font-bold tracking-tight text-balance text-foreground sm:text-4xl lg:text-[2.35rem]">
              {homeHero.heading}
            </h1>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              {homeHero.subheading}
            </p>
          </div>

          <div className="space-y-3">
            <ul
              className="flex items-center -space-x-2.5"
              aria-label="Patient community"
            >
              {heroAvatars.map((avatar) => (
                <li key={avatar.initials}>
                  <span
                    className={cn(
                      "flex size-11 items-center justify-center rounded-full border-2 border-background text-sm font-semibold shadow-sm sm:size-12",
                      avatar.className
                    )}
                  >
                    {avatar.initials}
                  </span>
                </li>
              ))}
            </ul>
            <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">4.7</span>
              <span
                className="flex items-center gap-0.5 text-amber-500"
                aria-hidden
              >
                {Array.from({ length: 5 }).map((_, index) => (
                  <StarIcon
                    key={index}
                    className={cn(
                      "size-4 fill-current sm:size-[1.125rem]",
                      index === 4 && "opacity-50"
                    )}
                  />
                ))}
              </span>
            </p>
            <ul
              className="flex flex-wrap gap-2"
              aria-label="Platform scale"
            >
              <li>
                <Badge
                  variant="secondary"
                  className="h-auto px-2.5 py-1 text-xs sm:text-sm"
                >
                  {hospitalCount.toLocaleString()} hospitals
                </Badge>
              </li>
              <li>
                <Badge
                  variant="secondary"
                  className="h-auto px-2.5 py-1 text-xs sm:text-sm"
                >
                  {doctorCount.toLocaleString()} doctors
                </Badge>
              </li>
              <li>
                <Badge
                  variant="secondary"
                  className="h-auto px-2.5 py-1 text-xs sm:text-sm"
                >
                  {cityCount.toLocaleString()} cities
                </Badge>
              </li>
            </ul>
          </div>
        </div>

        <div className="min-w-0 lg:max-w-md lg:justify-self-end xl:max-w-lg">
          <ContactForm variant="hero" className="w-full" />
        </div>
      </div>
    </section>
  )
}
