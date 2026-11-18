"use client"

import type { ComponentType } from "react"
import Link from "next/link"
import { Building2Icon, StethoscopeIcon, HospitalIcon, CalendarDaysIcon, HeartPulseIcon, ClockIcon, ArrowRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminPageHeader } from "@/features/admin"
import { DashboardKpi as HospitalKpi } from "@/features/hospital-portal/dashboard-kpi"
import { PortalPageHeader as HospitalPageHeader } from "@/features/hospital-portal/portal-page-header"
import { PortalPageHeader as DoctorPageHeader } from "@/features/doctor-portal/components/portal-page-header"
import { useDemoAppointmentRequests } from "./use-demo-appointment-requests"
import { doctors, facilities, hospitals, doctorById, hospitalById, specialtyById, treatmentById } from "@/data"
import { ROUTES } from "@/constants/routes"
import type { AppointmentRequest, Doctor, Hospital } from "@/types"

export function AdminMvpDashboard({ initialAppointments }: { initialAppointments: readonly AppointmentRequest[] }) {
  const requests = useDemoAppointmentRequests(initialAppointments)
  const recent = [...requests].sort((a,b) => b.createdAt.localeCompare(a.createdAt)).slice(0,8)
  return <div className="space-y-6 py-6">
    <AdminPageHeader compact items={[{label:"Admin Portal"},{label:"Dashboard"}]} title="Platform overview" />
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <OverviewCard icon={Building2Icon} label="Hospitals" value={String(hospitals.length)} href={ROUTES.admin.hospitals} />
      <OverviewCard icon={StethoscopeIcon} label="Doctors" value={String(doctors.length)} href={ROUTES.admin.doctors} />
      <OverviewCard icon={HospitalIcon} label="Facilities" value={String(facilities.length)} href={ROUTES.admin.facilities} />
      <OverviewCard icon={CalendarDaysIcon} label="Appointments" value={String(requests.length)} href={ROUTES.admin.appointments} />
    </section>
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,1fr)]">
      <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Recent appointments</CardTitle><Button variant="outline" size="sm" render={<Link href={ROUTES.admin.appointments} />}>View all</Button></CardHeader>
        <CardContent>{recent.length ? <ul className="divide-y">{recent.map((item) => {
          const provider = item.providerType === "doctor" ? doctorById[item.providerId]?.name ?? "Doctor" : hospitalById[item.providerId]?.name ?? "Hospital"
          return <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div className="min-w-0"><p className="text-sm font-medium">{item.patientName ?? "Demo patient"} · {provider}</p><p className="truncate text-xs text-muted-foreground">{item.id} · {item.preferredDate}</p></div><span className="rounded-full bg-muted px-2.5 py-1 text-xs capitalize">{item.status.replace(/_/g," ")}</span></li>
        })}</ul> : <p className="text-sm text-muted-foreground">No appointments yet.</p>}</CardContent>
      </Card>
      <Card><CardHeader><CardTitle>Manage platform listings</CardTitle></CardHeader><CardContent className="space-y-2">
        <ManageLink href={ROUTES.admin.hospitals} title="Hospitals" detail="Manage hospital profiles and listings" />
        <ManageLink href={ROUTES.admin.doctors} title="Doctors" detail="Manage doctor profiles and associations" />
        <ManageLink href={ROUTES.admin.facilities} title="Facilities" detail="Manage facility categories and listings" />
      </CardContent></Card>
    </section>
    <p className="text-xs text-muted-foreground">MVP preview · Fixture data plus demo bookings saved in this browser. No backend connection.</p>
  </div>
}

