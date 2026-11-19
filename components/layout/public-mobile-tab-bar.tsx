"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { publicMobileTabs } from "@/constants/navigation"
import { cn } from "@/lib/utils"

function isTabActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/"
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

/**
 * Fixed bottom tab bar on phones/tablets (hidden lg+). Mirrors native app
 * discovery shortcuts; full nav remains in the header sheet.
 */
export function PublicMobileTabBar() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/95 shadow-[0_-4px_24px_rgba(11,61,48,0.06)] backdrop-blur-md supports-[backdrop-filter]:bg-background/88 lg:hidden"
    >
      <ul className="mx-auto grid h-[3.25rem] max-w-lg grid-cols-5 px-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
        {publicMobileTabs.map((tab) => {
          const active = isTabActive(pathname, tab.href)
          const Icon = tab.icon
          return (
            <li key={tab.href} className="flex min-w-0">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex w-full min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-0.5 py-1 text-[0.625rem] font-medium leading-none transition-colors outline-none",
                  active
                    ? "font-semibold text-primary [@media(hover:hover)]:hover:bg-transparent [@media(hover:hover)]:hover:text-primary"
                    : "text-muted-foreground [@media(hover:hover)]:hover:bg-muted/50 [@media(hover:hover)]:hover:text-foreground",
                  "focus-visible:ring-3 focus-visible:ring-ring/50",
                )}
              >
                {active ? (
                  <span
                    aria-hidden
                    className="absolute inset-x-2 top-0 h-0.5 rounded-full bg-primary"
                  />
                ) : null}
                <Icon
                  aria-hidden
                  className="size-[1.35rem] shrink-0"
                  strokeWidth={active ? 2.25 : 1.85}
                />
                <span className="max-w-full truncate">{tab.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}