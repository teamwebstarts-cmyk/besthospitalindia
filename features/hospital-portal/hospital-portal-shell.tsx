"use client"

/**
 * HospitalPortalShell — client shell for the hospital partner portal (A09).
 *
 * The shared `PortalShell` (A00) is a Server Component that takes
 * `items: PortalNavEntry[]` — items may carry lucide icon components, and
 * component references cannot cross the server→client boundary (functions and
 * components are not serializable as props). The portal layout therefore
 * renders this thin client wrapper, which imports the frozen
 * `hospitalPortalNav` registry directly and composes the shared shell.
 *
 * Same pattern as PublicHeader (client component importing the nav registry
 * server-side-unsafe props are simply not used).
 */

import type { ReactNode } from "react"

import { PortalShell } from "@/components/layout/portal-shell"
import { hospitalPortalNav } from "@/constants/navigation"
import { getDemoPartnerUserSafe } from "@/features/hospital-portal/demo-session"

export interface HospitalPortalShellProps {
  children: ReactNode
}

export function HospitalPortalShell({ children }: HospitalPortalShellProps) {
  const user = getDemoPartnerUserSafe()

  return (
    <PortalShell
      items={hospitalPortalNav}
      title="Hospital Portal"
      description="Demo partner workspace — Sunrise Multispeciality Hospital, New Delhi (fictional)"
      actions={
        user ? (
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <span
              aria-hidden
              className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
            >
              {initials(user.name)}
            </span>
            <span className="hidden xl:inline">
              {user.name} · <span className="capitalize">{user.role}</span>
            </span>
            <span className="sr-only">
              Signed in as demo hospital partner user {user.name}, role {user.role}
            </span>
          </span>
        ) : null
      }
    >
      {children}
    </PortalShell>
  )
}

/** Initials for the demo user chip (display only). */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase()
}
