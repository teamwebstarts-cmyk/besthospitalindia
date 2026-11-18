import type { Metadata } from "next"
import { appointments } from "@/data"
import { AdminMvpDashboard } from "@/features/appointments/mvp-dashboards"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage hospitals, doctors, facilities and appointment requests.",
}

export default function AdminDashboardPage() {
  return <AdminMvpDashboard initialAppointments={appointments} />
}
