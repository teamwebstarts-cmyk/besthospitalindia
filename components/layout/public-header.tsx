"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  EllipsisIcon,
  HeartPulseIcon,
  MenuIcon,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { publicNav, type NavLink } from "@/constants/navigation"
import { cn } from "@/lib/utils"

/** Number of primary links rendered inline on desktop; the rest collapse into a "More" menu. */
const INLINE_NAV_LIMIT = 6

function isPathActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/"
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

function BrandLink() {
  return (
    <Link
      href="/"
      aria-label="BestHospitalIndia home"
      className="flex shrink-0 items-center gap-2"
    >
      <span
        aria-hidden
        className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground"
      >
        <HeartPulseIcon className="size-5" />
      </span>
      <span className="font-heading text-lg font-semibold tracking-tight whitespace-nowrap">
        BestHospitalIndia
      </span>
    </Link>
  )
}

function DesktopNavLinks({ links }: { links: NavLink[] }) {
  const pathname = usePathname()

  return (
    <nav aria-label="Primary" className="hidden min-w-0 lg:block">
      <ul className="flex items-center gap-0.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={isPathActive(pathname, link.href) ? "page" : undefined}
              className={cn(
                "inline-flex h-9 items-center rounded-md px-2.5 text-sm font-medium whitespace-nowrap transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:text-foreground"
              )}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function HeaderMoreMenu({ links }: { links: NavLink[] }) {
  const overflow = links.slice(INLINE_NAV_LIMIT)

  if (overflow.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="More navigation"
            className="hidden lg:inline-flex"
          />
        }
      >
        <EllipsisIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {overflow.map((link) => (
          <DropdownMenuItem key={link.href} render={<Link href={link.href} />}>
            {link.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
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
            className="lg:hidden"
            aria-label="Open navigation menu"
          />
        }
      >
        <MenuIcon />
      </SheetTrigger>
      <SheetContent side="right" className="w-80 gap-0">
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
        <div className="flex flex-col gap-2 border-t p-4">
          <Button render={<Link href="/free-consultation" onClick={close} />}>
            Free Consultation
          </Button>
          <Button variant="outline" render={<Link href="/auth" onClick={close} />}>
            Sign in
          </Button>
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
 * Public site header: brand, primary navigation (from
 * `constants/navigation.ts`), overflow menu, auth/consultation CTAs and a
 * Sheet-based mobile menu.
 */
export function PublicHeader({ links = publicNav, className }: PublicHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        className
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <BrandLink />
          <DesktopNavLinks links={links.slice(0, INLINE_NAV_LIMIT)} />
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <HeaderMoreMenu links={links} />
          <Button
            size="sm"
            className="hidden sm:inline-flex"
            render={<Link href="/free-consultation" />}
          >
            Free Consultation
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex"
            render={<Link href="/auth" />}
          >
            Sign in
          </Button>
          <MobileNav links={links} />
        </div>
      </div>
    </header>
  )
}
