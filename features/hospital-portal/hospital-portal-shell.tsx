"use client"

import type { ReactNode } from "react"
import { PortalShell } from "@/components/layout/portal-shell"
import { hospitalPortalNav } from "@/constants/navigation"
import { hospitals, hospitalById } from "@/data"
import { getDemoHospital } from "@/features/hospital-portal/demo-context"
import { useActiveDemoProvider } from "@/features/appointments/use-active-demo-provider"

export interface HospitalPortalShellProps {
  children: ReactNode
}

export function HospitalPortalShell({ children }: HospitalPortalShellProps) {
  const fallbackHospital = getDemoHospital()
  const { providerId } = useActiveDemoProvider(
    "hospital",
    fallbackHospital.id,
    hospitals.map((hospital) => hospital.id),
  )
  const hospital = hospitalById[providerId] ?? fallbackHospital

  return (
    <PortalShell
      items={hospitalPortalNav}
      title="Hospital Portal"
      description="Demo hospital workspace — mock provider preview"
      actions={
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <span
            aria-hidden
            className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
          >
            {initials(hospital.name)}
          </span>
          <span className="hidden xl:inline">
            {hospital.name} · Hospital (demo)
          </span>
          <span className="sr-only">
            Previewing demo hospital {hospital.name}
          </span>
        </span>
      }
    >
      {children}
    </PortalShell>
  )
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase()
}
