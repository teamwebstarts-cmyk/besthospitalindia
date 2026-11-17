/**
 * /doctor-portal — Doctor Dashboard (pages/57).
 *
 * One screen-level question: "what needs me today?" Composition per spec:
 * KPI row (appointment/consultation/profile counts + rating states), urgent
 * action queue (pending appointment requests), consultation queue, availability
 * summary, verification status. Totals reconcile with the underlying fixtures
 * because every number is derived from the same selectors the queues render.
 *
 * Server Component — the page reads frozen fixtures through pure selectors and
 * renders links; the only interactive queue actions live on their module pages.
 * RATINGS RULE: PER and MER KPIs are independent modules; MER has no approved
 * score in the demo session, so it renders "Not assessed" — never 0/5.
 */

import Link from "next/link"
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CircleUserIcon,
  ClipboardListIcon,
  ClockIcon,
  MessagesSquareIcon,
  ShieldCheckIcon,
  StarIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { VerificationBadge } from "@/features/providers/components/verification-badge"
import { RATING_LABELS, RATING_SCALE_MAX } from "@/constants/rating"
import { ROUTES } from "@/constants/routes"
import {
  appointmentsForDoctor,
  consultationQueueForDoctor,
  formatDate,
  formatDateTime,
  patientDisplayName,
  reviewsForDoctor,
  specialtyLabel,
  treatmentLabel,
} from "@/features/doctor-portal"
import { PortalPageHeader } from "@/features/doctor-portal/components/portal-page-header"
import { DoctorKpi } from "@/features/doctor-portal/components/doctor-kpi"
import { getSessionDoctor } from "@/features/doctor-portal/session"

// -- Queue rows -------------------------------------------------------------

const OPEN_APPOINTMENT_STATUSES = new Set(["requested", "under_review"])
const OPEN_CONSULTATION_STATUSES = new Set(["submitted", "under_review", "assigned"])

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

