import type { Metadata } from "next"

import { SettingsManager } from "@/features/hospital-portal/settings-manager"
import { PortalPageHeader } from "@/features/hospital-portal/portal-page-header"
import { getDemoPartnerUser } from "@/features/hospital-portal/demo-context"

/**
 * /hospital-portal/settings — account preferences & security UI (pages/56).
 *
 * Server Component: passes the demo partner identity; all preference,
 * password and sign-out interactions are local mock state in the client
 * manager.
 */

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Demo account preferences, notification toggles and a validation-only password form for the hospital partner portal. No real account changes, authentication or sign-out backend exists (fictional demo data).",
}

export default function HospitalPortalSettingsPage() {
  const user = getDemoPartnerUser()

  return (
    <div className="space-y-8">
      <PortalPageHeader
        label="Settings"
        description="Account preferences and security UI for the demo session. Every control is mock-only: preferences persist for the page visit, the password form validates without a backend, and sign-out simply returns to the public site."
      />

      <SettingsManager userName={user.name} userEmail={user.email} />
    </div>
  )
}
