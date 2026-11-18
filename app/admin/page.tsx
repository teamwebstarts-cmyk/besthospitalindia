import type { Metadata } from "next"

/**
 * /admin — Admin Dashboard (pages/23).
 *
 * One screen-level question (14-admin-module-contracts.md dashboard skill):
 * "what on the platform needs admin attention today?" Composition per spec:
 * reconciled KPI totals (hospitals / doctors / patients / enquiries), the
 * operational problem queue (pending verification + moderation), trend
 * metadata, recent platform activity and shortcuts into the management
 * modules.
 *
 * Server Component — the page reads frozen fixtures through pure selectors
 * and renders links; interactive queue actions live on their module pages.
 * Every KPI value is derived from the same fixture arrays the module pages
 * render, so the totals reconcile exactly (pages/23 §6) — nothing is
 * hardcoded in JSX.
 *
 * RATINGS RULE: no rating appears on this page; pending assessments are
 * counted, never scored, and a missing score is never shown as 0.
 */

import Link from "next/link"
import {
  ActivityIcon,
  ArrowRightIcon,
  BuildingIcon,
  CalendarDaysIcon,
  ClipboardListIcon,
  GlobeIcon,
  HeartHandshakeIcon,
  HospitalIcon,
  MessagesSquareIcon,
  ShieldCheckIcon,
  StarIcon,
  StethoscopeIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
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
  description:
    "Admin dashboard (demo): platform overview KPIs, pending verification queues, moderation counts and recent demo activity. Fictional fixture data only.",
}

const KIND_ICONS = {
  enquiry: MessagesSquareIcon,
  appointment: CalendarDaysIcon,
  review: StarIcon,
  tourism: GlobeIcon,
  provider: ShieldCheckIcon,
} as const

