import type { ReactNode } from "react"

import { PortalSidebar } from "@/components/layout/portal-sidebar"
import { Badge } from "@/components/ui/badge"
import type { PortalNavEntry } from "@/constants/navigation"
import { cn } from "@/lib/utils"

export interface PortalShellProps {
  /** Sidebar navigation items (flat) or grouped entries. */
  items: PortalNavEntry[]
  /** Portal title, shown in the sidebar and mobile drawer. */
  title: string
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
  description,
  actions,
  children,
  className,
}: PortalShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <PortalSidebar items={items} title={title} description={description} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="hidden h-14 items-center justify-between gap-4 border-b bg-background px-6 lg:flex">
          <Badge variant="outline" className="text-muted-foreground">
            Demo portal — mock data only
          </Badge>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
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
