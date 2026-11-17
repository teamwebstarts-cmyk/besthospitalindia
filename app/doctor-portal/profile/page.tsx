import type { Metadata } from "next"

import { DoctorProfileForm } from "@/features/doctor-portal/components/doctor-profile-form"
import { PortalPageHeader } from "@/features/doctor-portal/components/portal-page-header"
import { getSessionDoctor } from "@/features/doctor-portal/session"

export const metadata: Metadata = {
  title: "Profile",
  description:
    "Edit the demo doctor profile: public biography, experience, languages and consultation preferences. Demo data only — nothing is saved.",
}

/**
 * /doctor-portal/profile — Doctor Profile Management (pages/58).
 *
 * Server Component shell + client form. Edits qualifications/specialization/
 * experience/languages/bio per the spec within the frozen A01 contract:
 * fixture-locked verification fields render read-only, editable fields are
 * local state, and "save draft" runs the shared saveProvider mock action.
 * Acceptance: "No unverified credential marked verified" — verification badges
 * here derive ONLY from fixture statuses and never from the local draft state.
 */
export default function DoctorProfilePage() {
  const doctor = getSessionDoctor()

  return (
    <div className="space-y-6 py-8">
      <PortalPageHeader
        items={[
          { label: "Doctor Portal", href: "/doctor-portal" },
          { label: "Profile" },
        ]}
        title="Profile management"
        description="Edit your public biography, experience and consultation preferences. Qualification and registration records are part of your verification evidence and are managed in the credentials module."
      />

      {doctor ? (
        <DoctorProfileForm doctor={doctor} className="max-w-4xl" />
      ) : (
        <p role="alert" className="rounded-lg border px-4 py-3 text-sm text-muted-foreground">
          Demo profile fixture could not be resolved. The portal session identity is missing
          from the demo data.
        </p>
      )}
    </div>
  )
}
