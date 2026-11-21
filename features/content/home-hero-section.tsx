import { HomeHeroBackdrop } from "@/features/content/home-hero-backdrop"
import { HomeHeroInteractive } from "@/features/content/home-hero-interactive"
import { fullBleedClassName } from "@/lib/full-bleed"
import { cn } from "@/lib/utils"

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
        "max-md:min-h-0 max-md:justify-start",
        "md:max-lg:min-h-[min(36rem,calc(100svh-var(--site-header-offset)-3.25rem))] md:max-lg:justify-center",
        "lg:min-h-[calc(100svh-var(--site-header-offset))] lg:justify-center",
        "lg:bg-transparent",
        className,
      )}
    >
      <HomeHeroBackdrop />
      <HomeHeroInteractive
        hospitalCount={hospitalCount}
        doctorCount={doctorCount}
        stateCount={stateCount}
      />
    </section>
  )
}