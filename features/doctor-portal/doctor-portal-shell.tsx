"use client"

/**
 * DoctorPortalShell — client shell for the doctor partner portal (A10).
 *
 * The shared `PortalShell` (A00) is a Server Component that takes
 * `items: PortalNavEntry[]` — items may carry lucide icon components, and
 * component references cannot cross the server→client boundary (functions and
 * components are not serializable as props). The portal layout therefore
 * renders this thin client wrapper, which imports the frozen
 * `doctorPortalNav` registry directly and composes the shared shell.
 *
 * Same pattern as HospitalPortalShell (A09) and PublicHeader: client
 * component importing the nav registry itself; server-unsafe props are
 * simply not used.
 */

import type { ReactNode } from "react"

import { PortalShell } from "@/components/layout/portal-shell"
import { doctorPortalNav } from "@/constants/navigation"
import { PortalUserChip } from "@/features/doctor-portal/components/portal-user-chip"

export interface DoctorPortalShellProps {
  children: ReactNode
}

export function DoctorPortalShell({ children }: DoctorPortalShellProps) {
  return (
    <PortalShell
      items={doctorPortalNav}
      title="Doctor Portal"
      description="Demo partner workspace — fictional data only"
      actions={<PortalUserChip />}
    >
      {children}
    </PortalShell>
  )
}
