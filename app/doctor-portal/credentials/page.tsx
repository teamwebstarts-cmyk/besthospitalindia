import type { Metadata } from "next"

import { PortalPageHeader } from "@/features/doctor-portal/components/portal-page-header"
import { CredentialsClient } from "@/features/doctor-portal/components/credentials-client"
import { getSessionDoctor } from "@/features/doctor-portal/session"

export const metadata: Metadata = {
  title: "Credentials",
  description:
    "Maintain qualification and registration evidence metadata with verification states. Demo only — no document upload or real verification exists.",
}

/**
 * /doctor-portal/credentials — Credentials (pages/63).
 *
 * Server Component shell + client island. Fixture qualification/registration
 * rows render their true verification statuses (acceptance: "No unverified
 * credential marked verified" — badges derive only from fixture values or the
 * explicit local placeholder lifecycle). No upload exists; the add form
 * captures metadata labels only.
 */
export default function DoctorCredentialsPage() {
  const doctor = getSessionDoctor()

  return (
    <div className="space-y-6 py-8">
      <PortalPageHeader
        items={[
          { label: "Doctor Portal", href: "/doctor-portal" },
          { label: "Credentials" },
        ]}
        title="Credentials & evidence"
        description="Qualification and registration records behind your verification status and the MER assessment track. Fixture rows are read-only; practice adding local credential placeholders below."
      />

      {doctor ? (
        <CredentialsClient doctor={doctor} />
      ) : (
        <p role="alert" className="rounded-lg border px-4 py-3 text-sm text-muted-foreground">
          Demo profile fixture could not be resolved. The portal session identity is missing
          from the demo data.
        </p>
      )}
    </div>
  )
}
