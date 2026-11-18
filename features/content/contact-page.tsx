import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  ArrowUpRightIcon,
  Building2Icon,
  CalendarDaysIcon,
  HeadphonesIcon,
  MailIcon,
  MessageCircleIcon,
  PhoneIcon,
  StethoscopeIcon,
} from "lucide-react"

import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { ScrollReveal, StaggerReveal } from "@/components/motion/scroll-reveal"
import { ContactForm } from "@/features/content/contact-form"
import { contactContent } from "@/features/content/home-content"
import {
  HomeBleedBand,
  HomeSectionHeading,
} from "@/features/content/home-sections"
import { homeInteractiveTileClassName } from "@/lib/home-motion"
import { SITE_CONTACT } from "@/constants/site-contact"
import { ROUTES } from "@/constants/routes"
import { cn } from "@/lib/utils"

const channelIcons: Record<(typeof contactContent.channels)[number]["id"], LucideIcon> = {
  "channel-support": HeadphonesIcon,
  "channel-partnership": Building2Icon,
  "channel-consultation": CalendarDaysIcon,
}

const directLines = [
  {
    label: "Phone",
    value: SITE_CONTACT.phoneDisplay,
    href: SITE_CONTACT.phoneHref,
    icon: PhoneIcon,
  },
  {
    label: "Email",
    value: SITE_CONTACT.mainEmail,
    href: SITE_CONTACT.mainEmailHref,
    icon: MailIcon,
  },
  {
    label: "WhatsApp",
    value: "Chat with us",
    href: SITE_CONTACT.whatsappHref,
    icon: MessageCircleIcon,
  },
] as const

const supportingLinks = [
  { label: "Free consultation", href: ROUTES.public.freeConsultation },
  { label: "For hospitals", href: ROUTES.public.forHospitals },
  { label: "For doctors", href: ROUTES.public.forDoctors },
  { label: "About", href: ROUTES.public.about },
  { label: "Privacy", href: ROUTES.public.privacy },
] as const

export function ContactPageContent() {
  return (
    <div className="flex flex-col">
      <HomeBleedBand
        surfaceClassName="border-b border-border/70 bg-white"
        align="center"
        aria-labelledby="contact-page-heading"
      >
        <ScrollReveal className="w-full space-y-6">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Contact" }]}
            className="w-full text-left"
          />
          <HomeSectionHeading
            headingId="contact-page-heading"
            title="Contact us"
            description={contactContent.intro}
          />
        </ScrollReveal>
      </HomeBleedBand>

      <HomeBleedBand
        surfaceClassName="border-b border-border/70 bg-background"
        aria-labelledby="contact-direct-heading"
      >
        <ScrollReveal>
          <p id="contact-direct-heading" className="sr-only">
            Direct contact lines
          </p>
          <ul className="grid gap-3 sm:grid-cols-3">
            {directLines.map((line) => (
              <li key={line.label}>
                <a
                  href={line.href}
                  target={line.label === "WhatsApp" ? "_blank" : undefined}
                  rel={line.label === "WhatsApp" ? "noopener noreferrer" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-3.5 transition-colors hover:border-primary/25 sm:px-5",
                    homeInteractiveTileClassName,
                  )}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/[0.08] text-primary ring-1 ring-primary/12">
                    <line.icon aria-hidden className="size-4.5" strokeWidth={1.85} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-medium text-muted-foreground">
                      {line.label}
                    </span>
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {line.value}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </ScrollReveal>
      </HomeBleedBand>

      <HomeBleedBand
        surfaceClassName="border-b border-border/70 bg-white"
        align="center"
        aria-labelledby="contact-channels-heading"
      >
        <ScrollReveal>
          <HomeSectionHeading
            headingId="contact-channels-heading"
            title="Who should you reach?"
            description="Pick the channel that fits your question."
          />
        </ScrollReveal>
        <StaggerReveal
          as="ul"
          className="grid gap-3 text-left md:grid-cols-3 md:gap-4"
          staggerMs={55}
        >
          {contactContent.channels.map((channel) => {
            const Icon = channelIcons[channel.id]
            const href = "href" in channel ? channel.href : undefined
            return (
              <li
                key={channel.id}
                className={cn(
                  "flex h-full flex-col gap-3 rounded-xl border border-border/70 bg-card p-4 sm:p-5",
                  homeInteractiveTileClassName,
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/[0.08] text-primary ring-1 ring-primary/12">
                    <Icon aria-hidden className="size-5" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground sm:text-base">
                      {channel.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      {channel.body}
                    </p>
                  </div>
                </div>
                {href ? (
                  <Link
                    href={href}
                    className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    {channel.label}
                    <ArrowUpRightIcon aria-hidden className="size-3.5" />
                  </Link>
                ) : (
                  <p className="mt-auto text-sm font-medium text-foreground">{channel.label}</p>
                )}
              </li>
            )
          })}
        </StaggerReveal>
        <ScrollReveal delayMs={60} className="mt-4">
          <p className="rounded-lg border border-border/60 bg-muted/40 px-4 py-3 text-center text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {contactContent.note}
          </p>
        </ScrollReveal>
      </HomeBleedBand>

      <HomeBleedBand
        surfaceClassName="border-b border-border/70 bg-background"
        align="center"
        aria-labelledby="contact-form-heading"
      >
        <div id="enquiry-form" className="scroll-mt-24 w-full">
          <ScrollReveal className="space-y-6">
            <HomeSectionHeading
              headingId="contact-form-heading"
              title="Send a message"
              description="General questions only — consultation requests have a separate form."
            />
            <div className="mx-auto w-full max-w-2xl">
              <ContactForm variant="contact" className="w-full" />
            </div>
          </ScrollReveal>
        </div>
      </HomeBleedBand>

      <HomeBleedBand
        surfaceClassName="border-t border-border/70 bg-white pb-10 sm:pb-12"
        align="center"
        aria-labelledby="contact-links-heading"
      >
        <ScrollReveal>
          <HomeSectionHeading
            headingId="contact-links-heading"
            title="Related pages"
            description="Shortcuts to partner flows and policies."
          />
        </ScrollReveal>
        <StaggerReveal
          as="ul"
          className="flex flex-wrap items-center justify-center gap-2"
          staggerMs={35}
        >
          {supportingLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:text-primary"
              >
                {link.label}
                <ArrowUpRightIcon aria-hidden className="size-3.5 opacity-70" />
              </Link>
            </li>
          ))}
        </StaggerReveal>

        <ScrollReveal delayMs={50} className="mt-8">
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
            <StethoscopeIcon aria-hidden className="size-4 text-primary" />
            <span>Browse</span>
            <Link href={ROUTES.public.hospitals} className="font-semibold text-primary hover:underline">
              Hospitals
            </Link>
            <span aria-hidden>·</span>
            <Link href={ROUTES.public.doctors} className="font-semibold text-primary hover:underline">
              Doctors
            </Link>
            <span aria-hidden>·</span>
            <Link href={ROUTES.public.facilities} className="font-semibold text-primary hover:underline">
              Facilities
            </Link>
          </div>
        </ScrollReveal>
      </HomeBleedBand>
    </div>
  )
}