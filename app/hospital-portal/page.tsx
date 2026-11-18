import type { Metadata } from "next"
import { getDemoHospital, demoAppointments } from "@/features/hospital-portal/demo-context"
import { HospitalMvpDashboard } from "@/features/appointments/mvp-dashboards"

export const metadata: Metadata = {
  title: "Hospital Dashboard",
  description: "Manage your hospital profile, specialties, associated doctors and direct appointments.",
}

export default function HospitalPortalDashboardPage() {
  return <HospitalMvpDashboard hospital={getDemoHospital()} initialAppointments={demoAppointments()} />
}
