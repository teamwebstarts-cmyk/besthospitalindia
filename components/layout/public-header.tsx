"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CalendarDaysIcon,
  HeartPulseIcon,
  MenuIcon,
  UserRoundIcon,
} from "lucide-react"

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
      className={cn("flex min-w-0 shrink-0 items-center", compact ? "gap-2" : "gap-3", className)}
    >
      <span
        aria-hidden
        className={cn(
          "flex shrink-0 items-center justify-center rounded-md",
          compact ? "size-8" : "size-10",
          inverted
            ? "bg-primary-foreground text-primary"
            : "bg-primary text-primary-foreground",
        )}
      >
        <HeartPulseIcon className={compact ? "size-4" : "size-5"} strokeWidth={2.1} />
      </span>
      {inverted && !compact ? (
        <span aria-hidden className="hidden h-8 w-px shrink-0 bg-primary-foreground/35 sm:block" />
      ) : null}
      <span
        className={cn(
          "font-heading leading-tight font-bold tracking-tight",
          compact
            ? "max-w-[9.5rem] truncate text-base sm:max-w-none sm:overflow-visible sm:text-lg sm:whitespace-nowrap"
            : "text-lg whitespace-nowrap sm:text-[1.35rem]",
          inverted ? "text-primary-foreground" : "text-foreground",
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

function HeaderTopBarDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -right-24 top-1/2 h-[165%] w-[min(62vw,640px)] -translate-y-1/2 rounded-full bg-primary-foreground/[0.07]" />
      <div className="absolute right-[6%] top-[-20%] h-[140%] w-40 rotate-[-8deg] rounded-full bg-primary-foreground/[0.05]" />
      <div className="absolute right-[18%] top-[-30%] h-[150%] w-52 rotate-[6deg] rounded-full bg-primary-foreground/[0.04]" />
    </div>
  )
}

function HeaderTopBar() {
  return (
    <div className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:block">
      <HeaderTopBarDecor />
      <div className="relative mx-auto flex min-h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <BrandMark inverted />
        <div className="flex shrink-0 items-center gap-2.5">
          <Button
            size="sm"
            className="h-9 gap-1.5 rounded-full border-0 bg-secondary px-4 text-sm font-semibold text-primary shadow-sm transition-[background-color,box-shadow] duration-200 hover:bg-secondary/85 hover:shadow-md"
            render={<Link href="/free-consultation" />}
          >
            <CalendarDaysIcon aria-hidden className="size-4 shrink-0" />
            Get Free Consultation
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 rounded-full border-primary-foreground/70 bg-transparent px-4 text-sm font-semibold text-primary-foreground shadow-none transition-colors duration-200 hover:border-primary-foreground hover:bg-primary-foreground/10"
            render={<Link href="/auth" />}
          >
            <UserRoundIcon aria-hidden className="size-4 shrink-0" />
            Sign in
          </Button>
        </div>
      </div>
    </div>
  )
}

function navLinkClassName(isActive: boolean) {
  return cn(
    "inline-flex h-9 items-center rounded-full px-4 text-sm font-medium whitespace-nowrap transition-[background-color,color,box-shadow] duration-200 ease-out outline-none",
    isActive
      ? "bg-secondary font-semibold text-primary shadow-xs"
      : "text-foreground/75 hover:bg-secondary/55 hover:text-primary",
    "focus-visible:ring-3 focus-visible:ring-ring/50",
  )
}

function DesktopNavLinks({ links }: { links: NavLink[] }) {
  const pathname = usePathname()

  return (
    <nav aria-label="Primary" className="shrink-0">
      <ul className="flex flex-nowrap items-center gap-1">
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
  const pathname = usePathname()
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
            {links.map((link) => {
              const active = isPathActive(pathname, link.href)
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-10 items-center rounded-full px-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-secondary font-semibold text-primary"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
            <li>
              <Link
                href="/free-consultation"
                onClick={close}
                className="flex h-10 items-center rounded-full px-3 text-sm font-medium text-foreground hover:bg-muted"
              >
                Free Consultation
              </Link>
            </li>
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
              <a href={SITE_CONTACT.mainEmailHref} className="font-medium text-foreground">
                {SITE_CONTACT.mainEmail}
              </a>
            </li>
          </ul>
          <div className="flex flex-col gap-2">
            <Button
              className="h-10 gap-1.5 rounded-full bg-secondary font-semibold text-primary"
              render={<Link href="/free-consultation" onClick={close} />}
            >
              <CalendarDaysIcon aria-hidden className="size-4" />
              Get Free Consultation
            </Button>
            <Button
              variant="outline"
              className="h-10 rounded-full"
              render={<Link href="/auth" onClick={close} />}
            >
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
 * Public site header — two tiers matching the marketing mock: primary brand
 * band with consultation CTA, then mint nav row with pill active state + search.
 */
export function PublicHeader({ links = publicNav, className }: PublicHeaderProps) {
  return (
    <header className={cn("sticky top-0 z-40 w-full bg-background", className)}>
      <HeaderTopBar />

      {/* Mobile & tablet */}
      <div className="border-b border-border/70 bg-background lg:hidden">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-2 px-4 sm:h-[3.25rem] sm:px-6">
          <BrandMark compact />
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Button
              size="sm"
              className="h-8 gap-1 rounded-full bg-secondary px-2.5 text-xs font-semibold text-primary sm:px-3 sm:text-sm"
              render={<Link href="/free-consultation" />}
            >
              <span className="hidden min-[400px]:inline">Free Consult</span>
              <span className="min-[400px]:hidden">Consult</span>
            </Button>
            <MobileNav links={links} />
          </div>
        </div>
        <div className="border-t border-border/50 bg-background px-4 pt-3 pb-3 sm:px-6">
          <HeaderSearchBar className="h-10" />
        </div>
      </div>

      {/* Desktop nav + search — solid white bar (not glass over hero) */}
      <div className="hidden border-b border-border/70 bg-background lg:block">
        <div className="mx-auto w-full max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex min-h-11 items-center gap-5 xl:gap-8">
            <DesktopNavLinks links={links} />
            <HeaderSearchBar className="h-11 min-w-0 flex-1 lg:max-w-xl xl:max-w-2xl" />
          </div>
        </div>
      </div>
    </header>
  )
}