"use client"

import { ShieldCheckIcon, UserRoundIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { doctors, doctorById } from "@/data"
import { DEMO_DOCTOR_ID, getSessionDoctor } from "@/features/doctor-portal/session"
import { useActiveDemoProvider } from "@/features/appointments/use-active-demo-provider"

export function PortalUserChip() {
  const { providerId } = useActiveDemoProvider(
    "doctor",
    DEMO_DOCTOR_ID,
    doctors.map((doctor) => doctor.id),
  )
  const doctor = doctorById[providerId] ?? getSessionDoctor()

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="gap-1 text-muted-foreground">
        <ShieldCheckIcon aria-hidden className="size-3" />
        Doctor partner
      </Badge>
      <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        <UserRoundIcon aria-hidden className="size-4 text-muted-foreground" />
        {doctor ? doctor.name : "Doctor partner"}
      </span>
    </div>
  )
}
