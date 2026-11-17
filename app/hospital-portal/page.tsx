import type { Metadata } from "next"
import Link from "next/link"
import {
  CalendarDaysIcon,
  FileTextIcon,
  MessagesSquareIcon,
  StarIcon,
} from "lucide-react"

import { DashboardKpi } from "@/features/hospital-portal/dashboard-kpi"
import { QueueList, type QueueItem } from "@/features/hospital-portal/queue-list"
import { PortalPageHeader } from "@/features/hospital-portal/portal-page-header"
import {
  buildDocumentRows,
  demoAppointments,
  demoEnquiries,
  demoReviews,
  getDemoHospital,
  openEnquiries,
  pendingAppointments,
  profileCompletion,
  reviewsAwaitingReply,
} from "@/features/hospital-portal/demo-context"
import { ROUTES } from "@/constants/routes"
import { doctorById, specialtyById } from "@/data"

/**
 * /hospital-portal — partner dashboard (pages/46).
 *
 * Server Component: scoped fixture selectors produce every number, so KPI
 * totals reconcile exactly with the queues below them and with the module
 * pages they link to (spec: "KPI totals reconcile; actions lead to routes").
 * The period filter is demo metadata — the underlying fixtures have fixed
 * dates, so the dashboard states the covered window instead of pretending to
 * refetch.
 */

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Hospital partner demo dashboard: open enquiries, pending appointment requests, profile completion and document verification attention (fictional demo data).",
}

/** Fixed demo "current date" so the dashboard is deterministic across deploys. */
const DEMO_TODAY = "2026-11-17"

