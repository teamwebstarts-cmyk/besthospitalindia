import type { Metadata } from "next"

import { PortalPageHeader } from "@/features/doctor-portal/components/portal-page-header"
import { AvailabilityEditor } from "@/features/doctor-portal/components/availability-editor"
import { getSessionDoctor } from "@/features/doctor-portal/session"

export const metadata: Metadata = {
  title: "Availability",
  description:
    "Configure demo weekly consulting hours and time windows with overlap validation. Demo state only — no booking calendar exists.",
}

/**
 * /doctor-portal/availability — Availability (pages/60).
 *
 * Server Component shell + client editor island. Acceptance per spec: validate
 * time order and overlap (features/doctor-portal/availability.ts), no real
 * booking calendar. The editor starts from an empty local week — the fixture
 * layer intentionally has no availability entity, and the page says so plainly
 * rather than pretending a schedule exists.
 */
export default function DoctorAvailabilityPage() {
  const doctor = getSessionDoctor()

  return (
    <div className="space-y-6 py-8">
      <PortalPageHeader
        items={[
          { label: "Doctor Portal", href: "/doctor-portal" },
          { label: "Availability" },
        ]}
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
          reset when you reload — the controls exist to demonstrate the editing and validation
          flow only.
        </p>
      </section>

      <AvailabilityEditor />
    </div>
  )
}