export default function AdminDashboardPage() {
  const hospitalQueue = hospitalsPendingVerification()
  const doctorQueue = doctorsPendingVerification()
  const facilityQueue = facilitiesPendingVerification()
  const enquiryQueue = openEnquiries()
  const appointmentQueue = openAppointmentRequests()
  const moderationQueue = reviewsAwaitingModeration()
  const ratingQueueCount = assessmentsNeedingReviewCount()
  const unassignedTourism = unassignedTourismCases()
  const activity = recentPlatformActivity()

  const urgentQueueCount =
    hospitalQueue.length +
    doctorQueue.length +
    facilityQueue.length +
    moderationQueue.length +
    ratingQueueCount

  // Demo trend metadata: weekly counts derived from the enquiry/appointment
  // fixtures by consent/creation week (illustrative only — labelled as demo,
  // never live analytics).
  const trend = buildWeeklyTrend()
  const trendMax = Math.max(1, ...trend.map((t) => Math.max(t.enquiries, t.appointments)))

  return (
    <div className="space-y-8 py-8">
      <AdminPageHeader
        items={[{ label: "Admin Portal" }, { label: "Dashboard" }]}
        title="Platform overview"
        description="One view of the demo platform's providers, patients and operational queues. Every number below is derived from the same fictional fixtures the module pages render — nothing is live analytics."
        action={
          <Button render={<Link href={ROUTES.admin.hospitals} />}>
            Review hospital verifications
          </Button>
        }
      />

      {/* KPI row — reconciled totals derived from the frozen fixtures */}
      <section aria-labelledby="kpi-heading" className="space-y-3">
        <h2 id="kpi-heading" className="sr-only">
          Platform totals
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardKpi
            icon={BuildingIcon}
            label="Total hospitals"
            value={String(hospitals.length)}
            hint={`${hospitalQueue.length} in the verification queue`}
            href={ROUTES.admin.hospitals}
          />
          <DashboardKpi
            icon={StethoscopeIcon}
            label="Total doctors"
            value={String(doctors.length)}
            hint={`${doctorQueue.length} with credentials to review`}
            href={ROUTES.admin.doctors}
          />
          <DashboardKpi
            icon={UsersIcon}
            label="Registered patients (demo)"
            value={String(patients.length)}
            hint="Fictional demo accounts with consented fixture data"
            href={ROUTES.admin.patients}
          />
          <DashboardKpi
            icon={MessagesSquareIcon}
            label="Patient enquiries"
            value={String(patientEnquiries.length)}
            hint={`${enquiryQueue.length} awaiting admin action`}
            href={ROUTES.admin.consultations}
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Problem queue — urgent exceptions beside their actions (dashboard skill) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <ShieldCheckIcon aria-hidden className="size-4 text-warning" />
              Pending verification &amp; moderation
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Items needing an admin decision. Open the module to act — actions
              are local demo state only.
            </p>
          </CardHeader>
          <CardContent className="gap-0">
            {urgentQueueCount === 0 ? (
              <EmptyState
                icon={ShieldCheckIcon}
                title="Verification and moderation queues are clear"
                description="When a demo provider submits a profile or a review awaits moderation, it appears here with a direct action link."
              />
            ) : (
              <ul className="divide-y" aria-label="Pending verification and moderation">
                <QueueRow
                  title={`${hospitalQueue.length} hospitals awaiting verification review`}
                  meta="Hospital profiles with pending or unverified status"
                  status="pending"
                  href={ROUTES.admin.hospitals}
                  linkLabel="Review hospitals"
                />
                <QueueRow
                  title={`${doctorQueue.length} doctors with credentials to review`}
                  meta="Profiles or medical registrations not yet verified"
                  status="pending"
                  href={ROUTES.admin.doctors}
                  linkLabel="Review doctors"
                />
                <QueueRow
                  title={`${facilityQueue.length} facilities pending verification`}
                  meta="Diagnostic, specialty, rehab and wellness records"
                  status="pending"
                  href={ROUTES.admin.facilities}
                  linkLabel="Review facilities"
                />
                <QueueRow
                  title={`${moderationQueue.length} reviews awaiting moderation`}
                  meta="Pending or flagged patient reviews"
                  status="warning"
                  href={ROUTES.admin.reviews}
                  linkLabel="Open moderation queue"
                />
                {ratingQueueCount > 0 ? (
                  <QueueRow
                    title={`${ratingQueueCount} rating assessments need review`}
                    meta="CER/MER assessments in review or returned for changes"
                    status="under_review"
                    href={ROUTES.admin.ratings}
                    linkLabel="Open rating queue"
                  />
                ) : null}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Operations snapshot + trend metadata */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5">
                <ActivityIcon aria-hidden className="size-4 text-muted-foreground" />
                Operations snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="gap-3">
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Open appointment requests</span>
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    {appointmentQueue.length}
                    <Link
                      href={ROUTES.admin.appointments}
                      className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Queue
                      <span className="sr-only"> — open appointment requests</span>
                    </Link>
                  </span>
                </li>
                <li className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Unassigned tourism cases</span>
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    {unassignedTourism}
                    <Link
                      href={ROUTES.admin.medicalTourism}
                      className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Queue
                      <span className="sr-only"> — unassigned tourism cases</span>
                    </Link>
                  </span>
                </li>
                <li className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Partner accounts</span>
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    {partnerUsers.length}
                    <Link
                      href={ROUTES.admin.partners}
                      className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Manage
                      <span className="sr-only"> — partner accounts</span>
                    </Link>
                  </span>
                </li>
              </ul>
              <Separator />
              <p className="text-xs text-muted-foreground">
                Counts reconcile with the module queues — the enquiry action count
                covers records in submitted / under_review / assigned demo states.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5">
                <TrendingUpIcon aria-hidden className="size-4 text-muted-foreground" />
                Enquiry &amp; appointment trend (demo)
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Weekly counts derived from the demo fixtures — illustrative metadata,
                not live analytics. Values are record counts, never scores.
              </p>
            </CardHeader>
            <CardContent className="gap-4">
              <ul className="space-y-3" aria-label="Weekly demo trend">
                {trend.map((week) => (
                  <li key={week.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{week.label}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {week.enquiries} enquiries · {week.appointments} appointments
                      </span>
                    </div>
                    <div
                      className="flex h-2.5 gap-1 overflow-hidden rounded-full bg-muted"
                      role="img"
                      aria-label={`${week.label}: ${week.enquiries} enquiries and ${week.appointments} appointments (demo metadata)`}
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
              <p className="text-xs text-muted-foreground">
                Bar lengths are proportional to each week&apos;s fixture counts.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent platform activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <ClipboardListIcon aria-hidden className="size-4 text-muted-foreground" />
              Recent platform activity
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Newest demo events across enquiries, appointments, reviews, tourism
              cases and provider verification.
            </p>
          </CardHeader>
          <CardContent className="gap-0">
            {activity.length === 0 ? (
              <EmptyState
                icon={ActivityIcon}
                title="No recent demo activity"
                description="Demo enquiries, appointments and reviews will appear here as fixture records exist."
              />
            ) : (
              <ul className="divide-y" aria-label="Recent platform activity">
                {activity.map((item) => {
                  const ItemIcon = KIND_ICONS[item.kind]
                  return (
                    <li
                      key={item.id}
                      className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                          <ItemIcon aria-hidden className="size-4 text-muted-foreground" />
                        </span>
                        <div className="min-w-0 space-y-0.5">
                          <p className="truncate text-sm font-medium text-foreground">
                            {item.summary}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">{item.detail}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                        <time dateTime={item.at} className="text-xs text-muted-foreground">
                          {formatDateTime(item.at)}
                        </time>
                        {item.href ? (
                          <Link
                            href={item.href}
                            className="inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-4 hover:underline"
                          >
                            Open
                            <ArrowRightIcon aria-hidden className="size-3" />
                            <span className="sr-only"> — {item.summary}</span>
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

        {/* Shortcuts into the management modules */}
        <Card>
          <CardHeader>
            <CardTitle>Management shortcuts</CardTitle>
            <p className="text-sm text-muted-foreground">
              Jump into the admin modules owned by this workspace.
            </p>
          </CardHeader>
          <CardContent className="gap-2">
            <ShortcutLink
              href={ROUTES.admin.hospitals}
              icon={BuildingIcon}
              label="Hospital management"
              meta="Verification, profiles, accreditation"
            />
            <ShortcutLink
              href={ROUTES.admin.doctors}
              icon={StethoscopeIcon}
              label="Doctor management"
              meta="Credentials and registration review"
            />
            <ShortcutLink
              href={ROUTES.admin.facilities}
              icon={HospitalIcon}
              label="Facility management"
              meta="Diagnostic, specialty, wellness centres"
            />
            <ShortcutLink
              href={ROUTES.admin.patients}
              icon={UsersIcon}
              label="Patient records"
              meta="Privacy-conscious record lookup"
            />
            <ShortcutLink
              href={ROUTES.admin.partners}
              icon={HeartHandshakeIcon}
              label="Partner management"
              meta="Hospital & service-provider accounts"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function QueueRow({
  title,
  meta,
  status,
  href,
  linkLabel,
}: {
  title: string
  meta: string
  status: React.ComponentProps<typeof StatusBadge>["status"]
  href: string
  linkLabel: string
}) {
  return (
    <li className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{meta}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <StatusBadge status={status} />
        <Button
          variant="ghost"
          size="sm"
          render={<Link href={href} />}
          className="gap-1"
        >
          {linkLabel}
          <ArrowRightIcon aria-hidden className="size-3.5" />
          <span className="sr-only"> — {title}</span>
        </Button>
      </div>
    </li>
  )
}

function ShortcutLink({
  href,
  icon: Icon,
  label,
  meta,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  meta: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg border px-3 py-2.5 outline-none transition-colors hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
        <Icon aria-hidden className="size-4 text-primary" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">{label}</span>
        <span className="block truncate text-xs text-muted-foreground">{meta}</span>
      </span>
      <ArrowRightIcon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  )
}

/**
 * Build the demo weekly trend from fixture timestamps (consent dates for
 * enquiries, creation dates for appointments). Pure and deterministic —
 * labelled demo metadata in the UI, never presented as live analytics.
 */
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
    .map(([key, counts]) => ({ label: `${key} (demo)`, ...counts }))
}