export default function DoctorDashboardPage() {
  const doctor = getSessionDoctor()

  // Fixture-not-found guard: renders the explicit error state (pages/22 §6)
  // instead of an exception or blank screen if the demo session id ever
  // fails to resolve.
  if (!doctor) {
    return (
      <div className="space-y-6 py-8">
        <PortalPageHeader items={[{ label: "Doctor Portal" }]} title="Dashboard" />
        <Card>
          <CardContent>
            <EmptyState
              icon={ShieldCheckIcon}
              title="Demo session could not be resolved"
              description="The demo doctor fixture behind this portal session is missing from the demo data. This is a fixture mismatch, not an account problem."
              action={{ label: "Open portal settings", href: ROUTES.doctorPortal.settings }}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  const appointmentQueue = appointmentsForDoctor(doctor.id)
  const openAppointments = appointmentQueue.filter((a) =>
    OPEN_APPOINTMENT_STATUSES.has(a.status),
  )
  const consultations = consultationQueueForDoctor(doctor.id)
  const openConsultations = consultations.filter((e) =>
    OPEN_CONSULTATION_STATUSES.has(e.status),
  )
  const doctorReviews = reviewsForDoctor(doctor.id)
  const per = doctor.ratings.per
  const mer = doctor.ratings.mer
  const hasAppointments = appointmentQueue.length > 0
  const hasConsultations = consultations.length > 0

  return (
    <div className="space-y-6 py-8">
      <PortalPageHeader
        items={[{ label: "Doctor Portal" }, { label: "Dashboard" }]}
        title={`Welcome, ${doctor.name}`}
        description="One view of your appointment requests, consultation queue, weekly availability and profile verification status. Use the queue links to act on a request."
        action={
          <Button render={<Link href={ROUTES.doctorPortal.appointments} />}>
            Manage appointment requests
          </Button>
        }
      />

      {/* KPI row — every value is derived from the fixtures the queues render. */}
      <section aria-label="Today at a glance" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DoctorKpi
          icon={CalendarDaysIcon}
          tone="info"
          label="Appointment requests"
          value={String(appointmentQueue.length)}
          hint={`${openAppointments.length} awaiting your response`}
          href={ROUTES.doctorPortal.appointments}
        />
        <DoctorKpi
          icon={MessagesSquareIcon}
          tone={openConsultations.length > 0 ? "warning" : "neutral"}
          label="Consultation queue"
          value={String(consultations.length)}
          hint={`${openConsultations.length} awaiting a status update`}
          href={ROUTES.doctorPortal.consultations}
        />
        <DoctorKpi
          icon={StarIcon}
          tone="info"
          label={RATING_LABELS.PER}
          value={per.score !== null ? `${per.score} / ${RATING_SCALE_MAX}` : "Not yet rated"}
          hint={`${per.sampleSize ?? 0} demo data points · ${formatDate(per.lastAssessedAt, "never assessed")}`}
          href={ROUTES.doctorPortal.reviews}
        />
        <DoctorKpi
          icon={StarIcon}
          tone="success"
          label={RATING_LABELS.MER}
          value={mer.score !== null ? `${mer.score} / ${RATING_SCALE_MAX}` : "Not assessed"}
          hint="Independent of PER — separate evidence track"
          href={ROUTES.doctorPortal.credentials}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Urgent action queue */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Appointment requests needing action</CardTitle>
            <p className="text-sm text-muted-foreground">
              Accept, reject or reschedule from the appointments module — changes are local
              demo state only.
            </p>
          </CardHeader>
          <CardContent className="gap-0">
            {hasAppointments ? (
              <ul className="divide-y">
                {appointmentQueue.map((appointment) => (
                  <QueueRow
                    key={appointment.id}
                    title={`${patientDisplayName(appointment.patientId)} — ${treatmentLabel(appointment.treatmentId) ?? "General consultation"}`}
                    meta={`${formatDate(appointment.preferredDate)} · ${appointment.mode === "in_person" ? "In person" : appointment.mode === "video" ? "Video" : "Phone"} · requested ${formatDateTime(appointment.createdAt)}`}
                    status={appointment.status}
                    href={ROUTES.doctorPortal.appointments}
                    linkLabel="Review"
                  />
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={CalendarDaysIcon}
                title="No appointment requests in the demo queue"
                description="New demo patient requests would appear here with accept / reject / reschedule controls."
                action={{ label: "Open availability settings", href: ROUTES.doctorPortal.availability }}
              />
            )}
          </CardContent>
        </Card>

        {/* Verification + availability summary */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile verification status</CardTitle>
            </CardHeader>
            <CardContent className="gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">Profile</span>
                <VerificationBadge status={doctor.verificationStatus} />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">Registration</span>
                <VerificationBadge status={doctor.registration.status} />
              </div>
              <Separator />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Registration authority: {doctor.registration.authority} · number{" "}
                <span className="font-mono">{doctor.registration.numberMasked}</span>
                (fictional demo registration; masked in all portal views).
              </p>
              <Button
                variant="outline"
                size="sm"
                render={<Link href={ROUTES.doctorPortal.credentials} />}
                className="self-start"
              >
                Review credentials
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5">
                <ClockIcon aria-hidden className="size-4 text-muted-foreground" />
                Weekly availability
              </CardTitle>
            </CardHeader>
            <CardContent className="gap-3">
              <p className="text-sm text-muted-foreground">
                Set and edit consulting hours and demo slots in the availability module.
              </p>
              <ul className="space-y-1.5 text-sm">
                <li className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Configured days</span>
                  <span className="font-medium text-foreground">0 of 7</span>
                </li>
              </ul>
              <Button
                variant="outline"
                size="sm"
                render={<Link href={ROUTES.doctorPortal.availability} />}
                className="self-start"
              >
                Edit availability
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Consultation queue */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <ClipboardListIcon aria-hidden className="size-4 text-muted-foreground" />
              Consultation queue
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Enquiries the demo coordination desk has pointed at your profile. Update the
              next-step status from the consultations module.
            </p>
          </CardHeader>
          <CardContent className="gap-0">
            {hasConsultations ? (
              <ul className="divide-y">
                {consultations.map((enquiry) => (
                  <QueueRow
                    key={enquiry.id}
                    title={`${enquiry.patientName} — ${specialtyLabel(enquiry.specialty)}`}
                    meta={`${enquiry.country} · preferred date ${formatDate(enquiry.preferredDate, "not stated")} · consent ${formatDateTime(enquiry.consentAt)}`}
                    status={enquiry.status}
                    href={ROUTES.doctorPortal.consultations}
                    linkLabel="Open"
                  />
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={CircleUserIcon}
                title="No consultations assigned to the demo profile"
                description="When the demo coordination desk assigns an enquiry to this doctor profile it appears here with an update-status control."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
