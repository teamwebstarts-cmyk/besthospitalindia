import type { Metadata } from "next"
import type { ComponentProps } from "react"

/**
 * /admin — Admin Dashboard (pages/23).
 *
 * Server Component — KPI totals and queues from pure selectors over frozen
 * fixtures. No rating scores on this page; pending assessments are counts only.
 */

import Link from "next/link"
import {
  ActivityIcon,
  ArrowRightIcon,
  BuildingIcon,
  CalendarDaysIcon,
  ClipboardListIcon,
  GlobeIcon,
  MessagesSquareIcon,
  ShieldCheckIcon,
  StarIcon,
  StethoscopeIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { appointments, doctors, hospitals, patientEnquiries, partnerUsers, patients } from "@/data"
import { ROUTES } from "@/constants/routes"
import {
  AdminPageHeader,
  DashboardKpi,
  assessmentsNeedingReviewCount,
  doctorsPendingVerification,
  facilitiesPendingVerification,
  formatDateTime,
  hospitalsPendingVerification,
  openAppointmentRequests,
  openEnquiries,
  recentPlatformActivity,
  reviewsAwaitingModeration,
  unassignedTourismCases,
} from "@/features/admin"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Admin dashboard (demo): platform overview and review queues.",
}

const KIND_ICONS = {
  enquiry: MessagesSquareIcon,
  appointment: CalendarDaysIcon,
  review: StarIcon,
  tourism: GlobeIcon,
  provider: ShieldCheckIcon,
} as const

const ACTIVITY_LIMIT = 6

