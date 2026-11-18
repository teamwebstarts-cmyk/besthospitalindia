"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HeartPulseIcon, MenuIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { GlobalSearch } from "@/features/discovery/global-search"
import { ROUTES } from "@/constants/routes"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { publicNav, type NavLink } from "@/constants/navigation"
import { SITE_CONTACT } from "@/constants/site-contact"
import { cn } from "@/lib/utils"

const headerSearchRoutes = {
  hospitals: ROUTES.public.hospitals,
  doctors: ROUTES.public.doctors,
  treatments: ROUTES.public.treatments,
  facilities: ROUTES.public.facilities,
} as const

function isPathActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/"
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

function BrandMark({
  inverted = false,
  compact = false,
  className,
}: {
  inverted?: boolean
  compact?: boolean
  className?: string
}) {
  return (
    <Link
      href="/"
      aria-label="BestHospitalIndia home"
      className={cn("flex min-w-0 shrink-0 items-center gap-2 sm:gap-2.5", className)}
    >
      <span
        aria-hidden
        className={cn(
          "flex shrink-0 items-center justify-center rounded-md",
          compact ? "size-8" : "size-9",
          inverted
            ? "bg-primary-foreground/15 text-primary-foreground"
            : "bg-primary text-primary-foreground"
        )}
      >
        <HeartPulseIcon className={compact ? "size-4" : "size-5"} />
      </span>
      <span
        className={cn(
          "font-heading leading-tight font-bold tracking-tight",
          compact
            ? "max-w-[9.5rem] truncate text-base sm:max-w-none sm:overflow-visible sm:text-lg sm:whitespace-nowrap"
            : "text-lg whitespace-nowrap",
          inverted ? "text-primary-foreground" : "text-foreground"
        )}
      >
        BestHospitalIndia
      </span>
    </Link>
  )
}

function HeaderSearchBar({ className }: { className?: string }) {
  return (
    <GlobalSearch
      layout="header"
      defaultEntityType="hospitals"
      routes={headerSearchRoutes}
      queryLabel="Search hospitals, doctors or treatments"
      className={className}
    />
  )
}

function HeaderTopBar() {
  return (
    <div className="hidden bg-primary text-primary-foreground lg:block">
      <div className="mx-auto flex min-h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <BrandMark inverted />
        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <Button
            variant="cta"
            size="sm"
            className="rounded-md px-3 font-semibold shadow-sm xl:px-4"
            render={<Link href="/free-consultation" />}
          >
            <span className="hidden xl:inline">Get a FREE Consultation</span>
            <span className="xl:hidden">FREE Consultation</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="!border-transparent !bg-white text-foreground shadow-sm hover:!bg-white/95 hover:text-foreground dark:!border-transparent dark:!bg-white dark:hover:!bg-white/95"
            render={<Link href="/auth" />}
          >
            Sign in
          </Button>
        </div>
      </div>
    </div>
  )
}

function navLinkClassName(isActive: boolean) {
  return cn(
    "inline-flex h-10 items-center px-2 text-xs font-medium text-foreground/80 whitespace-nowrap transition-colors outline-none hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 xl:px-2.5 xl:text-sm",
    isActive && "font-semibold text-primary"
  )
}

function DesktopNavLinks({ links }: { links: NavLink[] }) {
  const pathname = usePathname()

  return (
    <nav aria-label="Primary" className="shrink-0">
      <ul className="flex flex-nowrap items-center gap-0.5">
        {links.map((link) => (
          <li key={link.href} className="shrink-0">
            <Link
              href={link.href}
              aria-current={isPathActive(pathname, link.href) ? "page" : undefined}
              className={navLinkClassName(isPathActive(pathname, link.href))}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = React.useState(false)
  const close = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 lg:hidden"
            aria-label="Open navigation menu"
          />
        }
      >
        <MenuIcon />
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(100vw-2rem,20rem)] gap-0">
        <SheetHeader>
          <SheetTitle className="text-left">BestHospitalIndia</SheetTitle>
          <SheetDescription className="text-left">
            Explore hospitals, doctors, facilities and treatments.
          </SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-4 pb-4">
          <ul className="flex flex-col gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={close}
                  className="flex h-10 items-center rounded-md px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-3 border-t p-4">
          <ul className="space-y-2 text-sm text-muted-foreground" aria-label="Contact">
            <li>
              <a href={SITE_CONTACT.phoneHref} className="font-medium text-foreground">
                {SITE_CONTACT.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={SITE_CONTACT.mainEmailHref}
                className="font-medium text-foreground"
              >
                {SITE_CONTACT.mainEmail}
              </a>
            </li>
          </ul>
          <div className="flex flex-col gap-2">
            <Button
              variant="cta"
              className="rounded-md font-semibold"
              render={<Link href="/free-consultation" onClick={close} />}
            >
              Get a FREE Consultation
            </Button>
            <Button variant="outline" render={<Link href="/auth" onClick={close} />}>
              Sign in
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export interface PublicHeaderProps {
  /** Override the default registry (mainly for tests/storybook). */
  links?: NavLink[]
  className?: string
}

/**
 * Public site header — Vaidam-style two tiers: brand + CTAs on primary blue
 * (lg+), then nav + search. Mobile uses a compact bar plus full-width search.
 */
export function PublicHeader({ links = publicNav, className }: PublicHeaderProps) {
  return (
    <header className={cn("sticky top-0 z-40 w-full", className)}>
      <HeaderTopBar />

      {/* Mobile & tablet: brand row + search row */}
      <div className="border-b bg-background lg:hidden">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-2 px-4 sm:h-[3.25rem] sm:px-6">
          <BrandMark compact />
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Button
              variant="cta"
              size="sm"
              className="rounded-md px-2.5 text-xs font-semibold shadow-sm sm:px-3 sm:text-sm"
              render={<Link href="/free-consultation" />}
            >
              <span className="hidden min-[400px]:inline">Free Consult</span>
              <span className="min-[400px]:hidden">Consult</span>
            </Button>
            <MobileNav links={links} />
          </div>
        </div>
        <div className="border-t bg-background/80 px-4 pt-3 pb-3 sm:px-6">
          <HeaderSearchBar />
        </div>
      </div>

      {/* Desktop: single nav + search row */}
      <div className="hidden border-b bg-background lg:block">
        <div className="mx-auto w-full max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8 xl:py-3">
          <div className="flex min-h-10 items-center gap-4 xl:gap-6">
            <DesktopNavLinks links={links} />
            <HeaderSearchBar className="min-w-0 flex-1" />
          </div>
        </div>
      </div>
    </header>
  )
}