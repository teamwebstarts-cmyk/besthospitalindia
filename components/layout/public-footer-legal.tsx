"use client"

import { usePathname } from "next/navigation"

import { SITE_DISCLAIMER } from "@/constants/site-contact"
import { shouldShowFooterDisclaimer } from "@/lib/footer-disclaimer"
import { cn } from "@/lib/utils"

export function PublicFooterLegal() {
  const pathname = usePathname()
  const showDisclaimer = shouldShowFooterDisclaimer(pathname)

  return (
    <div
      className={cn(
        "mt-6 border-t border-primary-foreground/15 pt-5 max-lg:mt-7 max-lg:pt-5 sm:mt-10 sm:pt-6",
        showDisclaimer
          ? "space-y-2 lg:flex lg:items-end lg:justify-between lg:gap-8"
          : "flex justify-end",
      )}
    >
      {showDisclaimer ? (
        <p className="max-w-3xl text-[0.6875rem] leading-relaxed text-pretty text-primary-foreground/65 sm:text-xs">
          {SITE_DISCLAIMER}
        </p>
      ) : null}
      <p
        className={cn(
          "shrink-0 text-xs text-primary-foreground/65",
          showDisclaimer && "lg:text-right",
        )}
      >
        © {new Date().getFullYear()} BestHospitalIndia. All rights reserved.
      </p>
    </div>
  )
}