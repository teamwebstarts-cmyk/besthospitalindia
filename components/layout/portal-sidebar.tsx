"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { PanelLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { PortalNavEntry, PortalNavItem, PortalNavGroup } from "@/constants/navigation"
import { cn } from "@/lib/utils"

export interface PortalSidebarProps {
  /** Sidebar navigation items (flat) or grouped entries. */
  items: PortalNavEntry[]
  /** Portal title, shown in the sidebar header and mobile drawer. */
  title: string
  /** Optional description shown in the mobile drawer. */
  description?: string
  className?: string
}

function isItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function PortalNavList({
  items,
  title,
  onNavigate,
  className,
}: {
  items: PortalNavEntry[]
  title: string
  onNavigate?: () => void
  className?: string
}) {
  const pathname = usePathname()

  return (
    <nav aria-label={title} className={className}>
      <ul className="flex flex-col gap-0.5">
        {items.map((entry, index) =>
          isGroup(entry) ? (
            <li key={`group-${entry.heading}-${index}`} className="mt-4 first:mt-1">
              <p className="px-3 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {entry.heading}
              </p>
              <ul className="flex flex-col gap-0.5">
                {entry.items.map((item) => (
                  <li key={item.href}>{renderItem(item, pathname, onNavigate)}</li>
                ))}
              </ul>
            </li>
          ) : (
            <li key={entry.href}>{renderItem(entry, pathname, onNavigate)}</li>
          )
        )}
      </ul>
    </nav>
  )
}

function isGroup(entry: PortalNavEntry): entry is PortalNavGroup {
  return "items" in entry
}

function renderItem(
  item: PortalNavItem,
  pathname: string,
  onNavigate?: () => void
) {
  const active = isItemActive(pathname, item.href)
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-9 items-center gap-2.5 rounded-md px-3 text-sm whitespace-nowrap transition-colors",
        active
          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
      )}
    >
      {Icon ? <Icon aria-hidden className="size-4 shrink-0" /> : null}
      <span className="truncate">{item.label}</span>
    </Link>
  )
}

/**
 * Portal navigation sidebar.
 *
 * - Desktop (lg+): sticky left rail with the portal title and items,
 *   highlighting the active route via `usePathname`.
 * - Mobile: a sticky top row with a drawer trigger; the same nav renders
 *   inside a left-side Sheet that closes on navigation.
 */
export function PortalSidebar({
  items,
  title,
  description,
  className,
}: PortalSidebarProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className={cn("contents", className)}>
      <div className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background px-4 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open portal menu"
              />
            }
          >
            <PanelLeftIcon />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 gap-0 bg-sidebar p-0">
            <SheetHeader className="border-b p-4">
              <SheetTitle className="text-left">{title}</SheetTitle>
              {description ? (
                <SheetDescription className="text-left">
                  {description}
                </SheetDescription>
              ) : null}
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-2">
              <PortalNavList items={items} title={title} onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <span className="font-heading font-semibold tracking-tight">{title}</span>
      </div>
      <aside className="hidden lg:sticky lg:top-14 lg:block lg:h-[calc(100vh-3.5rem)] lg:w-64 lg:shrink-0 lg:border-r bg-sidebar text-sidebar-foreground">
        <div className="flex h-full flex-col">
          <div className="border-b px-4 py-4">
            <p className="font-heading font-semibold tracking-tight">{title}</p>
            {description ? (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <PortalNavList items={items} title={title} />
          </div>
        </div>
      </aside>
    </div>
  )
}