export function HospitalMvpDashboard({ hospital, initialAppointments }: { hospital: Hospital; initialAppointments: readonly AppointmentRequest[] }) {
  const requests = useDemoAppointmentRequests(initialAppointments, (item) => item.providerType === "hospital" && item.providerId === hospital.id)
  const associatedDoctors = hospital.doctorIds.map((id) => doctorById[id]).filter((item): item is Doctor => Boolean(item))
  const per = hospital.ratings.per.score === null ? "Not rated" : `${hospital.ratings.per.score}/5`
  const cer = hospital.ratings.cer.score === null ? "Not rated" : `${hospital.ratings.cer.score}/5`
  const latest = [...requests].sort((a,b) => b.createdAt.localeCompare(a.createdAt)).slice(0,5)
  return <div className="space-y-6">
    <HospitalPageHeader label="Hospital workspace" showDemoNotice={false} />
    <section className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-sm text-muted-foreground">Welcome back</p><h1 className="text-2xl font-semibold tracking-tight">{hospital.name}</h1><p className="mt-1 text-sm text-muted-foreground">{hospital.city}, {hospital.state}</p></div>
      <Button render={<Link href={ROUTES.hospitalPortal.profile} />}>Edit hospital profile</Button>
    </section>
    <section aria-label="Hospital overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <HospitalKpi label="Profile status" value={hospital.verificationStatus === "verified" ? "Verified" : "In review"} icon={Building2Icon} href={ROUTES.hospitalPortal.profile} hideViewLink />
      <HospitalKpi label="Specialties" value={String(hospital.specialties.length)} icon={HeartPulseIcon} href={ROUTES.hospitalPortal.specialities} hideViewLink />
      <HospitalKpi label="Associated doctors" value={String(associatedDoctors.length)} icon={StethoscopeIcon} href={ROUTES.hospitalPortal.doctors} hideViewLink />
      <HospitalKpi label="Appointments" value={String(requests.length)} icon={CalendarDaysIcon} href={ROUTES.hospitalPortal.appointments} hideViewLink />
    </section>
    <div className="grid gap-4 lg:grid-cols-2">
      <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Hospital profile</CardTitle><Button variant="ghost" size="sm" render={<Link href={ROUTES.hospitalPortal.profile} />}>Manage <ArrowRightIcon className="ml-1 size-4" /></Button></CardHeader>
        <CardContent className="space-y-3 text-sm"><Detail label="Facility type" value={hospital.facilityType} /><Detail label="Location" value={`${hospital.city}, ${hospital.state}`} /><Detail label="PER rating" value={per} /><Detail label="CER rating" value={cer} /><div><p className="text-muted-foreground">Overview</p><p className="mt-1 leading-relaxed">{hospital.overview || "No overview added yet."}</p></div><div><p className="text-muted-foreground">Accreditations</p>{hospital.accreditations.length ? <ul className="mt-1 space-y-1">{hospital.accreditations.map((item) => <li key={item.name} className="flex justify-between gap-2"><span>{item.name}</span><span className="text-xs capitalize text-muted-foreground">{item.status}</span></li>)}</ul> : <p className="mt-1">No accreditations listed.</p>}</div></CardContent>
      </Card>
      <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Specialties & treatments</CardTitle><Button variant="ghost" size="sm" render={<Link href={ROUTES.hospitalPortal.specialities} />}>Manage <ArrowRightIcon className="ml-1 size-4" /></Button></CardHeader>
        <CardContent className="space-y-3 text-sm"><div><p className="text-muted-foreground">Specialties</p><div className="mt-1 flex flex-wrap gap-1.5">{hospital.specialties.map((id) => <span key={id} className="rounded-full border px-2.5 py-1 text-xs">{specialtyById[id]?.name ?? id}</span>)}</div></div><div><p className="text-muted-foreground">Treatments</p><div className="mt-1 flex flex-wrap gap-1.5">{hospital.treatments.map((id) => <span key={id} className="rounded-full border px-2.5 py-1 text-xs">{treatmentById[id]?.name ?? id}</span>)}</div></div></CardContent>
      </Card>
    </div>
    <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Associated doctors</CardTitle><Button variant="outline" size="sm" render={<Link href={ROUTES.hospitalPortal.doctors} />}>Manage doctors</Button></CardHeader>
      <CardContent>{associatedDoctors.length ? <ul className="divide-y">{associatedDoctors.slice(0,6).map((doctor) => <li key={doctor.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div><p className="text-sm font-medium">{doctor.name}</p><p className="text-xs text-muted-foreground">{specialtyById[doctor.specialization]?.name ?? "Specialist"} · {doctor.city}</p></div><span className="text-xs capitalize text-muted-foreground">{doctor.verificationStatus}</span></li>)}</ul> : <p className="text-sm text-muted-foreground">No doctors linked yet.</p>}</CardContent>
    </Card>
    <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Hospital appointments</CardTitle><Button variant="outline" size="sm" render={<Link href={ROUTES.hospitalPortal.appointments} />}>View all</Button></CardHeader>
      <CardContent>{latest.length ? <ul className="divide-y">{latest.map((item) => <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div><p className="text-sm font-medium">{item.patientName ?? "Demo patient"}</p><p className="text-xs text-muted-foreground">{item.id} · {item.preferredDate}</p></div><span className="rounded-full bg-muted px-2.5 py-1 text-xs capitalize">{item.status.replace(/_/g," ")}</span></li>)}</ul> : <p className="text-sm text-muted-foreground">No appointment requests have been made directly to this hospital.</p>}</CardContent>
    </Card>
  </div>
}

export function DoctorMvpDashboard({ doctor, initialAppointments }: { doctor: Doctor; initialAppointments: readonly AppointmentRequest[] }) {
  const requests = useDemoAppointmentRequests(initialAppointments, (item) => item.providerType === "doctor" && item.providerId === doctor.id)
  const associatedHospitals = doctor.hospitalIds.map((id) => hospitalById[id]).filter((item): item is Hospital => Boolean(item))
  const pending = requests.filter((item) => item.status === "requested" || item.status === "under_review")
  const per = doctor.ratings.per.score === null ? "Not rated" : `${doctor.ratings.per.score}/5`
  const mer = doctor.ratings.mer.score === null ? "Not rated" : `${doctor.ratings.mer.score}/5`
  const latest = [...requests].sort((a,b) => b.createdAt.localeCompare(a.createdAt)).slice(0,6)
  return <div className="space-y-6 py-6">
    <DoctorPageHeader items={[{label:"Doctor Portal"},{label:"Dashboard"}]} title={`Welcome, ${doctor.name}`} description="Manage your public doctor profile, hospital associations, availability and appointment requests." action={<Button render={<Link href={ROUTES.doctorPortal.appointments} />}>View appointments</Button>} />
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard icon={CalendarDaysIcon} label="Appointments" value={String(requests.length)} href={ROUTES.doctorPortal.appointments} />
      <SummaryCard icon={ClockIcon} label="Awaiting response" value={String(pending.length)} href={ROUTES.doctorPortal.appointments} />
      <SummaryCard icon={Building2Icon} label="Hospitals" value={String(associatedHospitals.length)} href={ROUTES.doctorPortal.hospitals} />
      <SummaryCard icon={StethoscopeIcon} label="Profile status" value={doctor.verificationStatus === "verified" ? "Verified" : "In review"} href={ROUTES.doctorPortal.profile} />
    </section>
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
      <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Appointment requests</CardTitle><Button variant="ghost" size="sm" render={<Link href={ROUTES.doctorPortal.appointments} />}>View all <ArrowRightIcon className="ml-1 size-4" /></Button></CardHeader>
        <CardContent>{latest.length ? <ul className="divide-y">{latest.map((item) => <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div className="min-w-0"><p className="text-sm font-medium">{item.patientName ?? "Demo patient"}</p><p className="text-xs text-muted-foreground">{item.id} · {treatmentById[item.treatmentId ?? ""]?.name ?? "Consultation"} · {item.preferredDate}</p></div><span className="rounded-full bg-muted px-2.5 py-1 text-xs capitalize">{item.status.replace(/_/g," ")}</span></li>)}</ul> : <p className="text-sm text-muted-foreground">No appointment requests yet. Requests for your profile will appear here.</p>}</CardContent>
      </Card>
      <Card><CardHeader><CardTitle>Public profile overview</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">
        <Detail label="Specialization" value={specialtyById[doctor.specialization]?.name ?? doctor.specialization} />
        <Detail label="Location" value={`${doctor.city}, ${doctor.state}`} />
        <Detail label="Experience" value={doctor.yearsExperience === null ? "Not provided" : `${doctor.yearsExperience} years`} />
        <Detail label="Qualifications" value={doctor.qualifications.join(", ") || "Not provided"} />
        <Detail label="Medical registration" value={`${doctor.registration.authority} · ${doctor.registration.numberMasked} · ${doctor.registration.status}`} />
        <Detail label="Treatments" value={doctor.treatments.map((id) => treatmentById[id]?.name ?? id).join(", ") || "Not provided"} />
        <Detail label="Languages" value={doctor.languages.join(", ") || "Not provided"} />
        <Detail label="PER rating" value={per} /><Detail label="MER rating" value={mer} />
        <div><p className="text-muted-foreground">Hospital associations</p><ul className="mt-1 space-y-1">{associatedHospitals.map((hospital) => <li key={hospital.id}>{hospital.name}</li>)}</ul></div>
        <Button variant="outline" className="w-full" render={<Link href={ROUTES.doctorPortal.profile} />}>Edit profile</Button>
        <Button variant="outline" className="w-full" render={<Link href={ROUTES.doctorPortal.availability} />}>Manage availability</Button>
      </CardContent></Card>
    </div>
  </div>
}

function OverviewCard({icon:Icon,label,value,href}:{icon:ComponentType<{className?:string}>;label:string;value:string;href:string}) {
 return <Card><CardContent className="flex items-center gap-3 p-5"><span className="rounded-lg bg-primary/10 p-2 text-primary"><Icon className="size-5" /></span><div><p className="text-xs text-muted-foreground">{label}</p><p className="text-2xl font-semibold">{value}</p><Link href={href} className="text-xs text-primary hover:underline">Manage</Link></div></CardContent></Card>
}
function ManageLink({href,title,detail}:{href:string;title:string;detail:string}) {
 return <Link href={href} className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"><span><span className="block text-sm font-medium">{title}</span><span className="block text-xs text-muted-foreground">{detail}</span></span><ArrowRightIcon className="size-4 shrink-0 text-muted-foreground" /></Link>
}
function SummaryCard({icon:Icon,label,value,href}:{icon:ComponentType<{className?:string}>;label:string;value:string;href:string}) {
 return <Card><CardContent className="flex items-center gap-3 p-5"><span className="rounded-lg bg-primary/10 p-2 text-primary"><Icon className="size-5" /></span><div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="text-xl font-semibold">{value}</p><Link href={href} className="text-xs text-primary hover:underline">Manage</Link></div></CardContent></Card>
}
function Detail({label,value}:{label:string;value:string}) { return <div className="flex flex-col gap-1 sm:flex-row sm:justify-between"><span className="text-muted-foreground">{label}</span><span className="font-medium sm:max-w-[65%] sm:text-right">{value || "Not provided"}</span></div> }
