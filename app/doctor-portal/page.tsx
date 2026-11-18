import type { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/card"
import { DoctorMvpDashboard } from "@/features/appointments/mvp-dashboards"
import { appointments } from "@/data"
import { getSessionDoctor } from "@/features/doctor-portal/session"

export const metadata: Metadata = {
  title: "Doctor Dashboard",
  description: "Manage your public profile, hospital associations and appointment requests.",
}

export default function DoctorDashboardPage() {
  const doctor = getSessionDoctor()
  if (!doctor) {
    return <Card className="my-8"><CardContent className="p-6 text-sm text-muted-foreground">The demo doctor profile could not be loaded.</CardContent></Card>
  }
  return <DoctorMvpDashboard doctor={doctor} initialAppointments={appointments} />
}
