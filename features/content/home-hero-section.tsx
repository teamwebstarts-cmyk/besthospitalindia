"use client"

import { useEffect, useState } from "react"
import {
  Building2Icon,
  MapPinnedIcon,
  StarIcon,
  StethoscopeIcon,
} from "lucide-react"

import { ContactForm } from "@/features/content/contact-form"
import { homeHero } from "@/features/content/home-content"
import { fullBleedClassName } from "@/lib/full-bleed"
import { cn } from "@/lib/utils"

/** Subjects sit on the left; the generated image leaves clear space to the right. */
const HERO_IMAGE_URL = "/images/hero-personal-care-left-focus.jpg"

export interface HomeHeroSectionProps {
  hospitalCount: number
  doctorCount: number
  stateCount: number
  className?: string
}

/**
 * Homepage hero: personal-care photography, concise value proposition and
 * platform coverage left, with the enquiry form on the right.
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
      className={cn(fullBleedClassName, "relative isolate overflow-hidden border-b", className)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[#e8f3ef] bg-cover bg-left bg-no-repeat sm:bg-[position:8%_32%] lg:bg-[length:68%_auto] lg:bg-[position:left_center]"
        style={{ backgroundImage: `url("${HERO_IMAGE_URL}")` }}
      />
      {/* Keep the copy legible while blending the photo softly into the enquiry panel. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-r from-background/55 from-0% via-background/18 via-[35%] to-background from-[52%] to-[100%]"
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8 lg:py-14">
        <div
          className={cn("min-w-0 space-y-6", enterClass())}
          style={{ transitionDelay: "0ms" }}
        >
          <div className="max-w-xl space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/85 px-3 py-1.5 text-[0.68rem] font-semibold tracking-[0.15em] text-primary shadow-sm backdrop-blur-sm">
              <span aria-hidden className="size-1.5 rounded-full bg-primary" />
              {homeHero.eyebrow}
            </p>
            <div className="space-y-3">
              <h1 className="max-w-xl whitespace-pre-line font-[family-name:var(--font-display)] text-3xl leading-[1.08] font-semibold tracking-[-0.04em] text-balance text-foreground sm:text-4xl lg:text-[2.8rem]">
                {homeHero.heading.split("\n").map((line, index) => (
                  <span
                    className={cn("block", index === 1 && "text-primary")}
                    key={line}
                  >
                    {line}
                  </span>
                ))}
              </h1>
              <p className="max-w-lg text-[0.98rem] leading-7 text-foreground/75 sm:text-lg">
                {homeHero.subheading}
              </p>
            </div>
          </div>

          <figure className="max-w-md overflow-hidden rounded-2xl border border-white/75 bg-white/82 shadow-sm backdrop-blur-md">
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
