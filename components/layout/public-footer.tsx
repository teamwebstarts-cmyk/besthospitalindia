import Link from "next/link"
import { HeartPulseIcon, MailIcon, PhoneIcon } from "lucide-react"

import { footerGroups } from "@/constants/navigation"
import { cn } from "@/lib/utils"

const DEMO_NOTICE =
  "BestHospitalIndia is a demonstration platform. Hospitals, doctors, facilities and reviews shown are illustrative mock data, not verified medical advice."

export interface PublicFooterProps {
  className?: string
}

/**
 * Public site footer: brand blurb, grouped link columns from
 * `constants/navigation.ts`, demo-only notice and copyright. Solid brand-blue
 * surface matching the measured reference footer (pixel-probed `#005697`):
 * brand column + link columns + legal row on a primary band.
 */
export function PublicFooter({ className }: PublicFooterProps) {
  return (
    <footer className={cn("bg-primary text-primary-foreground", className)}>
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] lg:gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex w-fit items-center gap-2" aria-label="BestHospitalIndia home">
              <span
                aria-hidden
                className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground"
              >
                <HeartPulseIcon className="size-5" />
              </span>
              <span className="font-heading text-lg font-semibold tracking-tight">
                BestHospitalIndia
              </span>
            </Link>
            <p className="max-w-sm text-sm text-pretty text-background/70">
              Discover hospitals, doctors and facilities across India, compare
              treatment options and request a free consultation.
            </p>
            <ul className="flex flex-col gap-2 text-sm text-background/70">
              <li className="flex items-center gap-2">
                <MailIcon aria-hidden className="size-4" />
                <a
                  href="mailto:hello@besthospitalindia.example"
                  className="transition-colors hover:text-background"
                >
                  hello@besthospitalindia.example
                </a>
              </li>
              <li className="flex items-center gap-2">
                <PhoneIcon aria-hidden className="size-4" />
                <a href="tel:+910000000000" className="transition-colors hover:text-background">
                  +91 (0) 00000 00000
                </a>
              </li>
            </ul>
          </div>
          {footerGroups.map((group) => (
            <nav key={group.heading} aria-label={group.heading} className="space-y-3">
              <h2 className="text-sm font-semibold tracking-wide text-background uppercase">
                {group.heading}
              </h2>
              <ul className="flex flex-col gap-2.5">
                {group.links.map((link) => (
                  <li key={`${group.heading}-${link.href}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-background/70 transition-colors hover:text-background"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 space-y-3 border-t border-background/15 pt-6">
          <p className="text-xs leading-relaxed text-pretty text-background/60">
            {DEMO_NOTICE}
          </p>
          <p className="text-xs text-background/60">
            © {new Date().getFullYear()} BestHospitalIndia. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
