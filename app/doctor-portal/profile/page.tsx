import type { Metadata } from "next"

import { DoctorProfileForm } from "@/features/doctor-portal/components/doctor-profile-form"
import { PortalPageHeader } from "@/features/doctor-portal/components/portal-page-header"
import { getSessionDoctor } from "@/features/doctor-portal/session"
import { doctorById } from "@/data"

export const metadata: Metadata = {
  title: "Profile",
  description: "Edit the selected demo doctor profile. Changes are local mock data only.",
}

interface DoctorProfilePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DoctorProfilePage({ searchParams }: DoctorProfilePageProps) {
  const params = await searchParams
  const doctorId = typeof params.doctorId === "string" ? params.doctorId : undefined
  const doctor = (doctorId ? doctorById[doctorId] : undefined) ?? getSessionDoctor()

  return (
    <div className="space-y-6 py-8">
      <PortalPageHeader
        items={[{ label: "Doctor Portal", href: "/doctor-portal" }, { label: "Profile" }]}
        title="Profile management"
        description="Edit the selected doctor's public biography, experience and consultation preferences. Credential records remain separate verification evidence."
      />
      {doctor ? (
        <DoctorProfileForm doctor={doctor} className="max-w-4xl" />
      ) : (
        <p role="alert" className="rounded-lg border px-4 py-3 text-sm text-muted-foreground">
          Demo profile fixture could not be resolved.
        </p>
      )}
    </div>
  )
}
