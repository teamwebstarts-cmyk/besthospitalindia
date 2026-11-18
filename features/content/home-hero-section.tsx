"use client"

import { useEffect, useState } from "react"
import { Building2Icon, MapPinnedIcon, StarIcon, StethoscopeIcon } from "lucide-react"

import { ContactForm } from "@/features/content/contact-form"
import { homeHero } from "@/features/content/home-content"
import { fullBleedClassName } from "@/lib/full-bleed"
import { cn } from "@/lib/utils"

/** Left-weighted composition: subjects on the left, clear negative space on the right for the form. */
const HERO_IMAGE_URL = "/images/hero-personal-care-left-focus.jpg"

export interface HomeHeroSectionProps {
  hospitalCount: number
  doctorCount: number
  stateCount: number
  className?: string
}

/**
 * Vaidam-style home hero: photographic background, short value prop + social
 * proof left, contact enquiry form right (same fields as /contact).
 */
export function HomeHeroSection({
  hospitalCount,
  doctorCount,
  stateCount,
  className,
}: HomeHeroSectionProps) {
  const [entered, setEntered] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )

  useEffect(() => {
    if (entered) return
    const frame = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(frame)
  }, [entered])

  const enterClass = () =>
    cn(
      "transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
      entered ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
    )

  return (
    <section
      aria-label="Welcome"
      className={cn(fullBleedClassName, "border-b", className)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[#e8f3ef] bg-cover bg-left bg-no-repeat sm:bg-[position:8%_32%] lg:bg-[length:68%_auto] lg:bg-[position:left_center]"
        style={{ backgroundImage: `url("${HERO_IMAGE_URL}")` }}
      />
      {/* Soft white column behind the form — no blur; blends photo into page background. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-r from-background/45 from-0% via-background/12 via-[36%] to-background from-[48%] to-[100%]"
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8 lg:py-14">
        <div className={cn("min-w-0 space-y-6", enterClass())} style={{ transitionDelay: "0ms" }}>
          <div className="space-y-3">
            <h1 className="max-w-xl text-3xl leading-[1.15] font-bold tracking-tight text-balance text-foreground sm:text-4xl lg:text-[2.35rem]">
              {homeHero.heading}
            </h1>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              {homeHero.subheading}
            </p>
          </div>

          <figure className="max-w-md overflow-hidden rounded-xl border border-border bg-card/75 shadow-xs backdrop-blur-[2px]">
            <figcaption className="border-b border-border/80 px-4 py-3.5 sm:px-5">
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
              className="grid grid-cols-3 divide-x divide-border/80"
              aria-label="Platform coverage"
            >
              <div className="flex min-h-[5.5rem] flex-col items-center justify-center gap-2 px-2 py-4 sm:px-3">
                <dd className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                  {hospitalCount.toLocaleString()}
                </dd>
                <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Building2Icon aria-hidden className="size-3.5 shrink-0 text-primary/80" />
                  Hospitals
                </dt>
              </div>
              <div className="flex min-h-[5.5rem] flex-col items-center justify-center gap-2 px-2 py-4 sm:px-3">
                <dd className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                  {doctorCount.toLocaleString()}
                </dd>
                <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <StethoscopeIcon aria-hidden className="size-3.5 shrink-0 text-primary/80" />
                  Doctors
                </dt>
              </div>
              <div className="flex min-h-[5.5rem] flex-col items-center justify-center gap-2 px-2 py-4 sm:px-3">
                <dd className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
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

        <div
          className={cn("min-w-0 lg:max-w-md lg:justify-self-end xl:max-w-lg", enterClass())}
          style={{ transitionDelay: entered ? "140ms" : "0ms" }}
        >
          <ContactForm variant="hero" className="w-full shadow-lg transition-shadow duration-500 hover:shadow-xl" />
        </div>
      </div>
    </section>
  )
}
