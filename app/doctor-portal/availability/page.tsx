import type { Metadata } from "next"

import { PortalPageHeader } from "@/features/doctor-portal/components/portal-page-header"
import { AvailabilityEditor } from "@/features/doctor-portal/components/availability-editor"
import { getSessionDoctor } from "@/features/doctor-portal/session"
import { doctorById } from "@/data"

export const metadata: Metadata = {
  title: "Availability",
  description: "Configure demo weekly consulting hours and time windows. No live booking calendar is connected.",
}

interface DoctorAvailabilityPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DoctorAvailabilityPage({ searchParams }: DoctorAvailabilityPageProps) {
  const params = await searchParams
  const doctorId = typeof params.doctorId === "string" ? params.doctorId : undefined
  const doctor = (doctorId ? doctorById[doctorId] : undefined) ?? getSessionDoctor()

  return (
    <div className="space-y-6 py-8">
      <PortalPageHeader
        items={[{ label: "Doctor Portal", href: "/doctor-portal" }, { label: "Availability" }]}
        title="Availability"
        description={
          doctor
            ? `Weekly consulting windows for ${doctor.name} (demo). Toggle days, set time ranges and validate overlaps — hours never reach a real booking system.`
            : "Weekly consulting windows. Toggle days, set time ranges and validate overlaps — hours never reach a real booking system."
        }
      />
      <section aria-label="Demo state boundary" className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">Demo boundary:</span> this schedule is
          session-local. The mock data contract has no stored availability records, so changes
          reset when you reload — the controls demonstrate the editing and validation flow only.
        </p>
      </section>
      <AvailabilityEditor />
    </div>
  )
}
