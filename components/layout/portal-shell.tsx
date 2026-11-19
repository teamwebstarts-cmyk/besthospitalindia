import type { ReactNode } from "react"

import { PortalSidebar } from "@/components/layout/portal-sidebar"
import { PortalTopBar } from "@/components/layout/portal-top-bar"
import type { PortalNavEntry } from "@/constants/navigation"
import { flattenPortalNav } from "@/lib/navigation/flatten-portal-nav"
import { cn } from "@/lib/utils"

export interface PortalShellProps {
  /** Sidebar navigation items (flat) or grouped entries. */
  items: PortalNavEntry[]
  /** Portal title, shown in the sidebar and mobile drawer. */
  title: string
  /** Breadcrumb root href (usually the portal dashboard). */
  portalHomeHref: string
  /** Optional description under the sidebar title. */
  description?: string
  /** Optional right-aligned topbar slot (user menu, actions). */
  actions?: ReactNode
  children: ReactNode
  className?: string
}

/**
 * Portal workspace shell: PortalSidebar (desktop rail + mobile drawer),
 * a topbar with a demo-portal notice and optional action slot, and a
 * centered content container.
 */
export function PortalShell({
  items,
  title,
  portalHomeHref,
  description,
  actions,
  children,
  className,
}: PortalShellProps) {
  const navItems = flattenPortalNav(items)
  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <PortalSidebar items={items} title={title} description={description} />
      <div className="flex min-w-0 flex-1 flex-col">
        <PortalTopBar
          portalTitle={title}
          portalHomeHref={portalHomeHref}
          navItems={navItems}
          actions={actions}
        />
        <main
          id="main"
          className={cn(
            "mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8",
            className
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
