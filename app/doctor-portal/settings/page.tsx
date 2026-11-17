import type { Metadata } from "next"

import { PortalPageHeader } from "@/features/doctor-portal/components/portal-page-header"
import { SettingsClient } from "@/features/doctor-portal/components/settings-client"
import { getSessionDoctor } from "@/features/doctor-portal/session"

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Demo portal preferences and account summary. Mock-only — no real preference storage, authentication or security action exists.",
}

/**
 * /doctor-portal/settings — Doctor Settings (pages/65).
 *
 * Server Component shell + client island. Acceptance: "No real auth/security
 * action" — sign-out runs through the shared ConfirmDialog and resolves to an
 * explicit demo-boundary confirmation, never a session change.
 */
export default function DoctorSettingsPage() {
  const doctor = getSessionDoctor()

  return (
    <div className="space-y-6 py-8">
      <PortalPageHeader
        items={[
          { label: "Doctor Portal", href: "/doctor-portal" },
          { label: "Settings" },
        ]}
        title="Settings"
        description="Demo preferences and account summary for the doctor portal. Toggles and sign-out are demonstration UI — nothing is stored, sent or authenticated."
      />

      {doctor ? (
        <SettingsClient doctor={doctor} />
      ) : (
        <p role="alert" className="rounded-lg border px-4 py-3 text-sm text-muted-foreground">
          Demo profile fixture could not be resolved. The portal session identity is missing
          from the demo data.
        </p>
      )}
    </div>
  )
}
