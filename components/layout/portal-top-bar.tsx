"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"

import { Breadcrumbs, type BreadcrumbItem } from "@/components/shared/breadcrumbs"
import type { PortalNavItem } from "@/constants/navigation"
import { cn } from "@/lib/utils"

function trailForPath(
  pathname: string,
  portalTitle: string,
  portalHomeHref: string,
  items: PortalNavItem[],
): BreadcrumbItem[] {
  const normalized = pathname.split("?")[0]
  const root: BreadcrumbItem = { label: portalTitle, href: portalHomeHref }

  if (normalized === portalHomeHref) {
    const home = items.find((item) => item.href === portalHomeHref)
    return home && home.label !== portalTitle
      ? [root, { label: home.label }]
      : [{ label: portalTitle }]
  }

  const match = items
    .filter((item) => normalized === item.href || normalized.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]

  if (match) {
    return [root, { label: match.label }]
  }

  const tail = normalized.split("/").filter(Boolean).pop()
  return tail ? [root, { label: tail.replaceAll("-", " ") }] : [root]
}

export interface PortalTopBarProps {
  portalTitle: string
  portalHomeHref: string
  navItems: PortalNavItem[]
  actions?: ReactNode
  className?: string
}

export function PortalTopBar({
  portalTitle,
  portalHomeHref,
  navItems,
  actions,
  className,
}: PortalTopBarProps) {
  const pathname = usePathname() ?? portalHomeHref
  const items = trailForPath(pathname, portalTitle, portalHomeHref, navItems)

  return (
    <div
      className={cn(
        "sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6",
        className,
      )}
    >
      <Breadcrumbs items={items} className="min-w-0 flex-1 [&_ol]:flex" />
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  )
}