import Link from "next/link"
import { HeartPulseIcon, MailIcon, PhoneIcon } from "lucide-react"

import { footerGroups } from "@/constants/navigation"
import { PublicFooterLegal } from "@/components/layout/public-footer-legal"
import { SITE_CONTACT } from "@/constants/site-contact"
import { cn } from "@/lib/utils"

export interface PublicFooterProps {
  className?: string
}

const footerLinkClass =
  "rounded-sm text-sm text-primary-foreground/80 transition-colors hover:text-primary-foreground focus-visible:text-primary-foreground focus-visible:ring-3 focus-visible:ring-primary-foreground/25 focus-visible:outline-none"

/**
 * Public site footer — primary brand band (matches header top bar), grouped
 * links from `constants/navigation.ts`, disclaimer and copyright.
 */
export function PublicFooter({ className }: PublicFooterProps) {
  return (
    <footer
      className={cn(
        "border-t border-primary-foreground/10 bg-primary text-primary-foreground",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-8 max-lg:py-9 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <div className="grid gap-6 max-lg:gap-7 sm:grid-cols-2 sm:gap-10 lg:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,1fr))] lg:gap-8">
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="flex w-fit items-center gap-2.5 rounded-md focus-visible:ring-3 focus-visible:ring-primary-foreground/25 focus-visible:outline-none"
              aria-label="BestHospitalIndia home"
            >
              <span
                aria-hidden
                className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary-foreground/15 text-primary-foreground"
              >
                <HeartPulseIcon className="size-5" />
              </span>
              <span className="font-heading text-lg font-bold leading-tight tracking-tight">
                BestHospitalIndia
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-pretty text-primary-foreground/80">
              <span className="lg:hidden">
                Discover hospitals, doctors and facilities — compare ratings and request a consultation.
              </span>
              <span className="hidden lg:inline">
                Discover hospitals, doctors and facilities across India, compare independent ratings
                and request a free consultation.
              </span>
            </p>
            <ul className="flex flex-col gap-2 text-sm" aria-label="Contact">
              <li>
                <a
                  href={SITE_CONTACT.mainEmailHref}
                  className={cn("inline-flex items-center gap-2", footerLinkClass)}
                >
                  <MailIcon aria-hidden className="size-4 shrink-0 opacity-90" />
                  {SITE_CONTACT.mainEmail}
                </a>
              </li>
              <li>
                <a
                  href={SITE_CONTACT.phoneHref}
                  className={cn("inline-flex items-center gap-2 tabular-nums", footerLinkClass)}
                >
                  <PhoneIcon aria-hidden className="size-4 shrink-0 opacity-90" />
                  {SITE_CONTACT.phoneDisplay}
                </a>
              </li>
            </ul>
          </div>
          {footerGroups.map((group) => (
            <nav key={group.heading} aria-label={group.heading} className="space-y-3">
              <h2 className="text-[0.6875rem] font-semibold tracking-[0.12em] text-primary-foreground/95 uppercase">
                {group.heading}
              </h2>
              <ul className="flex flex-col gap-2">
                {group.links.map((link) => (
                  <li key={`${group.heading}-${link.href}`}>
                    <Link href={link.href} className={footerLinkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <PublicFooterLegal />
      </div>
    </footer>
  )
}