import type { Metadata } from "next"
import Link from "next/link"
import { CalendarDaysIcon, ClockIcon, HospitalIcon, UserRoundIcon, ArrowRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PortalPageHeader } from "@/features/doctor-portal/components/portal-page-header"
import { getSessionDoctor } from "@/features/doctor-portal/session"
import { appointmentsForDoctor, formatDate, patientDisplayName, treatmentLabel } from "@/features/doctor-portal"
import { ROUTES } from "@/constants/routes"
import { hospitalById } from "@/data"

export const metadata: Metadata = { title: "Doctor Dashboard", description: "Manage your doctor profile, hospital associations, availability and appointments." }

export default function DoctorDashboardPage() {
  const doctor = getSessionDoctor()
  if (!doctor) return <div className="py-8"><PortalPageHeader items={[{label:"Doctor Portal"}]} title="Dashboard" /><p className="text-sm text-muted-foreground">Doctor demo profile could not be loaded.</p></div>
  const appointments = appointmentsForDoctor(doctor.id)
  const pending = appointments.filter((item) => ["requested","under_review"].includes(item.status))
  const hospitals = doctor.hospitalIds.map((id) => hospitalById[id]).filter(Boolean)

  return <div className="space-y-6 py-6">
    <PortalPageHeader items={[{label:"Doctor Portal"},{label:"Dashboard"}]} title={`Welcome, ${doctor.name}`} description="Your profile and appointment requests in one place." action={<Button render={<Link href={ROUTES.doctorPortal.appointments} />}>View appointments</Button>} />
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard icon={CalendarDaysIcon} label="Appointments" value={String(appointments.length)} href={ROUTES.doctorPortal.appointments} />
      <SummaryCard icon={ClockIcon} label="Awaiting response" value={String(pending.length)} href={ROUTES.doctorPortal.appointments} />
      <SummaryCard icon={HospitalIcon} label="Associated hospitals" value={String(hospitals.length)} href={ROUTES.doctorPortal.hospitals} />
      <SummaryCard icon={UserRoundIcon} label="Profile status" value={doctor.verificationStatus === "verified" ? "Verified" : "In review"} href={ROUTES.doctorPortal.profile} />
    </section>
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
      <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Appointment requests</CardTitle><Button variant="ghost" size="sm" render={<Link href={ROUTES.doctorPortal.appointments} />}>View all <ArrowRightIcon className="ml-1 size-4" /></Button></CardHeader>
        <CardContent>{appointments.length ? <ul className="divide-y">{appointments.slice(0,6).map((item) => <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div className="min-w-0"><p className="text-sm font-medium">{patientDisplayName(item.patientId)}</p><p className="text-xs text-muted-foreground">{treatmentLabel(item.treatmentId) ?? "Consultation"} · {formatDate(item.preferredDate)}</p></div><span className="rounded-full bg-muted px-2.5 py-1 text-xs capitalize">{item.status.replace(/_/g," ")}</span></li>)}</ul> : <p className="text-sm text-muted-foreground">No appointment requests yet. New requests for your profile will appear here.</p>}</CardContent>
      </Card>
      <Card><CardHeader><CardTitle>Profile overview</CardTitle></CardHeader><CardContent className="space-y-4 text-sm">
        <div><p className="text-muted-foreground">Specialization</p><p className="font-medium">{doctor.specialization}</p></div>
        <div><p className="text-muted-foreground">Location</p><p className="font-medium">{doctor.city}, {doctor.state}</p></div>
        <div><p className="text-muted-foreground">Hospitals</p><p className="font-medium">{hospitals.map((hospital) => hospital.name).join(", ") || "Not associated"}</p></div>
        <Button variant="outline" className="w-full" render={<Link href={ROUTES.doctorPortal.profile} />}>Edit profile</Button>
        <Button variant="outline" className="w-full" render={<Link href={ROUTES.doctorPortal.availability} />}>Manage availability</Button>
      </CardContent></Card>
    </div>
  </div>
}
function SummaryCard({icon:Icon,label,value,href}:{icon:React.ComponentType<{className?:string}>;label:string;value:string;href:string}) {
 return <Card><CardContent className="flex items-center gap-3 p-5"><span className="rounded-lg bg-primary/10 p-2 text-primary"><Icon className="size-5" /></span><div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="text-xl font-semibold">{value}</p><Link href={href} className="text-xs text-primary hover:underline">Manage</Link></div></CardContent></Card>
}
