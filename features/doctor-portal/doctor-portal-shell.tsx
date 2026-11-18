"use client"

import type { ReactNode } from "react"
import { PortalShell } from "@/components/layout/portal-shell"
import { doctorPortalNav } from "@/constants/navigation"
import { doctors } from "@/data"
import { DEMO_DOCTOR_ID } from "@/features/doctor-portal/session"
import { PortalUserChip } from "@/features/doctor-portal/components/portal-user-chip"
import { useActiveDemoProvider } from "@/features/appointments/use-active-demo-provider"

export interface DoctorPortalShellProps {
  children: ReactNode
}

export function DoctorPortalShell({ children }: DoctorPortalShellProps) {
  const { providerId } = useActiveDemoProvider(
    "doctor",
    DEMO_DOCTOR_ID,
    doctors.map((doctor) => doctor.id),
  )
  const items = doctorPortalNav.map((item) =>
    ["/doctor-portal/profile", "/doctor-portal/hospitals", "/doctor-portal/availability"].includes(item.href)
      ? { ...item, href: item.href + "?doctorId=" + encodeURIComponent(providerId) }
      : item,
  )

  return (
    <PortalShell
      items={items}
      title="Doctor Portal"
      description="Demo partner workspace — selected doctor preview"
      actions={<PortalUserChip />}
    >
      {children}
    </PortalShell>
  )
}
