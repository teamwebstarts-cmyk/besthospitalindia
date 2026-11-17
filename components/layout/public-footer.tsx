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
 * `constants/navigation.ts`, demo-only notice and copyright.
 */
export function PublicFooter({ className }: PublicFooterProps) {
  return (
    <footer className={cn("border-t bg-background", className)}>
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))] lg:gap-8">
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
            <p className="max-w-sm text-sm text-balance text-muted-foreground">
              Discover hospitals, doctors and facilities across India, compare
              treatment options and request a free consultation.
            </p>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MailIcon aria-hidden className="size-4" />
                <span>hello@besthospitalindia.example</span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneIcon aria-hidden className="size-4" />
                <span>+91 (0) 00000 00000</span>
              </li>
            </ul>
          </div>
          {footerGroups.map((group) => (
            <nav key={group.heading} aria-label={group.heading} className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground">{group.heading}</h2>
              <ul className="flex flex-col gap-2">
                {group.links.map((link) => (
                  <li key={`${group.heading}-${link.href}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-10 space-y-3 border-t pt-6">
          <p className="text-xs leading-relaxed text-balance text-muted-foreground">
            {DEMO_NOTICE}
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} BestHospitalIndia. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
