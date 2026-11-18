import type { Metadata } from "next"
import Link from "next/link"
import { Building2Icon, StethoscopeIcon, HospitalIcon, CalendarDaysIcon, ArrowRightIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { appointments, doctors, facilities, hospitals, doctorById, hospitalById } from "@/data"
import { ROUTES } from "@/constants/routes"
import { AdminPageHeader } from "@/features/admin"

export const metadata: Metadata = { title: "Admin Dashboard", description: "Manage hospitals, doctors, facilities and all appointment requests." }

export default function AdminDashboardPage() {
  const recentAppointments = [...appointments].sort((a,b) => b.createdAt.localeCompare(a.createdAt)).slice(0,8)
  return <div className="space-y-6 py-6">
    <AdminPageHeader compact items={[{label:"Admin Portal"},{label:"Dashboard"}]} title="Platform overview" />
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <OverviewCard icon={Building2Icon} label="Hospitals" value={String(hospitals.length)} href={ROUTES.admin.hospitals} />
      <OverviewCard icon={StethoscopeIcon} label="Doctors" value={String(doctors.length)} href={ROUTES.admin.doctors} />
      <OverviewCard icon={HospitalIcon} label="Facilities" value={String(facilities.length)} href={ROUTES.admin.facilities} />
      <OverviewCard icon={CalendarDaysIcon} label="Appointments" value={String(appointments.length)} href={ROUTES.admin.appointments} />
    </section>
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,1fr)]">
      <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Recent appointments</CardTitle><Button variant="outline" size="sm" render={<Link href={ROUTES.admin.appointments} />}>View all</Button></CardHeader>
        <CardContent>{recentAppointments.length ? <ul className="divide-y">{recentAppointments.map((item) => {
          const provider = item.providerType === "doctor" ? doctorById[item.providerId]?.name ?? "Doctor" : hospitalById[item.providerId]?.name ?? "Hospital"
          return <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div className="min-w-0"><p className="text-sm font-medium">{item.id}</p><p className="truncate text-xs text-muted-foreground">{provider} · {item.preferredDate}</p></div><span className="rounded-full bg-muted px-2.5 py-1 text-xs capitalize">{item.status.replace(/_/g," ")}</span></li>
        })}</ul> : <p className="text-sm text-muted-foreground">No appointments yet.</p>}</CardContent>
      </Card>
      <Card><CardHeader><CardTitle>Manage platform listings</CardTitle></CardHeader><CardContent className="space-y-2">
        <ManageLink href={ROUTES.admin.hospitals} title="Hospitals" detail="Add, review and update hospital profiles" />
        <ManageLink href={ROUTES.admin.doctors} title="Doctors" detail="Manage doctor profiles and associations" />
        <ManageLink href={ROUTES.admin.facilities} title="Facilities" detail="Manage facility categories and listings" />
      </CardContent></Card>
    </section>
    <p className="text-xs text-muted-foreground">MVP preview · All figures and appointment records currently use local demo data.</p>
  </div>
}
function OverviewCard({icon:Icon,label,value,href}:{icon:React.ComponentType<{className?:string}>;label:string;value:string;href:string}) {
 return <Card><CardContent className="flex items-center gap-3 p-5"><span className="rounded-lg bg-primary/10 p-2 text-primary"><Icon className="size-5" /></span><div><p className="text-xs text-muted-foreground">{label}</p><p className="text-2xl font-semibold">{value}</p><Link href={href} className="text-xs text-primary hover:underline">Manage</Link></div></CardContent></Card>
}
function ManageLink({href,title,detail}:{href:string;title:string;detail:string}) {
 return <Link href={href} className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"><span><span className="block text-sm font-medium">{title}</span><span className="block text-xs text-muted-foreground">{detail}</span></span><ArrowRightIcon className="size-4 shrink-0 text-muted-foreground" /></Link>
}