export default function HospitalPortalDashboardPage() {
  const hospital = getDemoHospital()

  const enquiries = demoEnquiries()
  const openEnquiryList = openEnquiries()
  const appointmentQueue = demoAppointments()
  const pendingAppointmentList = pendingAppointments()
  const reviews = demoReviews()
  const replyQueue = reviewsAwaitingReply()
  const documentRows = buildDocumentRows(hospital, DEMO_TODAY)
  const completion = profileCompletion(hospital)

  const documentsNeedingWork = documentRows.filter((row) => {
    if (row.document.status === "expired" || row.document.status === "rejected") return true
    return row.document.status === "under_review" || row.document.status === "submitted"
  })

  const statusLabelFor = (patientName: string) => patientName

  // --- Queue items (dashboard-only projections of module-page records) ----

  const enquiryItems: QueueItem[] = openEnquiryList.map((enquiry) => ({
    id: enquiry.id,
    title: `${statusLabelFor(enquiry.patientName)} — ${specialtyById[enquiry.specialty]?.name ?? enquiry.specialty}`,
    meta: `${enquiry.id} · ${enquiry.country} · received ${formatDate(enquiry.consentAt)}`,
    status: enquiry.status,
    href: `${ROUTES.hospitalPortal.enquiries}?enquiry=${encodeURIComponent(enquiry.id)}`,
  }))

  const appointmentItems: QueueItem[] = pendingAppointmentList.map((appointment) => {
    const doctor =
      appointment.providerType === "doctor" ? doctorById[appointment.providerId] : undefined
    const target = doctor ? doctor.name : hospital.name
    return {
      id: appointment.id,
      title: `${appointment.patientId.replace("pat-demo-", "Patient (demo) ")} — ${target}`,
      meta: `${appointment.id} · ${formatDate(appointment.preferredDate)} · ${appointment.mode.replace("_", " ")}`,
      status: appointment.status,
      href: `${ROUTES.hospitalPortal.appointments}?request=${encodeURIComponent(appointment.id)}`,
    }
  })

  const replyItems: QueueItem[] = replyQueue.map((review) => ({
    id: review.id,
    title: review.title,
    meta: `${review.rating}/5 · ${formatDate(review.createdAt)}`,
    status: review.status,
    href: `${ROUTES.hospitalPortal.reviews}?review=${encodeURIComponent(review.id)}`,
  }))

  const documentItems: QueueItem[] = documentsNeedingWork.slice(0, 4).map((row) => ({
    id: row.document.id,
    title: row.document.name,
    meta: row.expiresAt
      ? `${row.document.status.replace("_", " ")} · expires ${formatDate(row.expiresAt)}`
      : row.document.status.replace("_", " "),
    status: row.document.status,
    href: `${ROUTES.hospitalPortal.documents}?document=${encodeURIComponent(row.document.id)}`,
  }))

  const noEnquiries = enquiries.length === 0
  const noAppointments = appointmentQueue.length === 0

  return (
    <div className="space-y-8">
      <PortalPageHeader
        label="Dashboard"
        description={`Operational overview for ${hospital.name} — a fictional demo provider. Numbers are derived from the demo fixtures and reconcile with each module page.`}
      />

      {/* KPI row — every value is computed from the same scoped selectors the
          queues use, so totals always reconcile. */}
      <section aria-label="Key numbers" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardKpi
          label="Open enquiries"
          value={String(openEnquiryList.length)}
          hint={`${enquiries.length} total in demo queue`}
          icon={MessagesSquareIcon}
          href={ROUTES.hospitalPortal.enquiries}
        />
        <DashboardKpi
          label="Appointment requests"
          value={String(pendingAppointmentList.length)}
          hint={`${appointmentQueue.length} total in demo queue`}
          icon={CalendarDaysIcon}
          href={ROUTES.hospitalPortal.appointments}
        />
        <DashboardKpi
          label="Profile completion"
          value={`${completion.percent}%`}
          hint={`${completion.completed} of ${completion.total} demo checks complete`}
          icon={FileTextIcon}
          href={ROUTES.hospitalPortal.profile}
        />
        <DashboardKpi
          label="Reviews to answer"
          value={String(replyQueue.length)}
          hint={`${reviews.length} published reviews in demo set`}
          icon={StarIcon}
          href={ROUTES.hospitalPortal.reviews}
        />
      </section>

      {/* Verification + completion attention strip */}
      <section
        aria-label="Verification and profile attention"
        className="grid gap-4 lg:grid-cols-2"
      >
        <div className="rounded-xl bg-card p-6 shadow-xs ring-1 ring-foreground/10">
          <h2 className="font-heading text-base font-semibold">Profile completion (demo)</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Demo metadata derived from the hospital fixture — not a platform rule.
          </p>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={completion.percent}
            aria-label="Profile completion (demo)"
            className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${completion.percent}%` }}
            />
          </div>
          <ul className="mt-4 grid gap-1.5 text-sm sm:grid-cols-2">
            {completion.checks.map((check) => (
              <li key={check.label} className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={
                    check.complete
                      ? "size-1.5 rounded-full bg-success"
                      : "size-1.5 rounded-full bg-warning"
                  }
                />
                <span className={check.complete ? "text-foreground" : "text-muted-foreground"}>
                  {check.label}
                  <span className="sr-only">
                    {check.complete ? " — complete" : " — incomplete"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <Link
            href={ROUTES.hospitalPortal.profile}
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Edit profile
            <span className="sr-only"> — open profile editor</span>
          </Link>
        </div>

        <div className="rounded-xl bg-card p-6 shadow-xs ring-1 ring-foreground/10">
          <h2 className="font-heading text-base font-semibold">Document verification</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Statuses come from the demo checklist; only admin review can set a document to
            verified.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {documentItems.length === 0 ? (
              <li className="text-muted-foreground">No document attention items in the demo set.</li>
            ) : (
              documentItems.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-foreground">{item.title}</span>
                  <Link
                    href={item.href}
                    className="shrink-0 text-xs font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Review
                    <span className="sr-only"> — {item.title}</span>
                  </Link>
                </li>
              ))
            )}
          </ul>
          <Link
            href={ROUTES.hospitalPortal.documents}
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Open documents
            <span className="sr-only"> — open the documents module</span>
          </Link>
        </div>
      </section>

      {/* Action queues */}
      <section aria-label="Action queues" className="grid gap-4 lg:grid-cols-2">
        <QueueList
          title="Enquiries needing action"
          items={enquiryItems}
          emptyTitle={noEnquiries ? "No enquiries in the demo set" : "No open enquiries"}
          emptyDescription="Enquiry records appear here while their status is submitted, under review or assigned."
        />
        <QueueList
          title="Appointment requests to answer"
          items={appointmentItems}
          emptyTitle={noAppointments ? "No appointment requests in the demo set" : "Nothing pending"}
          emptyDescription="Requested and under-review appointment records appear here until they are answered."
        />
        <QueueList
          title="Reviews awaiting reply"
          items={replyItems}
          emptyTitle="No published reviews without a reply"
          emptyDescription="Published patient reviews you have not replied to appear here. Replies stay local drafts in the demo."
        />
        <QueueList
          title="Documents needing attention"
          items={documentItems}
          emptyTitle="No document attention items"
          emptyDescription="Pending, expired or expiring demo documents appear here."
        />
      </section>

      <p className="text-xs text-muted-foreground">
        Demo window: fixture data reflects the fictional period around {formatDate(DEMO_TODAY)}.
        Period filtering on the dashboard is demo metadata; module pages show the full fixture
        queue.
      </p>
    </div>
  )
}

/** Medium-date formatter (en-IN) shared by dashboard meta lines. */
function formatDate(iso: string): string {
  const parsed = new Date(iso)
  return Number.isNaN(parsed.getTime())
    ? iso
    : parsed.toLocaleDateString("en-IN", { dateStyle: "medium" })
}