export default function AdminDashboardPage() {
  const hospitalQueue = hospitalsPendingVerification()
  const doctorQueue = doctorsPendingVerification()
  const facilityQueue = facilitiesPendingVerification()
  const enquiryQueue = openEnquiries()
  const appointmentQueue = openAppointmentRequests()
  const moderationQueue = reviewsAwaitingModeration()
  const ratingQueueCount = assessmentsNeedingReviewCount()
  const unassignedTourism = unassignedTourismCases()
  const activity = recentPlatformActivity().slice(0, ACTIVITY_LIMIT)

  const queueItems = [
    hospitalQueue.length > 0
      ? {
          title: `Hospitals (${hospitalQueue.length})`,
          status: "pending" as const,
          href: ROUTES.admin.hospitals,
          linkLabel: "Review",
        }
      : null,
    doctorQueue.length > 0
      ? {
          title: `Doctors (${doctorQueue.length})`,
          status: "pending" as const,
          href: ROUTES.admin.doctors,
          linkLabel: "Review",
        }
      : null,
    facilityQueue.length > 0
      ? {
          title: `Facilities (${facilityQueue.length})`,
          status: "pending" as const,
          href: ROUTES.admin.facilities,
          linkLabel: "Review",
        }
      : null,
    moderationQueue.length > 0
      ? {
          title: `Reviews (${moderationQueue.length})`,
          status: "warning" as const,
          href: ROUTES.admin.reviews,
          linkLabel: "Moderate",
        }
      : null,
    ratingQueueCount > 0
      ? {
          title: `Ratings (${ratingQueueCount})`,
          status: "under_review" as const,
          href: ROUTES.admin.ratings,
          linkLabel: "Review",
        }
      : null,
  ].filter(Boolean) as Array<{
    title: string
    status: ComponentProps<typeof StatusBadge>["status"]
    href: string
    linkLabel: string
  }>

  const trend = buildWeeklyTrend()
  const trendMax = Math.max(1, ...trend.map((t) => Math.max(t.enquiries, t.appointments)))

  return (
    <div className="space-y-6 py-6">
      <AdminPageHeader
        compact
        items={[{ label: "Admin Portal" }, { label: "Dashboard" }]}
        title="Platform overview"
      />

      <section aria-labelledby="kpi-heading" className="space-y-3">
        <h2 id="kpi-heading" className="sr-only">
          Platform totals
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardKpi
            icon={BuildingIcon}
            label="Hospitals"
            value={String(hospitals.length)}
            hint={hospitalQueue.length > 0 ? `${hospitalQueue.length} pending` : undefined}
            href={ROUTES.admin.hospitals}
          />
          <DashboardKpi
            icon={StethoscopeIcon}
            label="Doctors"
            value={String(doctors.length)}
            hint={doctorQueue.length > 0 ? `${doctorQueue.length} to review` : undefined}
            href={ROUTES.admin.doctors}
          />
          <DashboardKpi
            icon={UsersIcon}
            label="Patients"
            value={String(patients.length)}
            href={ROUTES.admin.patients}
          />
          <DashboardKpi
            icon={MessagesSquareIcon}
            label="Enquiries"
            value={String(patientEnquiries.length)}
            hint={enquiryQueue.length > 0 ? `${enquiryQueue.length} open` : undefined}
            href={ROUTES.admin.consultations}
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-1.5 text-base">
              <ShieldCheckIcon aria-hidden className="size-4 text-warning" />
              Needs attention
            </CardTitle>
          </CardHeader>
          <CardContent className="gap-0">
            {queueItems.length === 0 ? (
              <EmptyState
                icon={ShieldCheckIcon}
                title="Queues clear"
                description="Nothing pending verification or moderation."
              />
            ) : (
              <ul className="divide-y" aria-label="Items needing attention">
                {queueItems.map((item) => (
                  <QueueRow key={item.href} {...item} />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-1.5 text-base">
                <ActivityIcon aria-hidden className="size-4 text-muted-foreground" />
                Operations
              </CardTitle>
            </CardHeader>
            <CardContent className="gap-0">
              <ul className="divide-y text-sm">
                <OpRow
                  label="Appointments"
                  count={appointmentQueue.length}
                  href={ROUTES.admin.appointments}
                />
                <OpRow
                  label="Tourism cases"
                  count={unassignedTourism}
                  href={ROUTES.admin.medicalTourism}
                />
                <OpRow label="Partners" count={partnerUsers.length} href={ROUTES.admin.partners} />
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-1.5 text-base">
                <TrendingUpIcon aria-hidden className="size-4 text-muted-foreground" />
                Weekly volume (demo)
              </CardTitle>
            </CardHeader>
            <CardContent className="gap-3">
              <ul className="space-y-2.5" aria-label="Weekly demo trend">
                {trend.map((week) => (
                  <li key={week.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs tabular-nums text-muted-foreground">
                      <span>{week.label}</span>
                      <span>
                        {week.enquiries}E · {week.appointments}A
                      </span>
                    </div>
                    <div
                      className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-muted"
                      role="img"
                      aria-label={`${week.label}: ${week.enquiries} enquiries, ${week.appointments} appointments`}
                    >
                      <span
                        className="h-full rounded-full bg-primary/70"
                        style={{ width: `${Math.round((week.enquiries / trendMax) * 100)}%` }}
                      />
                      <span
                        className="h-full rounded-full bg-info/70"
                        style={{ width: `${Math.round((week.appointments / trendMax) * 100)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-1.5 text-base">
              <ClipboardListIcon aria-hidden className="size-4 text-muted-foreground" />
              Recent activity
            </CardTitle>
          </CardHeader>
          <CardContent className="gap-0">
            {activity.length === 0 ? (
              <EmptyState icon={ActivityIcon} title="No recent activity" />
            ) : (
              <ul className="divide-y" aria-label="Recent platform activity">
                {activity.map((item) => {
                  const ItemIcon = KIND_ICONS[item.kind]
                  return (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
                          <ItemIcon aria-hidden className="size-3.5 text-muted-foreground" />
                        </span>
                        <p className="truncate text-sm text-foreground">{item.summary}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <time dateTime={item.at} className="text-xs text-muted-foreground">
                          {formatDateTime(item.at)}
                        </time>
                        {item.href ? (
                          <Link
                            href={item.href}
                            className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                          >
                            Open
                          </Link>
                        ) : null}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function QueueRow({
  title,
  status,
  href,
  linkLabel,
}: {
  title: string
  status: ComponentProps<typeof StatusBadge>["status"]
  href: string
  linkLabel: string
}) {
  return (
    <li className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
      <div className="flex min-w-0 items-center gap-2">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        <StatusBadge status={status} />
      </div>
      <Button
        variant="ghost"
        size="sm"
        render={<Link href={href} />}
        className="shrink-0 gap-1"
      >
        {linkLabel}
        <ArrowRightIcon aria-hidden className="size-3.5" />
      </Button>
    </li>
  )
}

function OpRow({ label, count, href }: { label: string; count: number; href: string }) {
  return (
    <li className="flex items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2 font-medium tabular-nums text-foreground">
        {count}
        <Link
          href={href}
          className="text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          Open
        </Link>
      </span>
    </li>
  )
}

function buildWeeklyTrend(): Array<{ label: string; enquiries: number; appointments: number }> {
  const buckets = new Map<string, { enquiries: number; appointments: number }>()

  function bucketKey(iso: string): string {
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return "unknown"
    const jan1 = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
    const week = Math.ceil(((date.getTime() - jan1.getTime()) / 86_400_000 + jan1.getUTCDay() + 1) / 7)
    return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`
  }

  for (const enquiry of patientEnquiries) {
    const key = bucketKey(enquiry.consentAt)
    const bucket = buckets.get(key) ?? { enquiries: 0, appointments: 0 }
    bucket.enquiries += 1
    buckets.set(key, bucket)
  }
  for (const appointment of appointments) {
    const key = bucketKey(appointment.createdAt)
    const bucket = buckets.get(key) ?? { enquiries: 0, appointments: 0 }
    bucket.appointments += 1
    buckets.set(key, bucket)
  }

  return [...buckets.entries()]
    .filter(([key]) => key !== "unknown")
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-4)
    .map(([key, counts]) => ({ label: key, ...counts }))
}