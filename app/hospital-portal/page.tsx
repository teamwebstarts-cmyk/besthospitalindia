import type { Metadata } from "next"
import Link from "next/link"
import { Building2Icon, CalendarDaysIcon, StethoscopeIcon, HeartPulseIcon, ArrowRightIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DashboardKpi } from "@/features/hospital-portal/dashboard-kpi"
import { PortalPageHeader } from "@/features/hospital-portal/portal-page-header"
import { demoAppointments, getDemoHospital } from "@/features/hospital-portal/demo-context"
import { ROUTES } from "@/constants/routes"
import { doctorById, specialtyById } from "@/data"

export const metadata: Metadata = { title: "Hospital Dashboard", description: "Manage your hospital profile, specialties, doctors and appointments." }

export default function HospitalPortalDashboardPage() {
  const hospital = getDemoHospital()
  const appointments = demoAppointments()
  const doctors = hospital.doctorIds.map((id) => doctorById[id]).filter(Boolean)

  return <div className="space-y-6">
    <PortalPageHeader label="Hospital workspace" showDemoNotice={false} />
    <section className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-sm text-muted-foreground">Welcome back</p><h1 className="text-2xl font-semibold tracking-tight">{hospital.name}</h1><p className="mt-1 text-sm text-muted-foreground">{hospital.city}, {hospital.state}</p></div>
      <Button render={<Link href={ROUTES.hospitalPortal.profile} />}>Edit hospital profile</Button>
    </section>
    <section aria-label="Hospital overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <DashboardKpi label="Profile status" value={hospital.verificationStatus === "verified" ? "Verified" : "In review"} icon={Building2Icon} href={ROUTES.hospitalPortal.profile} hideViewLink />
      <DashboardKpi label="Specialties" value={String(hospital.specialties.length)} icon={HeartPulseIcon} href={ROUTES.hospitalPortal.specialities} hideViewLink />
      <DashboardKpi label="Associated doctors" value={String(doctors.length)} icon={StethoscopeIcon} href={ROUTES.hospitalPortal.doctors} hideViewLink />
      <DashboardKpi label="Appointments" value={String(appointments.length)} icon={CalendarDaysIcon} href={ROUTES.hospitalPortal.appointments} hideViewLink />
    </section>
    <div className="grid gap-4 lg:grid-cols-2">
      <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Hospital details</CardTitle><Button variant="ghost" size="sm" render={<Link href={ROUTES.hospitalPortal.profile} />}>Manage <ArrowRightIcon className="ml-1 size-4" /></Button></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Detail label="Facility type" value={hospital.facilityType} /><Detail label="Location" value={`${hospital.city}, ${hospital.state}`} />
          <Detail label="Specialties" value={hospital.specialties.map((id) => specialtyById[id]?.name ?? id).join(", ")} />
        </CardContent></Card>
      <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Associated doctors</CardTitle><Button variant="ghost" size="sm" render={<Link href={ROUTES.hospitalPortal.doctors} />}>Manage <ArrowRightIcon className="ml-1 size-4" /></Button></CardHeader>
        <CardContent>{doctors.length ? <ul className="divide-y">{doctors.slice(0,5).map((doctor) => <li key={doctor.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0"><div><p className="text-sm font-medium">{doctor.name}</p><p className="text-xs text-muted-foreground">{specialtyById[doctor.specialization]?.name ?? "Specialist"}</p></div><span className="text-xs capitalize text-muted-foreground">{doctor.verificationStatus}</span></li>)}</ul> : <p className="text-sm text-muted-foreground">No doctors linked yet.</p>}</CardContent></Card>
    </div>
    <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Recent appointments</CardTitle><Button variant="outline" size="sm" render={<Link href={ROUTES.hospitalPortal.appointments} />}>View all</Button></CardHeader>
      <CardContent>{appointments.length ? <ul className="divide-y">{appointments.slice(0,5).map((item) => <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div><p className="text-sm font-medium">{item.id}</p><p className="text-xs text-muted-foreground">{item.preferredDate} · {item.providerType === "doctor" ? doctorById[item.providerId]?.name ?? "Doctor" : hospital.name}</p></div><span className="rounded-full bg-muted px-2.5 py-1 text-xs capitalize">{item.status.replace(/_/g," ")}</span></li>)}</ul> : <p className="text-sm text-muted-foreground">No appointments for this hospital yet.</p>}</CardContent>
    </Card>
  </div>
}
function Detail({label,value}:{label:string;value:string}) { return <div className="flex flex-col gap-1 sm:flex-row sm:justify-between"><span className="text-muted-foreground">{label}</span><span className="font-medium sm:max-w-[65%] sm:text-right">{value || "Not added"}</span></div> }
