import Image from "next/image"

import { cn } from "@/lib/utils"

const HERO_IMAGE_DESKTOP = "/images/hero-find-care-banner.webp"
const HERO_IMAGE_MOBILE = "/images/hero-find-care-mobile.webp"

/** Server-rendered hero imagery — keeps LCP assets off the client bundle. */
export function HomeHeroBackdrop() {
  return (
    <>
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
    </>
  )
}